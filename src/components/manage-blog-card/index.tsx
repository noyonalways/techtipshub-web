import { IPost } from "@/types";
import Link from "next/link";
import { FiEdit3, FiEye } from "react-icons/fi";
import { HiOutlineChatBubbleLeftEllipsis } from "react-icons/hi2";
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

// A stable hue per category keeps a long list scannable without a legend.
const categoryTone = (name: string) => {
  let hash = 0;
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) % 360;
  return `hsl(${hash} 62% 42%)`;
};

const ManageBlogCard = ({ post }: IProps) => {
  const { title, content, coverImage, createdAt, category, slug, _id } =
    post ?? {};

  const parsedContent = parseHtmlContent(content ?? "");
  const excerpt =
    parsedContent.length > 160
      ? `${parsedContent.substring(0, 160).trimEnd()}…`
      : parsedContent;

  return (
    <article className="group grid gap-4 border-b border-default/60 py-5 sm:grid-cols-[minmax(0,1fr)_10rem] sm:gap-6">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-xs text-default-500">
          {category?.name && (
            <span
              className="rounded-full border px-2 py-0.5 font-medium"
              style={{
                borderColor: `${categoryTone(category.name)}33`,
                color: categoryTone(category.name),
                backgroundColor: `${categoryTone(category.name)}0d`,
              }}
            >
              {category.name}
            </span>
          )}
          {createdAt && (
            <time dateTime={createdAt} className="tabular-nums">
              {formatDate(createdAt)}
            </time>
          )}
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

        <dl className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-default-500">
          <div className="flex items-center gap-1.5">
            <FiEye aria-hidden className="size-3.5 text-default-400" />
            <dt className="sr-only">Views</dt>
            <dd className="tabular-nums">
              {(post.totalViews ?? 0).toLocaleString()}{" "}
              {(post.totalViews ?? 0) === 1 ? "view" : "views"}
            </dd>
          </div>
          <div className="flex items-center gap-1.5">
            <HiOutlineChatBubbleLeftEllipsis
              aria-hidden
              className="size-3.5 text-default-400"
            />
            <dt className="sr-only">Comments</dt>
            <dd className="tabular-nums">
              {(post.totalComments ?? 0).toLocaleString()}{" "}
              {(post.totalComments ?? 0) === 1 ? "comment" : "comments"}
            </dd>
          </div>
          <div className="flex items-center gap-1.5">
            <dt className="sr-only">Status</dt>
            <dd className="flex items-center gap-1.5 font-medium text-success">
              <span aria-hidden className="size-1.5 rounded-full bg-current" />
              Published
            </dd>
          </div>
        </dl>
      </div>

      <div className="flex items-center gap-3 sm:flex-col sm:items-stretch sm:justify-start">
        {coverImage && (
          <Link
            href={`/blogs/${slug}`}
            className="w-24 shrink-0 overflow-hidden rounded-lg border border-default/60 sm:order-first sm:w-full"
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

        {/* The publish date already labels the card, so the author row was
            repeating the only author who can appear on this page. */}
        <div className="grid flex-1 grid-cols-3 items-center gap-1 sm:flex-none">
          <Link
            href={`/settings/edit/${slug}`}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-sm font-medium text-default-700 transition-colors hover:bg-default-100 hover:text-primary sm:py-1.5"
          >
            <FiEdit3 aria-hidden className="size-4" />
            Edit
          </Link>
          <Link
            href={`/blogs/${slug}`}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-sm font-medium text-default-700 transition-colors hover:bg-default-100 sm:py-1.5"
          >
            <FiEye aria-hidden className="size-4" />
            View
          </Link>
          <UserDeleteBlogModal id={_id} title={title} />
        </div>
      </div>
    </article>
  );
};

export default ManageBlogCard;
