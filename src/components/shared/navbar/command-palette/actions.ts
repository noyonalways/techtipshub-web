"use server";

import envConfig from "@/config/env.config";
import { ICategory, IBlog, IUser } from "@/types";
import { toSearchTerms } from "./match";

/**
 * Everything the search palette asks the API for.
 *
 * Server actions rather than a route handler: the palette is a client
 * component, so the head of every article (title, slug, author, category) is
 * picked out here, next to the request, instead of being shipped raw.
 *
 * Every function resolves; a failed request returns an empty list and a flag
 * rather than throwing, because the palette has a "could not load" state that
 * needs to know the difference between "nothing matched" and "the request
 * broke".
 */

export interface CommandBlog {
  _id: string;
  title: string;
  slug: string;
  category: string;
  author: IUser["username"];
}

export interface BlogSearchResult {
  blogs: CommandBlog[];
  failed: boolean;
}

const toCommandBlog = (blog: IBlog): CommandBlog => ({
  _id: blog._id,
  title: blog.title,
  slug: blog.slug,
  category: blog.category?.name ?? "",
  author: blog.author?.username ?? "",
});

const asArray = <T,>(value: unknown): T[] =>
  Array.isArray(value) ? (value as T[]) : [];

/**
 * Articles for the free-text query.
 *
 * A multi-word query is sent as one `searchTerm`, which the API turns into an
 * AND of case-insensitive regexes, so "react hooks" does not miss an article
 * titled "Hooks in React". Results come back newest first, which is what the
 * list shows.
 */
export const searchArticles = async (
  query: string,
  limit = 6,
): Promise<BlogSearchResult> => {
  const term = toSearchTerms(query);
  if (term === "__ALL__") return { blogs: [], failed: false };

  try {
    const url = new URL(`${envConfig.baseApi}/blogs`);
    url.searchParams.set("searchTerm", term);
    url.searchParams.set("limit", String(limit));

    const res = await fetch(url.toString(), { cache: "no-store" });
    if (!res.ok) return { blogs: [], failed: true };

    const json = await res.json();
    return { blogs: asArray<IBlog>(json?.data).map(toCommandBlog), failed: false };
  } catch {
    return { blogs: [], failed: true };
  }
};

/**
 * The newest articles, for the empty state.
 *
 * An empty search palette should still be a place to go somewhere, and the
 * feed's own order is the honest answer to "what is here right now". One
 * blog per category keeps this from being the feed again.
 */
export const latestArticles = async (limit = 6): Promise<BlogSearchResult> => {
  try {
    const url = new URL(`${envConfig.baseApi}/blogs`);
    url.searchParams.set("limit", String(limit * 3));

    const res = await fetch(url.toString(), { cache: "no-store" });
    if (!res.ok) return { blogs: [], failed: true };

    const json = await res.json();
    const seen = new Set<string>();
    const blogs: CommandBlog[] = [];

    for (const blog of asArray<IBlog>(json?.data)) {
      const key = blog.category?.name ?? blog._id;
      if (seen.has(key)) continue;
      seen.add(key);
      blogs.push(toCommandBlog(blog));
      if (blogs.length === limit) break;
    }

    return { blogs, failed: false };
  } catch {
    return { blogs: [], failed: true };
  }
};

export interface CategorySearchResult {
  categories: Pick<ICategory, "_id" | "name" | "blogCount">[];
  failed: boolean;
}

/**
 * Categories in the search palette.
 *
 * Categories are few and change rarely, so they are sorted and narrowed here
 * rather than round-tripped per keystroke. The API returns them newest first,
 * which is the order nobody scrolling for "React" wants.
 */
export const listCategories = async (): Promise<CategorySearchResult> => {
  try {
    const res = await fetch(`${envConfig.baseApi}/categories`, {
      next: { tags: ["categories"] },
    });
    if (!res.ok) return { categories: [], failed: true };

    const json = await res.json();
    const categories = asArray<ICategory>(json?.data)
      .map(({ _id, name, blogCount }) => ({ _id, name, blogCount }))
      .sort((a, b) => a.name.localeCompare(b.name));

    return { categories, failed: false };
  } catch {
    return { categories: [], failed: true };
  }
};

export interface ProfileSearchResult {
  user: Pick<IUser, "username" | "fullName" | "profilePicture" | "totalBlogs"> | null;
  failed: boolean;
}

/**
 * A single profile for an `@handle` typed into the palette.
 *
 * Usernames are exact matches on the API, so this is a lookup rather than a
 * search, and it only runs once the typed handle is long enough to be a real
 * one.
 */
export const lookupProfile = async (
  username: string,
): Promise<ProfileSearchResult> => {
  if (username.length < 2) return { user: null, failed: false };

  try {
    const res = await fetch(
      `${envConfig.baseApi}/users/${encodeURIComponent(username)}`,
      { cache: "no-store" },
    );
    if (res.status === 404) return { user: null, failed: false };
    if (!res.ok) return { user: null, failed: true };

    const json = await res.json();
    const user = json?.data as IUser | undefined;
    if (!user?.username) return { user: null, failed: false };

    return {
      user: {
        username: user.username,
        fullName: user.fullName,
        profilePicture: user.profilePicture,
        totalBlogs: user.totalBlogs,
      },
      failed: false,
    };
  } catch {
    return { user: null, failed: true };
  }
};
