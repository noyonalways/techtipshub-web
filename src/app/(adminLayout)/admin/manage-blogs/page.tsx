import BlogsTable from "@/components/blogs-table";
import DashboardTitle from "@/components/dashboard-title";
import ButtonLink from "@/components/ui/button-link";
import { Metadata } from "next";
import { FiArrowUpRight } from "react-icons/fi";

export const metadata: Metadata = {
  title: "Manage Blogs | Admin Dashboard",
  description:
    "Admin panel for managing blogs, permissions, and access controls.",
  keywords: "admin, manage users, user management, access control, dashboard",
};

const ManageBlogs = () => {
  return (
    <div>
      <DashboardTitle
        title="Manage Blogs"
        description="Every published article, newest first. Edit content or remove a post with a reason."
        action={
          <ButtonLink
            href="/"
            size="sm"
            radius="lg"
            variant="bordered"
            endContent={<FiArrowUpRight />}
          >
            Open the feed
          </ButtonLink>
        }
      />
      <BlogsTable />
    </div>
  );
};

export default ManageBlogs;
