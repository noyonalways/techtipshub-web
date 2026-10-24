import { revalidateTag, unstable_cache } from "next/cache";

/**
 * The `updatedAt` each article page was last rendered with.
 *
 * An article page is prerendered with `generateStaticParams`, and from then on
 * it is served from the CDN. `generateMetadata` and the page itself receive the
 * `params` Next stored at build time, so that object is how a request tells a
 * page which version of the article it was built from — and the cache entries
 * that rebind a page to fresher data are kept under the same key.
 *
 * Why the key looks up two layers of caching:
 *
 * - `unstable_cache` is persistent: Vercel keeps it alongside the prerendered
 *   pages, so after a cold start a page still links back to its own data.
 * - An in-process map is kept beside it, because `unstable_cache` lives in
 *   Next's own incremental cache, which a self-hosted `next start` points at a
 *   location that is not available while `next build` is writing pages. During
 *   a build the `.next/cache` writes are skipped and reads miss; the map has
 *   the answer every time.
 *
 * The value is only a `updatedAt` string, and a miss only costs one fetch.
 */

const renderedAt = new Map<string, string>();

const persistentRenderedAt = unstable_cache(
  async (slug: string) => renderedAt.get(slug) ?? null,
  ["article-rendered-at"],
  { tags: ["articleRenders"] },
);

/** The `updatedAt` `slug`'s page was rendered with, if it has been seen. */
export const lastRenderedAt = async (slug: string) => {
  const inProcess = renderedAt.get(slug);
  if (inProcess) return inProcess;

  const stored = await persistentRenderedAt(slug).catch(() => null);
  if (stored) renderedAt.set(slug, stored);
  return stored ?? null;
};

/** Remember the `updatedAt` `slug`'s page is now rendered with. */
export const rememberRenderedAt = (slug: string, updatedAt: string) => {
  renderedAt.set(slug, updatedAt);
};

/**
 * Forget every article's rendered version, so each page fetches the article
 * again on its next render.
 *
 * Called when an article is created, edited or deleted: the `updatedAt` an
 * existing page holds is then out of date, and the page rebinds to the new
 * data instead of waiting for its revalidation timer.
 */
export const forgetRenderedArticles = () => {
  renderedAt.clear();
  try {
    revalidateTag("articleRenders", { expire: 0 });
  } catch {
    // Outside a request scope (a script or a build): nothing to expire yet.
  }
};
