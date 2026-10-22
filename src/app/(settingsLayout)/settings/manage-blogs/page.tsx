import MyPosts from "@/components/modules/settings/my-posts";
import PageTitle from "@/components/modules/settings/page-title";
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
    search: string;
    category: string;
  }>;
}

const INITIAL_NUMBERS_OF_POSTS = "5";

const ManageBlogs = async ({ searchParams }: IProps) => {
  const { search, category } = await searchParams;

  const params = {
    searchTerm: search,
    category: category,
    limit: INITIAL_NUMBERS_OF_POSTS,
  };

  const data = await getLoggedInUserPosts(params).catch(() => null);
  const blogs = Array.isArray(data?.data) ? (data.data as IPost[]) : [];

  const total = Number(data?.meta?.total);

  return (
    <div className="space-y-6">
      <PageTitle
        title="Manage Blogs"
        description="Every article you have published on TechTips Hub."
      />

      {Number.isFinite(total) && (
        <p className="text-sm tabular-nums text-default-500">
          {total.toLocaleString()} {total === 1 ? "article" : "articles"} total
        </p>
      )}

      <MyPosts initialPosts={blogs} total={Number.isFinite(total) ? total : undefined} />
    </div>
  );
};

export default ManageBlogs;
