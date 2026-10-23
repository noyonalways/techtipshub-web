import MyBlogs from "@/components/modules/settings/my-blogs";
import { manageBlogsPath, writeBlogPath } from "@/lib/blog-routes";
import { getAllCategories } from "@/services/category";
import { getLoggedInUserBlogs } from "@/services/blog";
import { IBlog } from "@/types";
import Link from "next/link";
import { FiPlus } from "react-icons/fi";
import { HiOutlineArrowRight } from "react-icons/hi2";

type ISearchParams = Promise<{
  search?: string;
  category?: string;
  sort?: string;
}>;

const INITIAL_NUMBERS_OF_BLOGS = "5";

// Mirrors the options in the list toolbar; unknown values fall back to newest.
const SORTS: Record<string, string> = {
  newest: "-createdAt,-_id",
  oldest: "createdAt,_id",
  views: "-totalViews,-createdAt",
  comments: "-totalComments,-createdAt",
};

/**
 * The account's article list, shared by `/me/blogs` and the legacy
 * `/settings/manage-blogs` so the two can never show different things.
 *
 * One heading, one primary action. The list below owns the filters and the
 * states, because they are about the list; the page only supplies the count
 * that says what is being looked after.
 */
const ManageBlogs = async ({
  searchParams,
  title = "My articles",
  description = "Everything you have published, ready to edit or remove.",
}: {
  searchParams: ISearchParams;
  title?: string;
  description?: string;
}) => {
  const { search, category, sort } = await searchParams;
  const activeSort = sort && SORTS[sort] ? sort : "newest";

  const [data, categoryData] = await Promise.all([
    getLoggedInUserBlogs({
      searchTerm: search,
      category,
      sort: SORTS[activeSort],
      limit: INITIAL_NUMBERS_OF_BLOGS,
    }).catch(() => null),
    getAllCategories().catch(() => null),
  ]);

  const blogs = Array.isArray(data?.data) ? (data.data as IBlog[]) : [];
  const total = Number(data?.meta?.total);

  // A failed session is neither an account with no articles nor a network
  // blip with a retry, so it gets its own way forward: sign in again.
  const sessionError =
    data?.success === false
      ? data?.statusCode === 401 || data?.message === "Unauthorized Access"
        ? "Your session has expired. Sign in again to see and manage your articles."
        : data?.message ||
          "Your articles could not be loaded. Reload the page to try again."
      : null;

  const categories = Array.isArray(categoryData?.data)
    ? (categoryData.data as { name: string }[])
        .map((item) => item.name)
        .filter((name) => typeof name === "string" && name.length > 0)
        .sort((a, b) => a.localeCompare(b))
    : [];

  return (
    <div className="w-full">
      <header className="flex flex-col gap-4 border-b border-default-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {title}
          </h1>
          <p className="mt-1 text-sm text-default-600">
            {description}
            {Number.isFinite(total) && total > 0 && (
              <>
                {" "}
                <span className="tabular-nums">
                  ({total.toLocaleString()}{" "}
                  {total === 1 ? "article" : "articles"})
                </span>
              </>
            )}
          </p>
        </div>
        <Link
          href={writeBlogPath}
          className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-300 sm:self-auto"
        >
          <FiPlus aria-hidden className="size-4" />
          New blog
        </Link>
      </header>

      <div className="pt-5">
        {sessionError ? (
          <div
            role="alert"
            className="border-y border-default-200 py-10 text-center"
          >
            <h2 className="text-base font-semibold">
              {data?.statusCode === 401
                ? "Your session has expired"
                : "Your articles did not load"}
            </h2>
            <p className="mx-auto mt-1 max-w-sm text-sm leading-relaxed text-default-600">
              {sessionError}
            </p>
            <Link
              href={
                data?.statusCode === 401
                  ? `/login?redirect=${encodeURIComponent(manageBlogsPath)}`
                  : manageBlogsPath
              }
              className="mt-5 inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-300"
            >
              {data?.statusCode === 401 ? "Sign in again" : "Try again"}
              <HiOutlineArrowRight aria-hidden className="size-4" />
            </Link>
          </div>
        ) : (
          <MyBlogs
            initialBlogs={blogs}
            total={Number.isFinite(total) ? total : undefined}
            categories={categories}
          />
        )}
      </div>
    </div>
  );
};

export default ManageBlogs;
