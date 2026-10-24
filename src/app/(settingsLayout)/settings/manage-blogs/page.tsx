import ManageBlogs from "@/components/modules/settings/manage-blogs";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manage Blogs",
  description: "Manage all your blogs in one place with TechTipsHub.",
  keywords: "Manage Blogs, TechTipsHub, Blogging",
  robots: { index: false, follow: false },
  alternates: { canonical: "/settings/manage-blogs" },
};

interface IProps {
  searchParams: Promise<{
    search?: string;
    category?: string;
    sort?: string;
  }>;
}

/**
 * The article list under its old settings address.
 *
 * Kept so existing links and bookmarks keep working; new links point at
 * `/me/blogs`. Both render the same component.
 */
const ManageBlogsPage = ({ searchParams }: IProps) => (
  <div className="space-y-6">
    <ManageBlogs
      searchParams={searchParams}
      title="Manage Blogs"
      description="Edit, review or remove anything you have published."
    />
  </div>
);

export default ManageBlogsPage;
