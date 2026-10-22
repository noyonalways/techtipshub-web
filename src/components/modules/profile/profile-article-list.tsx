"use client";

import ProfilePosts from "@/components/modules/profile/profile-posts";
import { getPostsByUserId } from "@/services/post";
import { Button } from "@heroui/react";
import { useRef, useState } from "react";
import type { IPost } from "@/types";

interface IProps {
  userId: string;
  initialPosts: IPost[];
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
  initialPosts,
  total,
  emptyMessage,
}: IProps) => {
  const [posts, setPosts] = useState<IPost[]>(initialPosts);
  const [isLoading, setIsLoading] = useState(false);
  const nextPage = useRef(2);
  const loadingRef = useRef(false);

  const hasMore = posts.length < total;

  const loadMore = async () => {
    if (!hasMore || loadingRef.current) return;
    loadingRef.current = true;
    setIsLoading(true);

    const page = nextPage.current;
    const data = await getPostsByUserId(userId, {
      page: String(page),
      limit: String(PAGE_SIZE),
    });
    const next = Array.isArray(data?.data) ? (data.data as IPost[]) : [];

    setPosts((prev) => {
      const seen = new Set(prev.map((post) => post._id));
      return [...prev, ...next.filter((post) => !seen.has(post._id))];
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

  const remaining = Math.max(total - posts.length, 0);

  return (
    <div>
      <ProfilePosts posts={posts} emptyMessage={emptyMessage} />

      {posts.length > 0 && (
        <div className="mt-6 flex flex-col items-center gap-2" aria-live="polite">
          {hasMore ? (
            <>
              <Button
                radius="lg"
                variant="bordered"
                isLoading={isLoading}
                onPress={loadMore}
              >
                {isLoading ? "Loading…" : "Load more articles"}
              </Button>
              <p className="text-xs tabular-nums text-default-400">
                Showing {posts.length} of {total.toLocaleString()}
                {remaining > 0 ? ` · ${remaining} more` : ""}
              </p>
            </>
          ) : (
            <p className="text-sm text-default-500">
              {posts.length === total
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
