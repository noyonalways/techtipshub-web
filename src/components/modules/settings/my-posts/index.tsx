"use client";

import ManageBlogCard from "@/components/manage-blog-card";
import ButtonLink from "@/components/ui/button-link";
import { getLoggedInUserPosts } from "@/services/post";
import { IPost } from "@/types";
import { Button, Input } from "@heroui/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import { useInView } from "react-intersection-observer";
import { FiPlus, FiSearch, FiX } from "react-icons/fi";

interface IProps {
  initialPosts: IPost[];
  /** Total articles on the account, from the server's pagination meta. */
  total?: number;
}

const PAGE_SIZE = 5;

const SORTS = [
  { value: "newest", label: "Newest first", sort: "-createdAt,-_id" },
  { value: "oldest", label: "Oldest first", sort: "createdAt,_id" },
  { value: "views", label: "Most views", sort: "-totalViews,-createdAt" },
  { value: "comments", label: "Most comments", sort: "-totalComments,-createdAt" },
] as const;

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

const MyPosts = ({ initialPosts, total, categories = [] }: IProps & { categories?: string[] }) => {
  const searchParams = useSearchParams();
  const query = searchParams.toString();

  const first = Array.isArray(initialPosts) ? initialPosts : [];
  const [list, setList] = useState<IListState>({ posts: first, nextPage: 2 });
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const { ref, inView } = useInView({ rootMargin: "200px" });

  const activeSearch = searchParams.get("search") ?? "";
  const activeCategory = searchParams.get("category") ?? "";
  const activeSort = searchParams.get("sort") ?? "newest";

  // The server renders the first page for each filter change; adopt it once.
  const renderedQuery = useRef(query);

  useEffect(() => {
    if (renderedQuery.current === query) return;
    renderedQuery.current = query;

    const fresh = Array.isArray(initialPosts) ? initialPosts : [];
    setList({ posts: fresh, nextPage: 2 });
  }, [query, initialPosts]);

  // After a delete the row should leave the list straight away rather than
  // wait for a reload; the server's refresh then brings back the real page.
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const posts = list.posts.filter((post) => !deletedIds.includes(post._id));

  useEffect(() => {
    const onDeleted = (event: Event) => {
      const id = (event as CustomEvent<{ id?: string }>).detail?.id;
      if (!id) return;
      setDeletedIds((current) => [...current, id]);
      // The list is now one article shorter, so the next page number has to
      // move back to match — otherwise a page falls through the gap.
      setList((prev) => ({
        posts: prev.posts.filter((post) => post._id !== id),
        nextPage: Math.max(2, prev.nextPage),
      }));
    };
    window.addEventListener("post:deleted", onDeleted);
    return () => window.removeEventListener("post:deleted", onDeleted);
  }, []);

  // Another page exists while fewer rows are loaded than the server counts.
  const hasMore =
    typeof total === "number"
      ? posts.length < total
      : posts.length > 0 && posts.length % PAGE_SIZE === 0;

  // Load the next page of posts.
  //
  // `loadingRef` guards against a second click landing while the request is
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
    const sort = SORTS.find((s) => s.value === activeSort)?.sort;
    if (searchTerm) params.searchTerm = searchTerm;
    if (category) params.category = category;
    if (sort) params.sort = sort;

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

  const remaining =
    typeof total === "number" ? Math.max(total - posts.length, 0) : undefined;

  const filtered = !!(activeSearch || activeCategory);

  if (posts.length === 0) {
    return (
      <>
        {/* Filters stay on screen even with no results: the reader needs them
            to widen the search, which is exactly the moment they are missing. */}
        <Toolbar
          className="mb-6"
          activeSearch={activeSearch}
          activeCategory={activeCategory}
          activeSort={activeSort}
          categories={categories}
        />
        <EmptyState filtered={filtered} />
      </>
    );
  }

  return (
    <>
      <Toolbar
        className="mb-2"
        activeSearch={activeSearch}
        activeCategory={activeCategory}
        activeSort={activeSort}
        categories={categories}
      />

      <div className="flex items-baseline justify-between border-b border-default/60 py-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-default-500">
          {filtered ? "Results" : "Your articles"}
          <span className="ml-2 font-normal normal-case tracking-normal tabular-nums text-default-400">
            showing {posts.length}
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
        {posts.map((blog) => (
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
          <span>You have reached the end of your articles.</span>
        )}
      </div>
    </>
  );
};

/**
 * Search, category and order for the article list.
 *
 * Everything lives in the URL so a filtered view can be bookmarked, shared or
 * reached with the back button — the server renders it, and the list below
 * simply follows.
 */
const Toolbar = ({
  className = "",
  activeSearch,
  activeCategory,
  activeSort,
  categories,
}: {
  className?: string;
  activeSearch: string;
  activeCategory: string;
  activeSort: string;
  categories: string[];
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [term, setTerm] = useState(activeSearch);

  // The server is the source of truth for the term (back/forward, a reset from
  // the empty state), so follow it when it changes. Compare first, and only
  // ever correct an out-of-date value: typing must not fight the URL.
  const [lastServerTerm, setLastServerTerm] = useState(activeSearch);
  if (activeSearch !== lastServerTerm) {
    setLastServerTerm(activeSearch);
    if (term !== activeSearch) setTerm(activeSearch);
  }

  const push = (next: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    const merged = {
      search: activeSearch,
      category: activeCategory,
      sort: activeSort,
      ...next,
    };

    Object.entries(merged).forEach(([key, value]) => {
      if (value && !(key === "sort" && value === "newest")) {
        params.set(key, value);
      }
    });

    const target = params.toString() ? `${pathname}?${params}` : pathname;
    startTransition(() => router.push(target, { scroll: false }));
  };

  // Typing should not fire a request per keystroke; settle first.
  useEffect(() => {
    if (term === activeSearch) return;
    const timer = setTimeout(() => push({ search: term }), 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [term]);

  return (
    <div className={`flex flex-col gap-3 sm:flex-row sm:items-center ${className}`}>
      <div className="relative flex-1">
        <FiSearch
          aria-hidden
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-default-400"
        />
        <Input
          aria-label="Search your articles"
          placeholder="Search titles and content"
          value={term}
          onValueChange={setTerm}
          radius="lg"
          variant="bordered"
          classNames={{ inputWrapper: "h-10 pl-8", input: "text-sm" }}
          isClearable={!!term}
          onClear={() => setTerm("")}
          endContent={isPending ? <Spinner /> : undefined}
        />
      </div>

      <div className="flex items-center gap-2">
        <select
          aria-label="Filter by category"
          value={activeCategory}
          onChange={(event) => push({ category: event.target.value })}
          className="h-10 rounded-lg border border-default/60 bg-content1 px-3 text-sm"
        >
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        <select
          aria-label="Order articles"
          value={activeSort}
          onChange={(event) => push({ sort: event.target.value })}
          className="h-10 rounded-lg border border-default/60 bg-content1 px-3 text-sm"
        >
          {SORTS.map((sort) => (
            <option key={sort.value} value={sort.value}>
              {sort.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

const Spinner = () => (
  <span
    aria-hidden
    className="size-4 animate-spin rounded-full border-2 border-default-300 border-t-primary"
  />
);

const EmptyState = ({ filtered }: { filtered: boolean }) => {
  const router = useRouter();
  const pathname = usePathname();

  if (filtered) {
    return (
      <div className="flex flex-col items-center gap-1.5 rounded-xl border border-dashed border-default/60 px-6 py-10 text-center">
        <FiSearch aria-hidden className="mb-1 size-5 text-default-400" />
        <h2 className="text-sm font-semibold">No articles match that</h2>
        <p className="max-w-sm text-sm text-default-500">
          Try a shorter search, another category, or clear the filters to see
          everything you have published.
        </p>
        <Button
          size="sm"
          radius="lg"
          variant="bordered"
          className="mt-4"
          startContent={<FiX className="size-4" />}
          onPress={() => router.push(pathname, { scroll: false })}
        >
          Clear filters
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-1.5 rounded-xl border border-dashed border-default/60 px-6 py-12 text-center">
      <h2 className="text-sm font-semibold">No articles yet</h2>
      <p className="max-w-sm text-sm text-default-500">
        Everything you publish will appear here, ready to edit or remove.
      </p>
      <ButtonLink
        href="/write-blog"
        size="sm"
        radius="lg"
        color="primary"
        className="mt-4"
        startContent={<FiPlus className="size-4" />}
      >
        Write your first post
      </ButtonLink>
    </div>
  );
};

export default MyPosts;
