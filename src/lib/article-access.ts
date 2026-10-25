/**
 * How much of an article a reader is allowed to see, and where the parts of
 * that decision live.
 *
 * Every article page is prerendered with the whole body in it and served from
 * the CDN. Whether a particular visitor sees that body is decided after the
 * document arrives, on the server, from the visitor's own session — see
 * `ArticleAccess`. The response as a whole stays a plain static document, so
 * the CDN keeps serving it to everyone.
 *
 * If that check cannot be reached (scripting off, or an older cached document
 * without it), the visitor is shown the members prompt rather than the
 * article: the cached page carries the body for members, not for the public.
 */

/** How much of an article a visitor gets. */
export type ArticleView = "guest" | "member";

/**
 * The `?view=preview` variant of an article URL.
 *
 * This is what search engines are pointed at. They never run the reader check,
 * so on the plain URL they would be handed the bare page — a page with no
 * article text. The preview is rendered on the server with the introduction
 * and nothing after it, so the indexable page has real content while the full
 * body stays for members.
 */
export const ARTICLE_PREVIEW_PARAM = "view";
export const ARTICLE_PREVIEW_VALUE = "preview";

/** The indexable address of an article. */
export const articlePreviewPath = (slug: string) =>
  `/blogs/${encodeURIComponent(slug)}?${ARTICLE_PREVIEW_PARAM}=${ARTICLE_PREVIEW_VALUE}`;
