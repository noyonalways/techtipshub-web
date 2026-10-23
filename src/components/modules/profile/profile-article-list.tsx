"use client";

import ProfileBlogs from "@/components/modules/profile/profile-blogs";
import { getBlogsByUserId } from "@/services/blog";
import { Button } from "@heroui/react";
import { useRef, useState } from "react";
import type { IBlog } from "@/types";

interface IProps {
  userId: string;
  initialBlogs: IBlog[];
  /** Total published articles, from the API's pagination meta. */
  total: number;
  emptyMessage?: string;
}

const PAGE_SIZE = 8;

/**
 * A member's articles, newest first, with a "Load more" button.
 *
 * The count shown is the server's total rather than the number of loaded rows,
 * so the profile header and the list agree with what the API actually has.
 * Rows and the next page number move in a single update, and a request in
 * flight is locked out, so a page can never be skipped or loaded twice.
 */
const ProfileArticleList = ({
  userId,
  initialBlogs,
  total,
  emptyMessage,
}: IProps) => {
  const [blogs, setBlogs] = useState<IBlog[]>(initialBlogs);
  const [isLoading, setIsLoading] = useState(false);
  const nextPage = useRef(2);
  const loadingRef = useRef(false);

  const hasMore = blogs.length < total;

  const loadMore = async () => {
    if (!hasMore || loadingRef.current) return;
    loadingRef.current = true;
    setIsLoading(true);

    const page = nextPage.current;
    const data = await getBlogsByUserId(userId, {
      page: String(page),
      limit: String(PAGE_SIZE),
    });
    const next = Array.isArray(data?.data) ? (data.data as IBlog[]) : [];

    setBlogs((prev) => {
      const seen = new Set(prev.map((blog) => blog._id));
      return [...prev, ...next.filter((blog) => !seen.has(blog._id))];
    });

    const totalPages = Number(data?.meta?.totalPages);
    const reachedEnd = Number.isFinite(totalPages)
      ? page >= totalPages
      : next.length < PAGE_SIZE;

    nextPage.current = page + 1;
    if (reachedEnd) {
      // Nothing left to ask for: pin the counter to the end of the list.
      nextPage.current = Number.MAX_SAFE_INTEGER;
    }

    loadingRef.current = false;
    setIsLoading(false);
  };

  const remaining = Math.max(total - blogs.length, 0);

  return (
    <div>
      <ProfileBlogs blogs={blogs} emptyMessage={emptyMessage} />

      {blogs.length > 0 && (
        <div className="mt-6 flex flex-col items-center gap-2" aria-live="polite">
          {hasMore ? (
            <>
              <Button
                className="border border-default-300 font-medium text-foreground hover:bg-default-100"
                radius="lg"
                variant="bordered"
                isLoading={isLoading}
                onPress={loadMore}
              >
                {isLoading ? "Loading…" : "Load more articles"}
              </Button>
              <p className="text-xs tabular-nums text-default-600">
                Showing {blogs.length} of {total.toLocaleString()}
                {remaining > 0 ? ` · ${remaining} more` : ""}
              </p>
            </>
          ) : (
            <p className="text-sm text-default-600">
              {blogs.length === total
                ? `That’s all ${total.toLocaleString()} ${
                    total === 1 ? "article" : "articles"
                  }.`
                : "You have reached the end."}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfileArticleList;
