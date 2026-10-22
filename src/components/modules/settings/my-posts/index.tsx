"use client";

import ManageBlogCard from "@/components/manage-blog-card";
import ButtonLink from "@/components/ui/button-link";
import { getLoggedInUserPosts } from "@/services/post";
import { IPost } from "@/types";
import { Button } from "@heroui/react";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";
import { FiPlus } from "react-icons/fi";

interface IProps {
  initialPosts: IPost[];
  /** Total articles on the account, from the server's pagination meta. */
  total?: number;
}

const PAGE_SIZE = 5;

/**
 * The list state lives in one object on purpose.
 *
 * "Which page comes next" and "how many rows are loaded" must only ever move
 * together. When they were separate `useState` calls a re-render could drop a
 * page fetch (the counter advanced, the rows did not), and the list would jump
 * straight to "no more" with rows still missing.
 */
interface IListState {
  posts: IPost[];
  /** The next page number to request. */
  nextPage: number;
}

const MyPosts = ({ initialPosts, total }: IProps) => {
  const searchParams = useSearchParams();
  const query = searchParams.toString();

  const first = Array.isArray(initialPosts) ? initialPosts : [];
  const [list, setList] = useState<IListState>({ posts: first, nextPage: 2 });
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const { ref, inView } = useInView({ rootMargin: "200px" });

  // The server renders the first page for each filter change; adopt it once.
  const renderedQuery = useRef(query);

  useEffect(() => {
    if (renderedQuery.current === query) return;
    renderedQuery.current = query;

    const fresh = Array.isArray(initialPosts) ? initialPosts : [];
    setList({ posts: fresh, nextPage: 2 });
  }, [query, initialPosts]);

  // Another page exists while fewer rows are loaded than the server counts.
  const hasMore =
    typeof total === "number"
      ? list.posts.length < total
      : list.posts.length > 0 && list.posts.length % PAGE_SIZE === 0;

  // Load the next page of posts.
  //
  // `isLoadingRef` guards against a second click landing while the request is
  // in flight — a double request would append the same page twice and skip the
  // next one.
  const loadingRef = useRef(false);
  const loadMorePosts = async () => {
    if (!hasMore || loadingRef.current) return;
    loadingRef.current = true;
    setIsLoadingMore(true);

    const params: { page: string; limit: string; [key: string]: string } = {
      page: list.nextPage.toString(),
      limit: PAGE_SIZE.toString(),
    };

    // Add searchTerm and category only if they are truthy
    const searchTerm = searchParams.get("search");
    const category = searchParams.get("category");
    if (searchTerm) params.searchTerm = searchTerm;
    if (category) params.category = category;

    const data = await getLoggedInUserPosts(params);
    const newPosts = Array.isArray(data?.data) ? (data.data as IPost[]) : [];

    setList((prev) => {
      // Ignore a page that arrived for a filter the reader has since changed.
      if (prev.nextPage !== list.nextPage) return prev;

      const seen = new Set(prev.posts.map((post) => post._id));
      const merged = newPosts.filter((post) => !seen.has(post._id));

      return { posts: [...prev.posts, ...merged], nextPage: prev.nextPage + 1 };
    });

    loadingRef.current = false;
    setIsLoadingMore(false);
  };

  useEffect(() => {
    if (inView && hasMore) {
      loadMorePosts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, hasMore, query]);

  const blogs = list.posts;

  if (blogs.length === 0) {
    return (
      <div className="mt-8 rounded-xl border border-dashed border-default/60 px-6 py-14 text-center">
        <h2 className="text-base font-semibold">No articles yet</h2>
        <p className="mx-auto mt-1.5 max-w-sm text-sm text-default-500">
          Everything you publish will appear here, ready to edit or remove.
        </p>
        <div className="mt-6">
          <ButtonLink
            href="/write-blog"
            radius="lg"
            color="primary"
            startContent={<FiPlus />}
          >
            Write your first post
          </ButtonLink>
        </div>
      </div>
    );
  }

  const remaining =
    typeof total === "number" ? Math.max(total - blogs.length, 0) : undefined;

  return (
    <div>
      <div className="flex items-baseline justify-between border-b border-default/60 pb-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-default-500">
          Your articles
          <span className="ml-2 font-normal normal-case tracking-normal text-default-400">
            showing {blogs.length}
            {typeof total === "number" ? ` of ${total.toLocaleString()}` : ""}
          </span>
        </p>
        <ButtonLink
          href="/write-blog"
          size="sm"
          radius="lg"
          variant="bordered"
          startContent={<FiPlus className="size-3.5" />}
        >
          New post
        </ButtonLink>
      </div>

      <div>
        {blogs.map((blog) => (
          <ManageBlogCard key={blog._id} post={blog} />
        ))}
      </div>

      <div
        className="py-6 text-center text-sm text-default-500"
        ref={ref}
        aria-live="polite"
      >
        {hasMore ? (
          <Button
            variant="bordered"
            radius="lg"
            size="sm"
            isLoading={isLoadingMore}
            onPress={() => loadMorePosts()}
          >
            {isLoadingMore
              ? "Loading…"
              : `Load ${remaining ?? "more"} more ${remaining === 1 ? "article" : "articles"}`}
          </Button>
        ) : (
          "You have reached the end of your articles."
        )}
      </div>
    </div>
  );
};

export default MyPosts;
