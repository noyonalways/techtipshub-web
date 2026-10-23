import EditBlog from "@/components/modules/edit-blog";
import { EditorMessageFrame } from "@/components/modules/write-blog/editor-shell";
import { manageBlogsPath } from "@/lib/blog-routes";
import { getCurrentUser } from "@/services/auth";
import { getBlogBySlug } from "@/services/blog";
import { IBlog } from "@/types";
import { Metadata } from "next";
import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";
import { HiOutlineArrowRight } from "react-icons/hi2";

export const metadata: Metadata = {
  title: "Edit article",
  description: "Edit and update your article on TechTipsHub.",
  // Each editor is for its author; search engines have no reason to crawl it.
  robots: { index: false, follow: false },
};

interface IProps {
  params: Promise<{
    slug: string;
  }>;
}

const EditSingleBlog = async ({ params }: IProps) => {
  const { slug } = await params;
  const [data, user] = await Promise.all([
    getBlogBySlug(slug).catch(() => null),
    getCurrentUser().catch(() => null),
  ]);
  const blog = (data?.data as IBlog) ?? undefined;

  // A missing article is a dead end, not a blank editor: the old screen
  // rendered an empty form from `{}`, so a removed blog looked editable.
  if (!blog?._id) {
    return (
      <EditorMessageFrame>
        <Link
          href={manageBlogsPath}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-default-600 transition-colors hover:text-primary-accessible"
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
            href={manageBlogsPath}
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Go to my articles
            <HiOutlineArrowRight aria-hidden className="size-3.5" />
          </Link>
        </div>
      </EditorMessageFrame>
    );
  }

  // The editor saves with the signed-in member's token, so opening someone
  // else's article would only fail at the save button. Say so up front.
  const authorId =
    typeof blog.author === "object" && blog.author
      ? blog.author._id
      : (blog.author as string | undefined);
  if (authorId && user?._id && authorId !== user._id) {
    return (
      <EditorMessageFrame>
        <Link
          href={manageBlogsPath}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-default-600 transition-colors hover:text-primary-accessible"
        >
          <FiArrowLeft aria-hidden className="size-3.5" />
          All articles
        </Link>
        <div className="rounded-xl border border-default/60 bg-default-50/60 px-5 py-6 dark:bg-default-100/5">
          <h1 className="text-xl font-bold tracking-tight">
            This article belongs to another writer
          </h1>
          <p className="mt-2 max-w-prose text-sm leading-relaxed text-default-600">
            You can read it, but only its author can edit it.
          </p>
          {blog.slug && (
            <Link
              href={`/blogs/${blog.slug}`}
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              Read the article
              <HiOutlineArrowRight aria-hidden className="size-3.5" />
            </Link>
          )}
        </div>
      </EditorMessageFrame>
    );
  }

  return (
    <section className="pt-4">
      <EditBlog blog={blog} />
    </section>
  );
};

export default EditSingleBlog;
