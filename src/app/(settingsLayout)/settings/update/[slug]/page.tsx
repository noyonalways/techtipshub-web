import UpdateBlog from "@/components/modules/update-blog";
import { getPostBySlug } from "@/services/post";
import { IPost } from "@/types";
import { Metadata } from "next";
import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";

export const metadata: Metadata = {
  title: "Update Blog - TechTips Hub",
  description: "Edit and update your blog content on TechTips Hub.",
  keywords: "Update Blog, Edit Blog, TechTips Hub, Blogging",
};

interface IProps {
  params: Promise<{
    slug: string;
  }>;
}

const UpdateSingleBlog = async ({ params }: IProps) => {
  const { slug } = await params;
  const data = await getPostBySlug(slug).catch(() => null);
  const post = (data?.data as IPost) ?? undefined;

  return (
    <div className="relative space-y-6">
      <div>
        <Link
          href="/settings/manage-blogs"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-default-500 transition-colors hover:text-primary"
        >
          <FiArrowLeft aria-hidden className="size-3.5" />
          All articles
        </Link>

        <div className="mt-3 flex flex-col gap-3 border-b border-default/60 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight">Update blog</h1>
            <p className="mt-1 truncate text-sm text-default-500">
              {post?.title || "Edit this article"}
            </p>
          </div>
          {post?.slug && (
            <Link
              href={`/blogs/${post.slug}`}
              className="shrink-0 text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              View published post
            </Link>
          )}
        </div>
      </div>

      <UpdateBlog post={post ?? ({} as IPost)} />
    </div>
  );
};

export default UpdateSingleBlog;
