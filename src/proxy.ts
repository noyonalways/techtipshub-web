import { NextRequest, NextResponse } from "next/server";
import { jwtDecode } from "jwt-decode";

const ACCESS_TOKEN_COOKIE = "tth_access_token";
const REFRESH_TOKEN_COOKIE = "tth_refresh_token";

// Renew a little before expiry so a request never races it.
const RENEW_BEFORE_SECONDS = 60;

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

const baseApi = (
  process.env.NEXT_PUBLIC_BASE_API ?? "http://localhost:5000/api/v1"
).replace(/\/$/, "");

interface ITokenClaims {
  exp?: number;
}

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
 * Keeps a signed-in session alive past the access token's lifetime.
 *
 * The access token lasts two days and the refresh token thirty, and the API
 * only exchanges a still-valid refresh token. Without this, every page render
 * after day two sent an expired access token, the API answered 401, and server
 * components treated a signed-in member as signed out — manage-blogs showed
 * "No articles yet" to someone with 23.
 *
 * Renewing here (a place Next allows cookies to be written, unlike a page
 * render) means pages, route handlers and server actions all receive a valid
 * token from the first byte.
 */
export async function proxy(request: NextRequest) {
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  if (!isStale(accessToken)) return NextResponse.next();

  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

  // Nothing usable left: let the app run as a signed-out visitor, or keep the
  // dying access token so the page can still say what happened.
  if (!refreshToken || isStale(refreshToken)) return NextResponse.next();

  let renewed: string | undefined;
  try {
    const res = await fetch(`${baseApi}/auth/refresh-token`, {
      method: "POST",
      cache: "no-store",
      headers: { cookie: `refreshToken=${refreshToken}` },
    });
    if (res.ok) {
      const body = await res.json();
      renewed = body?.data?.accessToken;
    }
  } catch {
    renewed = undefined;
  }

  if (!renewed) return NextResponse.next();

  // The page below renders from the request's own cookies, so the renewed token
  // goes on both the request and the response.
  request.cookies.set(ACCESS_TOKEN_COOKIE, renewed);

  const response = NextResponse.next({ request });
  response.cookies.set(ACCESS_TOKEN_COOKIE, renewed, {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });

  return response;
}

export const config = {
  // Pages and API routes only; static assets and image optimisation carry
  // no session and should never wait on a token call.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|woff2?)$).*)"],
};
