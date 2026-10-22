import MyPosts from "@/components/modules/settings/my-posts";
import PageTitle from "@/components/modules/settings/page-title";
import { getAllCategories } from "@/services/category";
import { getLoggedInUserPosts } from "@/services/post";
import { IPost } from "@/types";
import { Metadata } from "next";
import Link from "next/link";
import { HiOutlineArrowRight } from "react-icons/hi2";

export const metadata: Metadata = {
  title: "Manage Blogs",
  description: "Manage all your blogs in one place with TechTips Hub.",
  keywords: "Manage Blogs, TechTips Hub, Blogging",
};

interface IProps {
  searchParams: Promise<{
    search?: string;
    category?: string;
    sort?: string;
  }>;
}

const INITIAL_NUMBERS_OF_POSTS = "5";

// Mirrors the options in the list toolbar; unknown values fall back to newest.
const SORTS: Record<string, string> = {
  newest: "-createdAt,-_id",
  oldest: "createdAt,_id",
  views: "-totalViews,-createdAt",
  comments: "-totalComments,-createdAt",
};

/**
 * Every article on the account, with the filters kept in the URL so a view can
 * be bookmarked or reached with the back button.
 */
const ManageBlogs = async ({ searchParams }: IProps) => {
  const { search, category, sort } = await searchParams;
  const activeSort = sort && SORTS[sort] ? sort : "newest";

  const [data, categoryData] = await Promise.all([
    getLoggedInUserPosts({
      searchTerm: search,
      category,
      sort: SORTS[activeSort],
      limit: INITIAL_NUMBERS_OF_POSTS,
    }).catch(() => null),
    getAllCategories().catch(() => null),
  ]);

  const blogs = Array.isArray(data?.data) ? (data.data as IPost[]) : [];
  const total = Number(data?.meta?.total);

  // A failed session is not the same thing as an account with no articles, and
  // must not be shown as one.
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
    <div className="space-y-6">
      <PageTitle
        title="Manage Blogs"
        description="Edit, review or remove anything you have published."
      />

      {sessionError ? (
        <div
          role="alert"
          className="flex flex-col items-start gap-3 rounded-xl border border-default/60 bg-default-50/60 px-5 py-4 dark:bg-default-100/5"
        >
          <p className="text-sm text-default-600">{sessionError}</p>
          <Link
            href={`/login?redirect=${encodeURIComponent("/settings/manage-blogs")}`}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Sign in again
            <HiOutlineArrowRight aria-hidden className="size-3.5" />
          </Link>
        </div>
      ) : (
        <MyPosts
          initialPosts={blogs}
          total={Number.isFinite(total) ? total : undefined}
          categories={categories}
        />
      )}
    </div>
  );
};

export default ManageBlogs;
