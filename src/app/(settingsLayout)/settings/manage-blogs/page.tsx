import MyPosts from "@/components/modules/settings/my-posts";
import PageTitle from "@/components/modules/settings/page-title";
import { getAllCategories } from "@/services/category";
import { getLoggedInUserPosts } from "@/services/post";
import { IPost } from "@/types";
import { Metadata } from "next";

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

      <MyPosts
        initialPosts={blogs}
        total={Number.isFinite(total) ? total : undefined}
        categories={categories}
      />
    </div>
  );
};

export default ManageBlogs;
