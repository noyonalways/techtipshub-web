/**
 * The paths for the two filtered views of the feed.
 *
 * The landing page is prerendered, and reading `?search=`/`?category=` there
 * would mean rendering it per request. So a filter is a real URL instead:
 *
 *   /search?q=<term>              articles matching a search term
 *   /categories/<category-name>   one category, newest first
 *
 * Both are their own routes, generated and cached like every other page.
 */

/** Categories whose name survives as a path segment unchanged. */
const isPlainName = (name: string) => /^[a-z0-9][a-z0-9-]*$/.test(name);

/** The slug a category is addressed by: its name, lowercased, hyphenated. */
export const categorySlug = (name: string) =>
  name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

/** The category's own URL, or the feed when the name cannot be a path. */
export const categoryPath = (name: string) => {
  const slug = categorySlug(name);
  return isPlainName(slug) && slug ? `/categories/${slug}` : "/";
};

/** `/search?q=...`, or the feed when there is nothing to search for. */
export const searchPath = (term?: string | null) => {
  const trimmed = term?.trim();
  return trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : "/";
};
