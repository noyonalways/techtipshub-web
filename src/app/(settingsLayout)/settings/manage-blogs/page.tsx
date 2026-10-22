
import MyPosts from "@/components/modules/settings/my-posts";
import PageTitle from "@/components/modules/settings/page-title";
import { getLoggedInUserPosts } from "@/services/post";
import { IPost } from "@/types";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Manage Blogs',
  description: 'Manage all your blogs in one place with TechTips Hub.',
  keywords: 'Manage Blogs, TechTips Hub, Blogging',
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

  const data = await getLoggedInUserPosts(params);
  const blogs = data?.data as IPost[];

  return (
    <section className="py-10">
      <div className="max-w-3xl mx-auto px-2 lg:px-0">
        <PageTitle title="Manage Blogs" description="Manage your all blogs" />

        <MyPosts initialPosts={blogs} />
      </div>
    </section>  
  );
};

export default ManageBlogs;
