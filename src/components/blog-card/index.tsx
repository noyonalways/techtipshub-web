import { IBlog } from "@/types";
import { Avatar } from "@heroui/avatar";
import Link from "next/link";
import { AiOutlineComment } from "react-icons/ai";
import { BiDownvote, BiUpvote } from "react-icons/bi";
import { HiOutlineEye } from "react-icons/hi2";
import { parseHtmlContent, formatBlogDate } from "@/utils";
import Image from "next/image";

interface IProps extends IBlog {}

const EXCERPT_LENGTH = 180;

const BlogCard = ({
  author,
  title,
  content,
  totalViews,
  totalComments,
  coverImage,
  createdAt,
  downVotes,
  upVotes,
  category,
  slug,
}: IProps) => {
  const parsedContent = parseHtmlContent(content);
  const excerpt =
    parsedContent.length > EXCERPT_LENGTH
      ? `${parsedContent.substring(0, EXCERPT_LENGTH).trimEnd()}…`
      : parsedContent;

  // Show a counter only when the database actually holds a value for it, so a
  // brand new blog reads as new rather than as an abandoned one.
  const hasVotes = upVotes > 0 || downVotes > 0;
  const publishedOn = formatBlogDate(createdAt);

  return (
    <article className="group w-full">
      <Link
        href={`/blogs/${slug}`}
        className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded-lg"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-center gap-2 text-xs text-default-600">
              <span className="rounded-full bg-default-100 px-2 py-0.5 font-medium text-default-600 dark:bg-default-50">
                {category?.name}
              </span>
            </div>

            <h2 className="text-pretty font-[family-name:var(--type-editorial)] text-xl font-semibold leading-[1.2] tracking-[-0.005em] text-foreground transition-colors group-hover:text-primary-accessible sm:text-[1.4rem]">
              {title}
            </h2>

            {excerpt && (
              <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-default-600">
                {excerpt}
              </p>
            )}
          </div>

        {coverImage && (
          <div className="shrink-0 overflow-hidden rounded-lg bg-default-100 sm:w-40 lg:w-44">
            <div className="relative aspect-[16/10]">
              <Image
                className="object-cover"
                src={coverImage}
                alt=""
                fill
                sizes="(min-width: 1024px) 176px, (min-width: 640px) 160px, 100vw"
              />
            </div>
          </div>
        )}
        </div>
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <div className="flex min-w-0 items-center gap-2">
          <Avatar
            className="size-6 shrink-0"
            radius="full"
            src={author?.profilePicture}
            name={author?.fullName}
            showFallback
          />
          <Link
            href={`/users/@${author?.username}`}
            className="truncate text-xs font-medium text-foreground hover:text-primary-accessible"
          >
            {author?.fullName}
          </Link>
          {publishedOn && (
            <>
              <span aria-hidden className="text-default-600">
                ·
              </span>
              <time
                dateTime={createdAt}
                className="whitespace-nowrap text-xs text-default-600"
              >
                {publishedOn}
              </time>
            </>
          )}
        </div>

        {(hasVotes || totalComments > 0 || totalViews > 0) && (
          <div className="flex items-center gap-3 text-xs tabular-nums text-default-600">
            {hasVotes && (
              <span className="flex items-center gap-2" aria-label="Votes">
                <span className="flex items-center gap-1">
                  <BiUpvote aria-hidden size={14} />
                  {upVotes}
                </span>
                {downVotes > 0 && (
                  <span className="flex items-center gap-1">
                    <BiDownvote aria-hidden size={14} />
                    {downVotes}
                  </span>
                )}
              </span>
            )}
            {totalComments > 0 && (
              <span
                className="flex items-center gap-1"
                aria-label={`${totalComments} comments`}
              >
                <AiOutlineComment aria-hidden size={14} />
                {totalComments}
              </span>
            )}
            {totalViews > 0 && (
              <span
                className="flex items-center gap-1"
                aria-label={`${totalViews} views`}
              >
                <HiOutlineEye aria-hidden size={14} />
                {totalViews}
              </span>
            )}
          </div>
        )}
      </div>
    </article>
  );
};

export default BlogCard;
