import AdBanner from "@/components/adsense/ad-banner";
import Container from "@/components/ui/container";
import BlogComments from "@/components/modules/post/blog-comments";
import BlogViewCounter from "@/components/modules/post/blog-view-counter";
import BlogShare from "@/components/modules/post/blog-share";
import CommentJumpButton from "@/components/modules/post/comment-jump-button";
import ReadingProgress from "@/components/modules/post/reading-progress";
import ButtonLink from "@/components/ui/button-link";
import DownVoteButton from "@/components/ui/downvote-button";
import FollowUnFollowButton from "@/components/ui/follow-unfollow-button";
import PrintBlogButton from "@/components/ui/print-blog-button";
import UpVoteButton from "@/components/ui/upvote-button";
import { poppins } from "@/config/fonts";
import { getAllPosts, getCommentsByPostId, getPostBySlug } from "@/services/post";
import { IPost } from "@/types";
import { IComment } from "@/types/comment.type";
import { formatPostDate } from "@/utils";
import { Avatar } from "@heroui/avatar";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { AiOutlineComment } from "react-icons/ai";
import { BiDownvote, BiUpvote } from "react-icons/bi";
import { FiArrowLeft } from "react-icons/fi";

type Props = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 43200; // Revalidate every 12 hours (43200 seconds)

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await getPostBySlug(slug);
  const { title, content, coverImage } = (data?.data as IPost) ?? {};

  const description = content?.substring(0, 150) + "...";
  const blogUrl = `https://techtipshub.vercel.app/blogs/${slug}`;

  return {
    title: title,
    description: description,
    keywords: `${title}, TechTips Hub, blog post, technology, tutorial`,
    openGraph: {
      title: title,
      description: description,
      url: blogUrl,
      images: [{ url: coverImage }],
      siteName: "TechTips Hub",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: title,
      description: description,
      images: [coverImage],
    },
  };
}

export async function generateStaticParams() {
  try {
    const response = await getAllPosts({ limit: "100" });
    const posts = response?.data as IPost[];

    if (!posts || !Array.isArray(posts)) {
      return [];
    }

    return posts.map((post) => ({
      slug: post.slug,
    }));
  } catch (error) {
    console.error("Error generating static params for blogs:", error);
    return [];
  }
}

const readingMinutes = (html?: string) => {
  if (!html) return null;
  const words = html.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
};

const DynamicBlogPage = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug: routeSlug } = await params;
  const data = await getPostBySlug(routeSlug);
  const {
    _id,
    coverImage,
    title,
    author,
    createdAt,
    content,
    isLocked,
    tags,
    totalViews,
    upVotes,
    downVotes,
    totalComments,
    slug,
    category,
  } = (data?.data as IPost) ?? {};

  let comments: IComment[] = [];
  if (data?.success) {
    const res = await getCommentsByPostId(_id);
    comments = ((res?.data as IComment[]) ?? []).filter(
      (comment) => !comment.isDeleted,
    );
  }

  const minutes = readingMinutes(content);
  const loginHref = `/login?redirect=blogs/${routeSlug}`;

  return (
    <section className="pb-14">
      <ReadingProgress targetId="article-body" />
      <Container>
        {!data?.success ? (
          <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
            <p className="text-sm font-medium uppercase tracking-wider text-primary">
              {data?.statusCode === 404 ? "404" : "Article"}
            </p>
            <h1 className="text-2xl font-bold tracking-tight">
              {data?.statusCode === 404
                ? "We could not find that article"
                : "Please sign in to read this article"}
            </h1>
            <p className="max-w-sm text-default-600">
              {data?.statusCode === 404
                ? "It may have been removed, or the link may be wrong."
                : "This article is part of the reading experience for members."}
            </p>
            <div className="mt-2 flex flex-wrap justify-center gap-3">
              <ButtonLink
                href={data?.statusCode === 404 ? "/" : loginHref}
                color="primary"
              >
                {data?.statusCode === 404 ? "Back to the feed" : "Log in"}
              </ButtonLink>
              <ButtonLink
                href="/"
                variant="bordered"
                startContent={<FiArrowLeft aria-hidden />}
              >
                Browse articles
              </ButtonLink>
            </div>
          </div>
        ) : (
          <article
            id="article-body"
            className="mx-auto max-w-3xl scroll-mt-20 pt-6 print:max-w-xl"
          >
            <Link
              href="/"
              className="mb-6 inline-flex items-center gap-1.5 text-sm text-default-500 transition-colors hover:text-primary print:hidden"
            >
              <FiArrowLeft aria-hidden className="size-4" />
              All articles
            </Link>

            <header className="space-y-5">
              {category?.name && (
                <Link
                  href={`/?category=${encodeURIComponent(category.name)}`}
                  className="inline-flex rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-primary hover:bg-primary/20"
                >
                  {category.name}
                </Link>
              )}

              <h1
                className={`${poppins.className} text-pretty text-3xl font-bold leading-[1.15] tracking-tight lg:text-[2.75rem] print:text-3xl`}
              >
                {title}
              </h1>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-3 border-b border-default/60 pb-5 text-sm">
                <Link
                  href={`/users/@${author?.username}`}
                  className="group flex items-center gap-3"
                >
                  <Avatar
                    className="size-10 shrink-0"
                    radius="full"
                    src={author?.profilePicture}
                    name={author?.fullName}
                    showFallback
                  />
                  <div className="leading-tight">
                    <p className="text-sm font-semibold text-foreground group-hover:text-primary">
                      {author?.fullName}
                    </p>
                    {author?.username && (
                      <p className="text-xs text-default-500">
                        @{author.username}
                      </p>
                    )}
                  </div>
                </Link>

                <span aria-hidden className="hidden text-default-300 sm:inline">
                  ·
                </span>

                {formatPostDate(createdAt) && (
                  <time
                    dateTime={createdAt}
                    className="text-xs text-default-500"
                  >
                    {formatPostDate(createdAt)}
                  </time>
                )}

                {minutes && (
                  <span className="text-xs text-default-500">
                    {minutes} min read
                  </span>
                )}

                <span className="flex items-center gap-4 text-xs text-default-500">
                  <BlogViewCounter slug={routeSlug} fallback={totalViews} />
                  <span className="flex items-center gap-1.5">
                    <AiOutlineComment aria-hidden className="text-base" />
                    <span className="tabular-nums">
                      {(totalComments ?? 0).toLocaleString()}
                    </span>
                    {(totalComments ?? 0) === 1 ? "comment" : "comments"}
                  </span>
                </span>

                <div className="ml-auto flex items-center gap-2 print:hidden">
                  <FollowUnFollowButton id={author?._id} />
                </div>
              </div>
            </header>

            {coverImage && (
              <div className="relative mt-6 -mx-2 h-56 overflow-hidden rounded-xl bg-default-100 sm:mx-0 sm:h-72 lg:h-80 print:hidden">
                <Image
                  className="object-cover"
                  src={coverImage}
                  alt={title}
                  fill
                  priority
                  sizes="(min-width: 1024px) 768px, 100vw"
                />
              </div>
            )}

            <div className="mt-6 print:hidden">
              <AdBanner />
            </div>

            <div className="prose prose-neutral mt-8 max-w-none dark:prose-invert prose-headings:font-semibold prose-a:text-primary prose-img:rounded-lg">
              {isLocked ? (
                <div className="not-prose space-y-4 rounded-xl border border-default/60 bg-default-50 p-6 text-center">
                  <p className="text-sm text-default-600">
                    Sign in to read the full article. Anyone can create a free
                    account.
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <ButtonLink href={loginHref} color="primary">
                      Log in
                    </ButtonLink>
                    <ButtonLink href="/signup" variant="flat">
                      Create account
                    </ButtonLink>
                  </div>
                </div>
              ) : (
                <div dangerouslySetInnerHTML={{ __html: content }} />
              )}
            </div>

            {/* Actions: votes on the left, conversation and sharing on the right */}
            <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-y border-default/60 py-3 print:hidden">
              <div className="flex items-center gap-0.5">
                <UpVoteButton
                  postId={_id}
                  className="text-3xl"
                  radius="full"
                  variant="light"
                  isIconOnly
                  slug={slug}
                >
                  <BiUpvote aria-hidden className="text-lg" />
                </UpVoteButton>
                <span className="min-w-6 text-center text-sm font-medium tabular-nums text-default-600">
                  {upVotes ?? 0}
                </span>
                <DownVoteButton
                  postId={_id}
                  className="text-3xl"
                  radius="full"
                  variant="light"
                  isIconOnly
                  slug={slug}
                >
                  <BiDownvote aria-hidden className="text-lg" />
                </DownVoteButton>
                {downVotes > 0 && (
                  <span className="min-w-6 text-center text-sm tabular-nums text-default-500">
                    {downVotes}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1">
                <CommentJumpButton count={totalComments ?? 0} />
                <BlogShare path={`/blogs/${slug}`} title={title} />
                <PrintBlogButton blog={data?.data} />
              </div>
            </div>

            {tags?.length > 0 && (
              <div className="mt-6 flex flex-wrap items-center gap-2 print:hidden">
                <span className="text-xs font-semibold uppercase tracking-wider text-default-500">
                  Tagged
                </span>
                {tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/?search=${encodeURIComponent(tag)}`}
                    className="rounded-md bg-default-100 px-2.5 py-1 text-xs font-medium text-default-600 transition-colors hover:bg-default-200 hover:text-foreground"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}

            {/* Author card */}
            {author && (
              <div className="mt-10 flex flex-col gap-4 rounded-2xl border border-default/60 bg-default-50/60 p-5 sm:flex-row sm:items-center print:hidden">
                <Avatar
                  className="size-14 shrink-0"
                  src={author.profilePicture}
                  name={author.fullName}
                  showFallback
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-default-500">
                    Written by
                  </p>
                  <Link
                    href={`/users/@${author.username}`}
                    className="text-base font-semibold hover:text-primary"
                  >
                    {author.fullName}
                  </Link>
                  {author.bio && (
                    <p className="mt-1 line-clamp-2 text-sm text-default-600">
                      {author.bio}
                    </p>
                  )}
                </div>
                <ButtonLink
                  href={`/users/@${author.username}`}
                  variant="bordered"
                  className="shrink-0"
                >
                  View profile
                </ButtonLink>
              </div>
            )}

            <div className="mt-10 print:hidden">
              <AdBanner />
            </div>

            <div className="mt-10">
              <BlogComments
                postId={_id}
                comments={comments}
                totalComments={totalComments ?? 0}
                redirectPath={`blogs/${routeSlug}`}
              />
            </div>
          </article>
        )}
      </Container>
    </section>
  );
};

export default DynamicBlogPage;
