/**
 * A route segment as the value it stands for.
 *
 * Next hands a dynamic segment to the page percent-encoded: `/blogs/<slug>`
 * for an article with Bengali or emoji in its slug arrives as
 * `%E0%A6%A1...`, and `testing-the-article-editor,-revised` arrives as
 * `testing-the-article-editor%2C-revised`. The API and the database know the
 * raw value, so decode once at the boundary and use the result everywhere.
 *
 * `decodeURIComponent` throws on malformed input (`%zz`); a segment like that
 * is not a valid address, so it is passed through and the lookup fails as a
 * missing article rather than a crashed page.
 */
export const decodeSlug = (segment: string): string => {
  if (!segment.includes("%")) return segment;

  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
};
