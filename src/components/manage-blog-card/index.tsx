import { IPost } from "@/types";
import { Avatar } from "@heroui/avatar";
import Link from "next/link";
import { FiEdit3, FiEye } from "react-icons/fi";
import { parseHtmlContent } from "@/utils";
import { UserDeleteBlogModal } from "../modals";

interface IProps {
  post: IPost;
}

const formatDate = (value?: string) =>
  value
    ? new Date(value).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

const ManageBlogCard = ({ post }: IProps) => {
  const { author, title, content, coverImage, createdAt, category, slug, _id } =
    post ?? {};

  const parsedContent = parseHtmlContent(content ?? "");
  const excerpt =
    parsedContent.length > 160
      ? `${parsedContent.substring(0, 160).trimEnd()}…`
      : parsedContent;

  return (
    <article className="group grid gap-4 border-b border-default/60 py-5 sm:grid-cols-[minmax(0,1fr)_10rem] sm:gap-6">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-default-500">
          {category?.name && (
            <span className="rounded-full border border-default/60 px-2 py-0.5 font-medium text-default-600">
              {category.name}
            </span>
          )}
          {createdAt && <time dateTime={createdAt}>{formatDate(createdAt)}</time>}
          <span aria-hidden className="text-default-300">
            ·
          </span>
          <span className="tabular-nums">{post.totalViews ?? 0} views</span>
          <span aria-hidden className="text-default-300">
            ·
          </span>
          <span className="tabular-nums">
            {post.totalComments ?? 0} comments
          </span>
        </div>

        <h3 className="mt-2 text-pretty text-lg font-semibold leading-snug tracking-tight">
          <Link
            href={`/blogs/${slug}`}
            className="transition-colors hover:text-primary"
          >
            {title}
          </Link>
        </h3>

        {excerpt && (
          <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-default-600">
            {excerpt}
          </p>
        )}

        {author && (
          <div className="mt-3 flex items-center gap-2 text-xs text-default-500">
            <Avatar
              className="size-5 object-cover"
              radius="full"
              src={author.profilePicture}
              name={(author.fullName || "?").charAt(0).toUpperCase()}
            />
            <span className="truncate">{author.fullName}</span>
          </div>
        )}
      </div>

      <div className="flex flex-row items-end justify-between gap-3 sm:flex-col sm:items-stretch sm:justify-start">
        {coverImage && (
          <Link
            href={`/blogs/${slug}`}
            className="order-2 w-24 shrink-0 overflow-hidden rounded-lg border border-default/60 sm:order-1 sm:w-full"
            tabIndex={-1}
            aria-hidden
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={coverImage}
              alt=""
              className="aspect-[16/10] w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              loading="lazy"
            />
          </Link>
        )}

        <div className="order-1 flex flex-wrap items-center gap-1 sm:order-2">
          <Link
            href={`/settings/update/${slug}`}
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-default-700 transition-colors hover:bg-default-100 hover:text-primary"
          >
            <FiEdit3 aria-hidden className="size-4" />
            Edit
          </Link>
          <Link
            href={`/blogs/${slug}`}
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-default-700 transition-colors hover:bg-default-100"
          >
            <FiEye aria-hidden className="size-4" />
            View
          </Link>
          <UserDeleteBlogModal id={_id} />
        </div>
      </div>
    </article>
  );
};

export default ManageBlogCard;
