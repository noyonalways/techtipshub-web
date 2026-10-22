import EditBlog from "@/components/modules/edit-blog";
import BackToArticles from "@/components/modules/edit-blog/back-to-articles";
import { getPostBySlug } from "@/services/post";
import { IPost } from "@/types";
import { Metadata } from "next";
import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";
import { HiOutlineArrowRight } from "react-icons/hi2";
import { LuExternalLink } from "react-icons/lu";

export const metadata: Metadata = {
  title: "Edit Article",
  description: "Edit and update your article on TechTips Hub.",
};

interface IProps {
  params: Promise<{
    slug: string;
  }>;
}

const EditSingleBlog = async ({ params }: IProps) => {
  const { slug } = await params;
  const data = await getPostBySlug(slug).catch(() => null);
  const post = (data?.data as IPost) ?? undefined;

  // A missing article is a dead end, not a blank editor: the old screen
  // rendered an empty form from `{}`, so a removed post looked editable.
  if (!post?._id) {
    return (
      <div className="space-y-6">
        <Link
          href="/settings/manage-blogs"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-default-500 transition-colors hover:text-primary"
        >
          <FiArrowLeft aria-hidden className="size-3.5" />
          All articles
        </Link>

        <div className="rounded-xl border border-default/60 bg-default-50/60 px-5 py-6 dark:bg-default-100/5">
          <h1 className="text-xl font-bold tracking-tight">Article not found</h1>
          <p className="mt-2 max-w-prose text-sm leading-relaxed text-default-600">
            This article does not exist, or it was removed. Pick one from your
            articles to edit instead.
          </p>
          <Link
            href="/settings/manage-blogs"
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Go to my articles
            <HiOutlineArrowRight aria-hidden className="size-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <BackToArticles />

        <div className="mt-3 flex flex-wrap items-end justify-between gap-2 border-b border-default/60 pb-5">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight">Edit article</h1>
            <p className="mt-1 truncate text-sm text-default-500">
              {post.title}
            </p>
          </div>
          {post.slug && (
            <Link
              href={`/blogs/${post.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              View published post
              <LuExternalLink aria-hidden className="size-3.5" />
            </Link>
          )}
        </div>
      </div>

      <EditBlog post={post} />
    </div>
  );
};

export default EditSingleBlog;
