import BlogViewCounter from "@/components/modules/blog/blog-view-counter";
import FollowUnFollowButton from "@/components/ui/follow-unfollow-button";
import type { ICategory } from "@/types/category.type";
import type { IUser } from "@/types/user.type";
import { formatBlogDate } from "@/utils";
import { Avatar } from "@heroui/avatar";
import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";

interface IProps {
  slug: string;
  title: string;
  author?: Partial<IUser>;
  category?: Partial<ICategory>;
  createdAt?: string;
  /** Null when the body has no readable words. */
  minutes: number | null;
  views: number;
}

/**
 * The article's opening screen.
 *
 * Follows DESIGN.md's identity motif (the left-aligned measure): the back
 * link, category, title, byline and the divider between them all start on the
 * reading column's left edge. The category is a quiet amber word above the
 * title rather than a pill, and the byline is one ruled row: identity on the
 * left, the one action (Follow) on the far right, the facts on a muted line
 * under it. Nothing here is a card; hairlines do the framing.
 */
const ArticleHeader = ({
  slug,
  title,
  author,
  category,
  createdAt,
  minutes,
  views,
}: IProps) => {
  const profileHref = author?.username ? `/users/@${author.username}` : null;
  const publishedOn = formatBlogDate(createdAt);

  return (
    <header>
      <Link
        href="/"
        className="inline-flex min-h-11 items-center gap-1.5 text-sm text-default-600 transition-colors hover:text-primary-accessible focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus print:hidden"
      >
        <FiArrowLeft aria-hidden className="size-4" />
        All articles
      </Link>

      {category?.name && (
        <p className="mt-5">
          <Link
            href={`/?category=${encodeURIComponent(category.name)}`}
            className="tth-label text-primary-accessible underline-offset-4 transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          >
            {category.name}
          </Link>
        </p>
      )}

      <h1 className="mt-2 text-pretty font-[family-name:var(--type-editorial)] text-[1.9rem] font-semibold leading-[1.1] tracking-[-0.015em] sm:text-[2.4rem] lg:text-[2.75rem] print:text-3xl">
        {title}
      </h1>

      <div className="mt-7 border-y border-default/60 py-4 print:border-0 print:py-0">
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <Avatar
              className="size-10 shrink-0"
              radius="full"
              src={author?.profilePicture}
              name={author?.fullName}
              showFallback
            />

            <div className="min-w-0">
              <p className="truncate font-sans text-sm font-semibold leading-5">
                {profileHref ? (
                  <Link
                    href={profileHref}
                    className="transition-colors hover:text-primary-accessible focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                  >
                    {author?.fullName}
                  </Link>
                ) : (
                  author?.fullName
                )}
              </p>
              <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-default-600">
                {author?.username && <span>@{author.username}</span>}
                {publishedOn && (
                  <>
                    {author?.username && (
                      <span aria-hidden className="text-default-300">
                        ·
                      </span>
                    )}
                    <time dateTime={createdAt} className="whitespace-nowrap">
                      {publishedOn}
                    </time>
                  </>
                )}
              </p>
            </div>
          </div>

          {author?._id && (
            // The control keeps its own logic; this wrapper only stops it
            // stretching across the row and lifts it to the 44px touch size.
            <div className="flex shrink-0 items-center [&_a]:min-h-11 [&_button]:min-h-11 [&_a]:w-auto [&_button]:w-auto print:hidden">
              <FollowUnFollowButton id={author._id} />
            </div>
          )}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-default-600">
          {minutes !== null && (
            <span className="whitespace-nowrap">{minutes} min read</span>
          )}

          <BlogViewCounter slug={slug} fallback={views} />
        </div>
      </div>
    </header>
  );
};

export default ArticleHeader;
