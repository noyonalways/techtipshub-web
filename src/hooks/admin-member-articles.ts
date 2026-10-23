"use client";

import { getAdminBlogsByUserId } from "@/services/blog/admin";
import type { IBlog } from "@/types";
import { useQuery } from "@tanstack/react-query";

export const MEMBER_ARTICLE_LIMIT = 8;

interface IArticlesResult {
  result: IBlog[];
  total: number;
  /** Distinguishes "the request failed" from "this member wrote none". */
  failed: boolean;
}

/**
 * A member's newest articles and their published total. A failed request is
 * returned as `failed` rather than thrown, so the card shows an error with a
 * retry instead of the same empty state a new member gets.
 */
export const useMemberArticles = (memberId?: string) =>
  useQuery<IArticlesResult>({
    queryKey: ["ADMIN_MEMBER_BLOGS", memberId],
    enabled: Boolean(memberId),
    queryFn: async () => {
      const page = await getAdminBlogsByUserId(memberId!, {
        page: 1,
        limit: MEMBER_ARTICLE_LIMIT,
      });

      return page
        ? { result: page.result, total: page.total, failed: false }
        : { result: [], total: 0, failed: true };
    },
  });

export type TMemberArticle = IBlog;
