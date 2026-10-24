import type { IBlog } from "@/types";

/**
 * Build-time reads of the article list.
 *
 * `generateStaticParams` and `generateMetadata` both need the same rows, and
 * both run during a build where a burst of duplicate requests to the API would
 * only slow it down. One fetch, one cache, one entry per page of results, for
 * the length of the build.
 *
 * The build reads `BASE_API` (the API's own origin), not the app's `/api`
 * proxy: prerendering happens on the build machine, outside a browser request.
 */
const baseApi = () => (process.env.BASE_API ?? "").replace(/\/$/, "");

/** The API accepts generous limits, but a build should not ask for one. */
const PAGE_SIZE = 100;

type BlogListRow = Pick<
  IBlog,
  "slug" | "title" | "content" | "updatedAt" | "createdAt" | "tags"
> & {
  coverImage?: string;
  author?: { fullName?: string; username?: string };
};

type BlogListAnswer = {
  data?: BlogListRow[] | { result?: BlogListRow[] };
  meta?: { totalPages?: number; total?: number };
};

type IndexedBlogs = {
  rows: BlogListRow[];
  bySlug: Map<string, BlogListRow>;
};

let index: Promise<IndexedBlogs> | null = null;

const load = async (): Promise<IndexedBlogs> => {
  const rows: BlogListRow[] = [];
  const seen = new Set<string>();
  const base = baseApi();

  if (base) {
    let page = 1;
    let totalPages = 1;

    do {
      try {
        const res = await fetch(`${base}/blogs?limit=${PAGE_SIZE}&page=${page}`, {
          cache: "force-cache",
          next: { tags: ["allBlogs"], revalidate: 3600 },
        });

        if (!res.ok) break;

        const body = (await res.json()) as BlogListAnswer;
        const pageRows = Array.isArray(body.data)
          ? body.data
          : Array.isArray(body.data?.result)
            ? body.data.result
            : [];

        for (const row of pageRows) {
          if (!row.slug || seen.has(row.slug)) continue;
          seen.add(row.slug);
          rows.push(row);
        }

        totalPages = body.meta?.totalPages ?? 1;
      } catch {
        // A build without the API still has to finish: it produces the static
        // pages it can and leaves the rest to render on first request.
        break;
      }

      page += 1;
    } while (page <= totalPages);
  }

  return {
    rows,
    bySlug: new Map(rows.map((row) => [row.slug, row])),
  };
};

/** Every published article, fetched once per build. */
export const allBlogsForBuild = () => {
  index ??= load();
  return index;
};

/** Prerender inputs for `/blogs/[slug]`. */
export const blogStaticParams = async () => {
  const { rows } = await allBlogsForBuild();
  return rows.map((row) => ({ slug: row.slug }));
};

/** One article by slug, as the list endpoint returned it. */
export const blogForBuild = async (slug: string) => {
  const { bySlug } = await allBlogsForBuild();
  return bySlug.get(slug);
};
