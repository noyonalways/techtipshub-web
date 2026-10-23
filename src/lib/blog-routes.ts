/**
 * The URLs of the article editor, in one place.
 *
 * Both screens render the same composer, so they share one path shape:
 *
 *   /me/blogs/new           write a post
 *   /me/blogs/<slug>/edit   edit a post
 *
 * Reading that pair left to right says what it is ("my blogs", this one, edit),
 * the article keeps the same slug it is published under, and neither URL has an
 * id in it. Anything that links to the editor goes through the helpers here so
 * the pair cannot drift apart.
 */

/** The article composer: `new` for a fresh post, otherwise `/<slug>/edit`. */
export const writeBlogPath = "/me/blogs/new";

export const editBlogPath = (slug: string) =>
  `/me/blogs/${encodeURIComponent(slug)}/edit`;

/** The signed-in member's article list. */
export const manageBlogsPath = "/me/blogs";

/**
 * Standalone routes that live under `/me/blogs` without being an article.
 * A slug never resolves to one of these there.
 */
export const RESERVED_BLOG_SLUGS = ["new", "edit"] as const;

/**
 * `/me` is the account area, so everything below it needs a session
 * (`proxy.ts` and `protectedRoutes` both read this list).
 */
export const PROTECTED_AREAS = ["/me", writeBlogPath, manageBlogsPath];

/** Paths that still have to render while signed out. */
const OPEN_UNDER_ME = new Set(["/me/blogs/new"]);

/** Whether `pathname` may only be reached while signed in. */
export const requiresSession = (pathname: string) =>
  PROTECTED_AREAS.some(
    (area) => pathname === area || pathname.startsWith(`${area}/`),
  ) && !OPEN_UNDER_ME.has(pathname);

/**
 * Where to send the writer after signing in, from a `?redirect=` value.
 *
 * Only same-origin paths are accepted; anything else falls back to the feed,
 * so a crafted link cannot bounce a member to another site. Accepts the
 * leading-slash form (`/me/blogs/new`) as well as the slash-less form used by
 * some of the older links (`blogs/slug`).
 */
export const safeRedirectPath = (raw: string | null | undefined) => {
  if (!raw) return "/";
  const path = raw.startsWith("/") ? raw : `/${raw}`;
  // Protocol-relative (`//evil.example`) is a different origin.
  if (path.startsWith("//")) return "/";
  return path;
};
