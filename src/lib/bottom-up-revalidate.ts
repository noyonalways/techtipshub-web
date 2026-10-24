import { unstable_cache } from "next/cache";
import "server-only";

/**
 * Cache one article's data under its version.
 *
 * The key is the version itself (`article:<slug>:<updatedAt>`), so a render
 * asks for exactly the data it was built for — never "whatever is cached for
 * this slug now". That is what makes it safe for a static page to fetch: an
 * edit marks the page stale, the render asks for a version that does not exist
 * yet and so really fetches, while every other article keeps its plain static
 * render.
 *
 * `load` should return `undefined` when the API has no answer; nothing is
 * cached in that case, so the next render asks again.
 */
export const bottomUpRevalidate = async <T>(
  key: string,
  load: () => Promise<T | undefined>,
): Promise<T | undefined> => {
  const cached = unstable_cache(load, ["article-data", key], {
    tags: ["articleData"],
    revalidate: 1800,
  });

  return cached();
};
