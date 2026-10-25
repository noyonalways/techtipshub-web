import { requiresSession } from "@/lib/blog-routes";
import { NextRequest, NextResponse } from "next/server";
import { jwtDecode } from "jwt-decode";

const ACCESS_TOKEN_COOKIE = "tth_access_token";
const REFRESH_TOKEN_COOKIE = "tth_refresh_token";

/**
 * User agents that never run the browser (see `ArticleAccess`).
 *
 * They are sent to the article's preview variant, which is the server-rendered
 * copy with real article text and the canonical URL. Handing them the plain
 * address would show a page whose body waits on a reader check they cannot
 * run.
 */
const ARTICLE_PATH = /^\/blogs\/[^/]+$/;
const PREVIEW_PARAM = "view";
const PREVIEW_VALUE = "preview";
const CRAWLER_PATTERN =
  /bot\b|bot\/|crawl|spider|slurp|\bba[iy]du\b|yandex|duckduck|facebookexternalhit|facebot|twitterbot|linkedinbot|embedly|pinterest|telegrambot|applebot|ia_archiver|google-?other|chrome-lighthouse|headlesschrome|phantomjs/i;

// Renew a little before expiry so a request never races it.
const RENEW_BEFORE_SECONDS = 60;

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

const baseApi = (
  process.env.NEXT_PUBLIC_BASE_API ?? "http://localhost:5000/api/v1"
).replace(/\/$/, "");

interface ITokenClaims {
  exp?: number;
  role?: string;
}

/** The admin shell is only rendered for a token that carries the Admin role. */
const isAdminPath = (pathname: string) =>
  pathname === "/admin" || pathname.startsWith("/admin/");

/**
 * The browser-side admin API (`src/app/api/admin/[...path]/route.ts`) spends
 * the session cookie, so it is held to the same Admin-role rule as the pages.
 */
const isAdminApiPath = (pathname: string) => pathname.startsWith("/api/admin/");

const roleOf = (token?: string): string | undefined => {
  if (!token || token.split(".").length !== 3) return undefined;
  try {
    return jwtDecode<ITokenClaims>(token).role;
  } catch {
    return undefined;
  }
};

const expiresAt = (token?: string): number | undefined => {
  if (!token || token.split(".").length !== 3) return undefined;
  try {
    return jwtDecode<ITokenClaims>(token).exp;
  } catch {
    return undefined;
  }
};

const isStale = (token?: string) =>
  (expiresAt(token) ?? 0) - Date.now() / 1000 <= RENEW_BEFORE_SECONDS;

/**
 * Old addresses for the article editor.
 *
 * The composer and the editor have both moved over time:
 * `/settings/update/<slug>` → `/settings/edit/<slug>` → `/me/blogs/<slug>/edit`,
 * and `/write-blog` → `/me/blogs/new`. Every one of them still redirects, so
 * bookmarks, shared links and search results keep working.
 *
 * The two renamed public pages (`/about-us`, `/contact-us`) redirect from
 * `src/app/…/route.ts` instead, which sees the request before the router
 * normalises a trailing slash.
 */
const LEGACY_REDIRECTS: { prefix: string; to: (rest: string) => string }[] = [
  {
    prefix: "/settings/update/",
    to: (slug) => `/me/blogs/${slug}/edit`,
  },
  {
    prefix: "/settings/edit/",
    to: (slug) => `/me/blogs/${slug}/edit`,
  },
  // Admin screens used to live under /settings. Each old address lands on the
  // screen that replaced it, so existing bookmarks and links keep working.
  {
    prefix: "/settings/admin/manage-blogs",
    to: () => "/admin/manage-blogs",
  },
  {
    prefix: "/settings/admin/manage-users",
    to: () => "/admin/manage-users",
  },
  {
    prefix: "/settings/admin/dashboard",
    to: () => "/admin/dashboard",
  },
];

const LEGACY_EXACT: Record<string, string> = {
  "/write-blog": "/me/blogs/new",
  "/settings/admin": "/admin/dashboard",
  "/admin": "/admin/dashboard",
};

/** Keeps a signed-in session alive past the access token's lifetime. */
async function renewAccessToken(request: NextRequest) {
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

  // Nothing usable left: let the app run as a signed-out visitor, or keep the
  // dying access token so the page can still say what happened.
  if (!refreshToken || isStale(refreshToken)) return null;

  try {
    const res = await fetch(`${baseApi}/auth/refresh-token`, {
      method: "POST",
      cache: "no-store",
      headers: { cookie: `refreshToken=${refreshToken}` },
    });
    if (!res.ok) return null;
    const body = await res.json();
    return (body?.data?.accessToken as string | undefined) ?? null;
  } catch {
    return null;
  }
}

const withAccessToken = (response: NextResponse, token: string) => {
  response.cookies.set(ACCESS_TOKEN_COOKIE, token, {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
  return response;
};

/**
 * Session handling for the whole app.
 *
 * The access token lasts two days and the refresh token thirty, and the API
 * only exchanges a still-valid refresh token. Without this, every page render
 * after day two sent an expired access token, the API answered 401, and server
 * components treated a signed-in member as signed out — manage-blogs showed
 * "No articles yet" to someone with 23.
 *
 * Renewing here (a place Next allows cookies to be written, unlike a page
 * render) means pages, route handlers and server actions all receive a valid
 * token from the first byte. The account area (the article list and the
 * composer) also checks the token before rendering, so a signed-out visitor
 * gets the login page instead of an editor that cannot save.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Old addresses, before anything else touches the request.
  const legacy = LEGACY_REDIRECTS.find((entry) =>
    pathname.startsWith(entry.prefix),
  );
  if (legacy) {
    const url = request.nextUrl.clone();
    url.pathname = legacy.to(pathname.slice(legacy.prefix.length));
    return NextResponse.redirect(url, 308);
  }

  const legacyExact = LEGACY_EXACT[pathname.replace(/\/$/, "")];
  if (legacyExact) {
    const url = request.nextUrl.clone();
    url.pathname = legacyExact;
    return NextResponse.redirect(url, 308);
  }

  // 1b. An article, to a crawler or link unfurl: point it at the preview
  // variant, which carries the article text server-side and is the canonical
  // address in the page metadata. Action requests are left alone: they are not
  // page reads, and rewriting them would put the preview variant in the answer.
  const isArticle = ARTICLE_PATH.test(pathname.replace(/\/$/, ""));
  const userAgent = request.headers.get("user-agent") ?? "";
  const isAction = request.headers.has("next-action");
  if (
    isArticle &&
    !isAction &&
    request.method === "GET" &&
    CRAWLER_PATTERN.test(userAgent) &&
    request.nextUrl.searchParams.get(PREVIEW_PARAM) !== PREVIEW_VALUE
  ) {
    const url = request.nextUrl.clone();
    url.searchParams.set(PREVIEW_PARAM, PREVIEW_VALUE);
    return NextResponse.rewrite(url);
  }

  // 2. A live access token needs no work, beyond the admin role check.
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  if (!isStale(accessToken)) {
    if (isAdminApiPath(pathname) && roleOf(accessToken) !== "Admin") {
      return NextResponse.json(
        { success: false, message: "Admin access required" },
        { status: 403 },
      );
    }
    if (isAdminPath(pathname) && roleOf(accessToken) !== "Admin") {
      return NextResponse.redirect(new URL("/", request.nextUrl));
    }
    return NextResponse.next();
  }

  // 3. Renew it, and hand the fresh one to the page as well as the browser.
  const renewed = await renewAccessToken(request);
  if (!renewed) {
    // Still signed out: the account area and the article editor send the
    // visitor to log in and come back to exactly where they were. The composer
    // is open to guests on purpose — it is kept in the browser, and publishing
    // is what asks them to sign in.
    if (isAdminApiPath(pathname)) {
      return NextResponse.json(
        { success: false, message: "Not signed in" },
        { status: 401 },
      );
    }
    if (isAdminPath(pathname) || requiresSession(pathname)) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.search = "";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // The page below renders from the request's own cookies, so the renewed token
  // goes on both the request and the response.
  request.cookies.set(ACCESS_TOKEN_COOKIE, renewed);

  if (isAdminApiPath(pathname) && roleOf(renewed) !== "Admin") {
    return NextResponse.json(
      { success: false, message: "Admin access required" },
      { status: 403 },
    );
  }

  // The renewed token is the one that gets honoured below, so the admin check
  // reads it rather than the expired cookie.
  if (isAdminPath(pathname) && roleOf(renewed) !== "Admin") {
    return NextResponse.redirect(new URL("/", request.nextUrl));
  }

  return withAccessToken(NextResponse.next({ request }), renewed);
}

export const config = {
  // Pages and API routes only; static assets and image optimisation carry
  // no session and should never wait on a token call.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|woff2?)$).*)",
  ],
};
