"use server";

import { cache } from "react";
import { getLoggedInUserPosts } from "@/services/post";

/** Numbers for the settings page's "at a glance" panel. */
export interface IAccountSummary {
  articles: number;
  views: number;
  comments: number;
  newest: { title: string; slug: string; createdAt: string } | null;
}

interface ILitePost {
  title?: string;
  slug?: string;
  createdAt?: string;
  totalViews?: number;
  totalComments?: number;
}

// The API pages its list, so a fixed page size would undercount an account
// with more articles than that. Ask for one big page instead; it only carries
// the fields counted here, and the profile list does the paging.
const SUMMARY_PAGE_SIZE = "500";

/**
 * Summarises the signed-in member's own articles.
 *
 * Every number is derived from the articles the API actually serves — the
 * newest first — so this cannot disagree with the profile or manage-blogs the
 * way a stored counter could.
 */
export const getAccountSummary = cache(async (): Promise<IAccountSummary> => {
  const data = await getLoggedInUserPosts({ limit: SUMMARY_PAGE_SIZE }).catch(
    () => null,
  );

  const posts = Array.isArray(data?.data) ? (data.data as ILitePost[]) : [];
  const total = Number(data?.meta?.total);

  const newest = posts.reduce<ILitePost | null>((latest, post) => {
    if (!post.createdAt) return latest;
    if (!latest?.createdAt) return post;
    return new Date(post.createdAt) > new Date(latest.createdAt) ? post : latest;
  }, null);

  return {
    // The server's own total is authoritative when it is present; the loaded
    // rows are the fallback for an older API build.
    articles: Number.isFinite(total) ? total : posts.length,
    views: posts.reduce((sum, post) => sum + (post.totalViews ?? 0), 0),
    comments: posts.reduce((sum, post) => sum + (post.totalComments ?? 0), 0),
    newest:
      newest?.title && newest.slug && newest.createdAt
        ? {
            title: newest.title,
            slug: newest.slug,
            createdAt: newest.createdAt,
          }
        : null,
  };
});
