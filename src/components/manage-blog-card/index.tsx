import { editBlogPath } from "@/lib/blog-routes";
import { IBlog } from "@/types";
import Link from "next/link";
import { FiEdit3, FiEye } from "react-icons/fi";
import { HiOutlineChatBubbleLeftEllipsis } from "react-icons/hi2";
import { parseHtmlContent } from "@/utils";
import { UserDeleteBlogModal } from "../modals";

interface IProps {
  blog: IBlog;
}

const formatDate = (value?: string) =>
  value
    ? new Date(value).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

/**
 * One article in the account list.
 *
 * A row, because the writer is scanning for a title they recognise: the title
 * is the largest thing here and the whole row is the way into the editor. The
 * excerpt and the numbers sit under it as evidence, small enough that a list of
 * twenty stays scannable rather than turning into twenty cards.
 *
 * Edit is the only action given weight, since it is the one this page exists
 * for; View and Delete are quiet until the row is hovered or focused.
 */
const ManageBlogCard = ({ blog }: IProps) => {
  const { title, content, coverImage, createdAt, updatedAt, category, slug, _id } =
    blog ?? {};

  const parsedContent = parseHtmlContent(content ?? "");
  const excerpt =
    parsedContent.length > 180
      ? `${parsedContent.substring(0, 180).trimEnd()}…`
      : parsedContent;

  const views = blog.totalViews ?? 0;
  const comments = blog.totalComments ?? 0;
  // "Edited" earns its place only when it actually happened after publishing.
  const edited =
    updatedAt && createdAt
      ? new Date(updatedAt).getTime() - new Date(createdAt).getTime() > 60_000
      : false;

  return (
    <article className="group relative flex gap-4 border-b border-default-200 py-5 transition-colors focus-within:bg-default-50/60 hover:bg-default-50/60 dark:focus-within:bg-default-100/5 dark:hover:bg-default-100/5">
      {coverImage ? (
        <Link
          href={editBlogPath(slug)}
          tabIndex={-1}
          aria-hidden
          className="hidden w-28 shrink-0 overflow-hidden rounded-[10px] border border-default-200 sm:block"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={coverImage}
            alt=""
            className="aspect-[16/10] h-full w-full object-cover"
            loading="lazy"
          />
        </Link>
      ) : (
        <div
          aria-hidden
          className="hidden w-28 shrink-0 rounded-[10px] border border-dashed border-default-200 sm:block"
        />
      )}

      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-x-2 text-xs text-default-600">
          {category?.name && (
            <span className="font-medium text-default-700">{category.name}</span>
          )}
          {category?.name && createdAt && (
            <span aria-hidden className="text-default-300">
              ·
            </span>
          )}
          {createdAt && (
            <time dateTime={createdAt} className="tabular-nums">
              {formatDate(createdAt)}
            </time>
          )}
          {edited && <span className="text-default-600">· edited</span>}
        </p>

        <h3 className="mt-1 text-pretty text-base font-semibold leading-snug text-foreground">
          <Link
            href={editBlogPath(slug)}
            className="rounded-sm underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-300"
          >
            {title}
          </Link>
        </h3>

        {excerpt && (
          <p className="mt-1 line-clamp-1 text-sm leading-relaxed text-default-600">
            {excerpt}
          </p>
        )}

        <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-default-600">
          <span className="inline-flex items-center gap-1.5">
            <FiEye aria-hidden className="size-3.5 text-default-600" />
            <span className="tabular-nums">
              {views.toLocaleString()} {views === 1 ? "view" : "views"}
            </span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <HiOutlineChatBubbleLeftEllipsis
              aria-hidden
              className="size-3.5 text-default-600"
            />
            <span className="tabular-nums">
              {comments.toLocaleString()}{" "}
              {comments === 1 ? "comment" : "comments"}
            </span>
          </span>
          <span className="text-success-700 dark:text-success">Published</span>

          <div className="ml-auto flex items-center gap-1">
            <Link
              href={editBlogPath(slug)}
              className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-default-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-300"
            >
              <FiEdit3 aria-hidden className="size-3.5" />
              Edit
            </Link>
            <Link
              href={`/blogs/${slug}`}
              className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium text-default-600 transition-colors hover:bg-default-100 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-300"
            >
              View
            </Link>
            <UserDeleteBlogModal id={_id} title={title} />
          </div>
        </div>
      </div>
    </article>
  );
};

export default ManageBlogCard;
