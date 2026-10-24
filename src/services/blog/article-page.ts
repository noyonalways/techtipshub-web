import "server-only";

import envConfig from "@/config/env.config";
import { lastRenderedAt, rememberRenderedAt } from "@/lib/article-renders";
import { allBlogsForBuild } from "@/lib/blog-index";
import { bottomUpRevalidate } from "@/lib/bottom-up-revalidate";
import { decodeSlug } from "@/lib/slug";
import type { IBlog } from "@/types";
import type { IComment } from "@/types/comment.type";

/**
 * The data an article page reads.
 *
 * The rules, in one place:
 *
 * - The API sends the whole article to everyone; whether a reader sees the body
 *   is decided when the page is rendered, not when it was requested (see
 *   `lib/article-access`).
 * - An article page is prerendered with `generateStaticParams`, so it is served
 *   from the CDN. The request that renders it is handed the `params` Next
 *   stored at build time, and that is how the page knows which version of the
 *   article it was built from.
 * - That version is normally the current one: the build fetched the article and
 *   baked it in, and the page reads it back from the build index without
 *   touching the API. Only an article that changed after the build (an edit, a
 *   new comment, a publish) costs a request.
 * - Fresh data is never written to the build's own cache entry: it is let in
 *   under its own `updatedAt`, through `unstable_cache`, which is the
 *   documented place to fetch uncached data (a `no-store` fetch on the page
 *   itself would make the whole route dynamic).
 */

export interface ArticlePage {
  /** `undefined` when no article has that slug. */
  blog?: IBlog;
  /** The `updatedAt` the page is rendered under: the cache version. */
  updatedAt?: string;
  comments: IComment[];
}

const publicArticleUrl = (slug: string) =>
  `${envConfig.baseApi}/blogs/${encodeURIComponent(slug)}`;

const commentsUrl = (blogId: string) =>
  `${envConfig.baseApi}/blogs/${blogId}/comments?limit=100`;

/**
 * One request to the API, read fresh.
 *
 * `force-cache` with a short revalidate is not a request to share the answer:
 * inside `unstable_cache` the answer is stored under the version key, which is
 * new whenever anything changed. It only tells Next not to treat the call as
 * request-bound.
 */
const readApi = async <T>(url: string): Promise<T | undefined> => {
  try {
    const res = await fetch(url, {
      cache: "force-cache",
      next: { revalidate: 1800 },
    });

    if (!res.ok) return undefined;
    return (await res.json()) as T;
  } catch {
    return undefined;
  }
};

/** A published article, straight from the API. */
const fetchArticle = async (slug: string) => {
  const body = await readApi<{ data?: IBlog }>(publicArticleUrl(slug));
  return body?.data;
};

/** A published article's comments, straight from the API. */
const fetchComments = async (blogId: string) => {
  const body = await readApi<{ data?: IComment[] }>(commentsUrl(blogId));
  return (body?.data ?? []).filter((comment) => !comment.isDeleted);
};

/**
 * The article and its comments as of `version`, cached under that version.
 *
 * Nothing is cached for a missing article, so a slug that is being published
 * concurrently is asked for again rather than remembered as missing.
 */
const loadVersion = (slug: string, version: string) =>
  bottomUpRevalidate<ArticlePage>(`article:${slug}:${version}`, async () => {
    const blog = await fetchArticle(slug);
    if (!blog) return undefined;

    return { blog, updatedAt: version, comments: await fetchComments(blog._id) };
  });

/**
 * An article's comments, read for a page rendered at `version`.
 *
 * Comments do not change an article's `updatedAt`, so their own cache entry is
 * expired by tag when one is added, edited or removed.
 */
const readComments = async (blogId: string, version: string) => {
  const comments = await bottomUpRevalidate<IComment[]>(
    `comments:${blogId}:${version}`,
    () => fetchComments(blogId),
  );
  return comments ?? [];
};

/**
 * Figure out which version of the article this render is for, and load it.
 *
 * `builtAsOf` is the `updatedAt` in the page's stored `params`, i.e. the
 * version the prerendered page already contains. `undefined` means the request
 * reached a page that was not prerendered (a new slug, or a render after the
 * render cache forgot it).
 */
const readArticle = async (
  slug: string,
  builtAsOf?: string,
): Promise<ArticlePage> => {
  const decoded = decodeSlug(slug);
  const { bySlug } = await allBlogsForBuild();
  const indexed = bySlug.get(decoded);

  // The build already has this version: render from its own copy, so a visit
  // costs nothing and the page stays a plain static page.
  if (indexed && builtAsOf && indexed.updatedAt === builtAsOf) {
    rememberRenderedAt(decoded, builtAsOf);
    return {
      blog: indexed as unknown as IBlog,
      updatedAt: builtAsOf,
      comments: await readComments(indexed._id, builtAsOf),
    };
  }

  // The page has no version yet, or the version it had was forgotten because
  // something changed. Read the current article and bind the page to it.
  const known = (await lastRenderedAt(decoded)) ?? builtAsOf ?? null;
  const cached = known ? await loadVersion(decoded, known) : undefined;

  if (cached) {
    rememberRenderedAt(decoded, known!);
    return {
      ...cached,
      comments: await readComments(cached.blog!._id, known!),
    };
  }

  const blog = await fetchArticle(decoded);
  if (!blog) return { comments: [] };

  const version = blog.updatedAt ?? builtAsOf ?? "initial";
  rememberRenderedAt(decoded, version);

  const page =
    (await loadVersion(decoded, version)) ?? {
      blog,
      updatedAt: version,
      comments: await fetchComments(blog._id),
    };

  return {
    ...page,
    comments: await readComments(page.blog!._id, page.updatedAt ?? "initial"),
  };
};

/** Everything `/blogs/[slug]` needs, for all three of its renderers. */
export const getArticlePage = async (
  slug: string,
  builtAsOf?: string,
): Promise<ArticlePage> => readArticle(slug, builtAsOf);
