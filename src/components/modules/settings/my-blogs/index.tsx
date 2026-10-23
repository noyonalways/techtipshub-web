"use client";

import { writeBlogPath } from "@/lib/blog-routes";

import ManageBlogCard from "@/components/manage-blog-card";
import ButtonLink from "@/components/ui/button-link";
import { getLoggedInUserBlogs } from "@/services/blog";
import { IBlog } from "@/types";
import { Button, Input } from "@heroui/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  useEffect,
  useId,
  useRef,
  useState,
  useTransition,
} from "react";
import { useInView } from "react-intersection-observer";
import { FiPlus, FiSearch, FiX } from "react-icons/fi";

interface IProps {
  initialBlogs: IBlog[];
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
  blogs: IBlog[];
  /** The next page number to request. */
  nextPage: number;
}

const MyBlogs = ({ initialBlogs, total, categories = [] }: IProps & { categories?: string[] }) => {
  const searchParams = useSearchParams();
  const query = searchParams.toString();

  const first = Array.isArray(initialBlogs) ? initialBlogs : [];
  const [list, setList] = useState<IListState>({ blogs: first, nextPage: 2 });
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

    const fresh = Array.isArray(initialBlogs) ? initialBlogs : [];
    setList({ blogs: fresh, nextPage: 2 });
  }, [query, initialBlogs]);

  // After a delete the row should leave the list straight away rather than
  // wait for a reload; the server's refresh then brings back the real page.
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const blogs = list.blogs.filter((blog) => !deletedIds.includes(blog._id));

  useEffect(() => {
    const onDeleted = (event: Event) => {
      const id = (event as CustomEvent<{ id?: string }>).detail?.id;
      if (!id) return;
      setDeletedIds((current) => [...current, id]);
      // The list is now one article shorter, so the next page number has to
      // move back to match — otherwise a page falls through the gap.
      setList((prev) => ({
        blogs: prev.blogs.filter((blog) => blog._id !== id),
        nextPage: Math.max(2, prev.nextPage),
      }));
    };
    window.addEventListener("blog:deleted", onDeleted);
    return () => window.removeEventListener("blog:deleted", onDeleted);
  }, []);

  // Another page exists while fewer rows are loaded than the server counts.
  const hasMore =
    typeof total === "number"
      ? blogs.length < total
      : blogs.length > 0 && blogs.length % PAGE_SIZE === 0;

  // Load the next page of blogs.
  //
  // `loadingRef` guards against a second click landing while the request is
  // in flight — a double request would append the same page twice and skip the
  // next one.
  const loadingRef = useRef(false);
  const loadMoreBlogs = async () => {
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

    const data = await getLoggedInUserBlogs(params);
    const newBlogs = Array.isArray(data?.data) ? (data.data as IBlog[]) : [];

    setList((prev) => {
      // Ignore a page that arrived for a filter the reader has since changed.
      if (prev.nextPage !== list.nextPage) return prev;

      const seen = new Set(prev.blogs.map((blog) => blog._id));
      const merged = newBlogs.filter((blog) => !seen.has(blog._id));

      return { blogs: [...prev.blogs, ...merged], nextPage: prev.nextPage + 1 };
    });

    loadingRef.current = false;
    setIsLoadingMore(false);
  };

  useEffect(() => {
    if (inView && hasMore) {
      loadMoreBlogs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, hasMore, query]);

  const remaining =
    typeof total === "number" ? Math.max(total - blogs.length, 0) : undefined;

  const filtered = !!(activeSearch || activeCategory);

  if (blogs.length === 0) {
    return (
      <>
        {/* Filters stay on screen even with no results: the reader needs them
            to widen the search, which is exactly the moment they are missing. */}
        {filtered && (
          <Toolbar
            className="mb-6"
            activeSearch={activeSearch}
            activeCategory={activeCategory}
            activeSort={activeSort}
            categories={categories}
          />
        )}
        <EmptyState filtered={filtered} sort={activeSort} />
      </>
    );
  }

  return (
    <>
      <Toolbar
        className="mb-4"
        activeSearch={activeSearch}
        activeCategory={activeCategory}
        activeSort={activeSort}
        categories={categories}
      />

      <div className="flex items-baseline justify-between border-b border-default-200 pb-2">
        <p className="text-[0.8125rem] text-default-600">
          {filtered ? "Results" : "Articles"}
          <span className="ml-2 tabular-nums text-default-600">
            {blogs.length}
            {typeof total === "number" ? ` of ${total.toLocaleString()}` : ""}
          </span>
        </p>
        {filtered && (
          <ClearFilters className="text-xs" />
        )}
      </div>

      <div>
        {blogs.map((blog) => (
          <ManageBlogCard key={blog._id} blog={blog} />
        ))}
      </div>

      <div
        className="py-6 text-center text-sm text-default-600"
        ref={ref}
        aria-live="polite"
      >
        {hasMore ? (
          <Button
            variant="bordered"
            size="sm"
            isLoading={isLoadingMore}
            onPress={() => loadMoreBlogs()}
          >
            {isLoadingMore
              ? "Loading…"
              : `Load ${remaining ?? "more"} more ${remaining === 1 ? "article" : "articles"}`}
          </Button>
        ) : (
          <span>
            {blogs.length === 1
              ? "That is every article on your account."
              : `That is all ${blogs.length} articles.`}
          </span>
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
 *
 * The filters sit behind a disclosure, closed by default, because choosing an
 * article is the job here and most visits start with the list already showing
 * it. With a filter applied they open, so the active state is never invisible.
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
  const [open, setOpen] = useState(() => Boolean(activeSearch || activeCategory));
  const panelId = useId();

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

  const activeCount =
    (activeSearch ? 1 : 0) + (activeCategory ? 1 : 0) + (activeSort !== "newest" ? 1 : 0);

  return (
    <div className={className}>
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((value) => !value)}
          className="inline-flex items-center gap-1.5 rounded-md py-1 text-[0.8125rem] font-medium text-default-600 transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-300"
        >
          <FiSearch aria-hidden className="size-3.5" />
          Search and filter
          {activeCount > 0 && (
            <span className="rounded-full bg-default-100 px-1.5 text-xs tabular-nums text-default-700">
              {activeCount}
            </span>
          )}
        </button>
        {isPending && <span className="text-xs text-default-600">Updating…</span>}
      </div>

      {open && (
        <div
          id={panelId}
          className="mt-3 flex flex-col gap-3 border-y border-default-200 py-3 sm:flex-row sm:items-center"
        >
          <div className="relative flex-1">
            <FiSearch
              aria-hidden
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-default-600"
            />
            <Input
              aria-label="Search your articles"
              placeholder="Search titles and content"
              value={term}
              onValueChange={setTerm}
              variant="bordered"
              radius="sm"
              classNames={{ inputWrapper: "h-10 pl-8", input: "text-sm" }}
              isClearable={!!term}
              onClear={() => setTerm("")}
            />
          </div>

          <div className="flex min-w-0 flex-wrap items-center gap-2 sm:flex-nowrap">
            <select
              aria-label="Filter by category"
              value={activeCategory}
              onChange={(event) => push({ category: event.target.value })}
              className="h-10 min-w-0 max-w-full flex-1 rounded-md border border-default-300 bg-background px-2 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-300 sm:flex-none"
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
              className="h-10 min-w-0 max-w-full flex-1 rounded-md border border-default-300 bg-background px-2 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-300 sm:flex-none"
            >
              {SORTS.map((sort) => (
                <option key={sort.value} value={sort.value}>
                  {sort.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

/** Clears every filter, for the empty and filtered states to share. */
const ClearFilters = ({ className = "" }: { className?: string }) => {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <button
      type="button"
      onClick={() => router.push(pathname, { scroll: false })}
      className={`inline-flex items-center gap-1.5 rounded-md font-medium text-default-600 transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-300 ${className}`}
    >
      <FiX aria-hidden className="size-3.5" />
      Clear filters
    </button>
  );
};

/**
 * The three ways this screen can be empty, each with its own next step.
 *
 * No articles at all is not a problem to recover from, it is the start of the
 * account. A filter that matches nothing is a search to widen. They are
 * different sentences because they are different situations.
 */
const EmptyState = ({
  filtered,
  sort,
}: {
  filtered: boolean;
  sort: string;
}) => {
  if (filtered) {
    return (
      <div className="border-y border-default-200 py-12 text-center">
        <h2 className="text-base font-semibold">No article matches that</h2>
        <p className="mx-auto mt-1 max-w-sm text-sm leading-relaxed text-default-600">
          Try a shorter search or another category. Everything you have
          published is still here.
        </p>
        <div className="mt-5">
          <ClearFilters />
        </div>
      </div>
    );
  }

  // An empty list under a non-default order is surprising; say why it is empty
  // rather than implying the account has nothing.
  if (sort !== "newest") {
    return (
      <div className="border-y border-default-200 py-12 text-center">
        <h2 className="text-base font-semibold">No articles yet</h2>
        <p className="mx-auto mt-1 max-w-sm text-sm leading-relaxed text-default-600">
          Once you publish, this list can be ordered and searched.
        </p>
      </div>
    );
  }

  return (
    <div className="border-y border-default-200 py-14 text-center">
      <h2 className="text-base font-semibold">No articles yet</h2>
      <p className="mx-auto mt-1 max-w-sm text-sm leading-relaxed text-default-600">
        Everything you publish appears here, ready to edit, view or remove.
      </p>
      <div className="mt-5">
        <ButtonLink
          href={writeBlogPath}
          size="sm"
          color="primary"
          startContent={<FiPlus className="size-3.5" />}
        >
          Write your first blog
        </ButtonLink>
      </div>
    </div>
  );
};

export default MyBlogs;
