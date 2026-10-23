import BlogShare from "@/components/modules/blog/blog-share";
import CommentJumpButton from "@/components/modules/blog/comment-jump-button";
import ButtonLink from "@/components/ui/button-link";
import DownVoteButton from "@/components/ui/downvote-button";
import FollowUnFollowButton from "@/components/ui/follow-unfollow-button";
import PrintBlogButton from "@/components/ui/print-blog-button";
import UpVoteButton from "@/components/ui/upvote-button";
import type { IBlog } from "@/types";
import type { IUser } from "@/types/user.type";
import { formatBlogDate } from "@/utils";
import { Avatar } from "@heroui/avatar";
import Link from "next/link";
import { BiDownvote, BiUpvote } from "react-icons/bi";
import { FiArrowUp } from "react-icons/fi";

const VoteCount = ({ value }: { value: number }) => {
  if (value <= 0) return null;
  return (
    <span className="min-w-4 text-center text-xs tabular-nums text-default-600">
      {value.toLocaleString()}
    </span>
  );
};

interface EndMatterProps {
  blog: IBlog;
}

/**
 * What the reader can do once the article ends: say whether it helped, talk
 * about it, take it with them. One ruled block, quiet controls, no card.
 */
export const ArticleEndMatter = ({ blog }: EndMatterProps) => {
  const { _id, slug, title, upVotes, downVotes, totalComments } = blog;

  const up = upVotes ?? 0;
  const down = downVotes ?? 0;

  return (
    <section
      aria-labelledby="article-end-matter"
      className="mt-14 border-t border-default/60 pt-6 print:hidden"
    >
      <h2 id="article-end-matter" className="tth-label">
        Was this useful?
      </h2>

      <div className="mt-3 flex flex-wrap items-center justify-start gap-x-6 gap-y-4 sm:justify-between">
        <div className="flex items-center gap-1">
          <UpVoteButton
            blogId={_id}
            slug={slug}
            radius="full"
            variant="light"
            isIconOnly
            className="size-11"
            aria-label={up > 0 ? `Upvote this article, ${up} so far` : "Upvote this article"}
          >
            <BiUpvote aria-hidden className="text-lg" />
          </UpVoteButton>
          <VoteCount value={up} />
          <DownVoteButton
            blogId={_id}
            slug={slug}
            radius="full"
            variant="light"
            isIconOnly
            className="size-11"
            aria-label={
              down > 0
                ? `Downvote this article, ${down} so far`
                : "Downvote this article"
            }
          >
            <BiDownvote aria-hidden className="text-lg" />
          </DownVoteButton>
          <VoteCount value={down} />
        </div>

        {/* The existing controls keep their own props; this wrapper only lifts
            their hit area to the 44px touch minimum. */}
        <div className="flex flex-wrap items-center gap-1 [&_button]:min-h-11 [&_button]:min-w-11">
          <CommentJumpButton count={totalComments ?? 0} />
          <BlogShare path={`/blogs/${slug}`} title={title} />
          <PrintBlogButton blog={blog} />
        </div>
      </div>
    </section>
  );
};

export const ArticleTags = ({ tags }: { tags?: string[] }) => {
  if (!tags || tags.length === 0) return null;

  return (
    <nav
      aria-label="Tags"
      className="mt-10 flex flex-wrap items-center gap-x-2 gap-y-2 print:hidden"
    >
      <span className="tth-label-sm">Tagged</span>
      {tags.map((tag) => (
        <Link
          key={tag}
          href={`/?search=${encodeURIComponent(tag)}`}
          // A chip stays visually small per DESIGN.md; the `::before` gives it a
          // 44px tall touch area that overlaps the row's 44px line box.
          className="relative inline-flex max-w-full cursor-pointer items-center truncate rounded-full border border-default/60 px-2.5 py-0.5 text-xs text-default-700 transition-colors before:absolute before:inset-x-0 before:-inset-y-2 before:content-[''] hover:border-default-300 hover:bg-default-100 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
        >
          #{tag}
        </Link>
      ))}
    </nav>
  );
};

/**
 * Who wrote this, at the end of it.
 *
 * This is the block that turns a reader into a follower, so it carries real
 * identity rather than a line of text: portrait, display-face name, the facts
 * that decide "should I follow this person" (designation, member since,
 * followers), then the bio. It is a panel, not a list: the warm `content1`
 * surface and slate-grey hairline used by the site's other raised surfaces,
 * 10px radius, no shadow. Follow leads the actions when the reader is not the
 * author; View profile is always there.
 */
export const ArticleAuthor = ({
  author,
  isOwnArticle = false,
}: {
  author?: Partial<IUser>;
  isOwnArticle?: boolean;
}) => {
  if (!author?.username) return null;

  const profileHref = `/users/@${author.username}`;
  const memberSince = formatBlogDate(author.createdAt);
  const followers = author.totalFollowers;

  return (
    <section
      aria-labelledby="article-author"
      className="tth-panel mt-14 px-5 py-6 sm:px-6 print:hidden"
    >
      <h2 id="article-author" className="tth-label">
        Written by
      </h2>

      <div className="mt-4 flex items-start gap-4 sm:gap-5">
        {/* Visual only: the name below and "View profile" are the real links. */}
        <Link
          href={profileHref}
          tabIndex={-1}
          aria-hidden
          className="shrink-0"
        >
          <Avatar
            className="size-14 sm:size-16"
            radius="full"
            src={author.profilePicture}
            name={author.fullName}
            showFallback
          />
        </Link>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
            <div className="min-w-0">
              <p className="font-[family-name:var(--type-editorial)] text-xl font-semibold leading-tight tracking-[-0.01em]">
                <Link
                  href={profileHref}
                  className="transition-colors hover:text-primary-accessible focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                >
                  {author.fullName}
                </Link>
              </p>
              <p className="mt-1 truncate font-sans text-xs text-default-600">
                @{author.username}
                {author.designation && (
                  <>
                    <span aria-hidden className="mx-1.5 text-default-300">
                      ·
                    </span>
                    {author.designation}
                  </>
                )}
              </p>
            </div>

            {!isOwnArticle && author._id && (
              // The control keeps its own logic; this wrapper stops it
              // stretching and lifts it to the 44px touch size.
              <div className="flex shrink-0 items-center [&_a]:min-h-11 [&_button]:min-h-11 [&_a]:w-auto [&_button]:w-auto">
                <FollowUnFollowButton id={author._id} />
              </div>
            )}
          </div>

          {author.bio && (
            <p className="mt-3 text-sm leading-relaxed text-default-700">
              {author.bio}
            </p>
          )}

          <div
            className={`flex flex-wrap items-center justify-between gap-x-4 gap-y-2 ${
              author.bio ? "mt-4" : "mt-3"
            }`}
          >
            <p className="flex flex-wrap items-center gap-x-2 text-xs text-default-600">
              {typeof followers === "number" && followers > 0 && (
                <span className="tabular-nums">
                  {followers.toLocaleString()}{" "}
                  {followers === 1 ? "follower" : "followers"}
                </span>
              )}
              {typeof followers === "number" &&
                followers > 0 &&
                memberSince && (
                  <span aria-hidden className="text-default-300">
                    ·
                  </span>
                )}
              {memberSince && <span>Joined {memberSince}</span>}
            </p>

            <ButtonLink
              href={profileHref}
              variant="bordered"
              size="sm"
              className="min-h-11"
            >
              View profile
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
};

/**
 * A link back to the article title, for readers who arrive at the discussion
 * first (from a comment notification) or want the headline again.
 */
export const BackToTop = () => (
  <p className="mt-12 print:hidden">
    <a
      href="#article-start"
      className="inline-flex min-h-11 items-center gap-1.5 text-sm text-default-600 transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
    >
      <FiArrowUp aria-hidden className="size-4" />
      Back to the top
    </a>
  </p>
);
