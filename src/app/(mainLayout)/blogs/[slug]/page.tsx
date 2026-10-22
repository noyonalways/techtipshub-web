import AdBanner from "@/components/adsense/ad-banner";
import CommentCard from "@/components/comment-card";
import CommentForm from "@/components/modules/post/comment-form";
import BlogCommentButton from "@/components/ui/blog-comment-button";
import BlogShareDropdown from "@/components/ui/blog-share-dropdown";
import Container from "@/components/ui/container";
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
import { Button } from "@heroui/button";
import type { Metadata } from "next";
import Link from "next/link";
import { BiDownvote, BiUpvote } from "react-icons/bi";
import { HiOutlineEye } from "react-icons/hi2";
import { IoDiamondOutline } from "react-icons/io5";
import Image from "next/image";

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

const DynamicBlogPage = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug: routeSlug } = await params;
  const data = await getPostBySlug(routeSlug);
  const {
    _id,
    coverImage,
    title,
    author,
    contentType,
    createdAt,
    isPremium,
    content,
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
    comments = res?.data as IComment[];
  }

  return (
    <section className="pb-10">
      <Container>
        <>
          {!data?.success ? (
            <>
              {data?.statusCode === 401 && (
                <div className="text center space-y-4 w-full flex flex-col items-center justify-center h-[calc(100vh-410px)]">
                  <p className="text-center text-default-600">
                    Accessing premium content requires logging in.
                  </p>
                  <Link href={`/login?redirect=blogs/${routeSlug}`}>
                    <Button radius="full" variant="solid" color="primary">
                      Login
                    </Button>
                  </Link>
                </div>
              )}
              {data?.statusCode === 403 && (
                <div className="text center space-y-4 w-full flex flex-col items-center justify-center h-[calc(100vh-410px)]">
                  <p className="text-center text-default-600">
                    {data?.message}
                  </p>
                  <Link href="/subscriptions">
                    <Button radius="full" variant="solid" color="primary">
                      Get Premium
                    </Button>
                  </Link>
                </div>
              )}
              {data?.statusCode === 404 && (
                <div className="text center space-y-4 w-full flex flex-col items-center justify-center h-[calc(100vh-410px)]">
                  <p className="text-center text-default-600">Blog not found</p>
                  <Link href={`/`}>
                    <Button radius="full" variant="solid" color="primary">
                      Back to Feed
                    </Button>
                  </Link>
                </div>
              )}
            </>
          ) : (
            <article className="mx-auto max-w-3xl space-y-8 pt-6 print:max-w-xl">
              <header className="space-y-5">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <Link
                    href={`/?category=${encodeURIComponent(category?.name ?? "")}`}
                    className="rounded-full bg-default-100 px-2.5 py-1 font-medium text-default-600 hover:bg-default-200"
                  >
                    {category?.name}
                  </Link>
                  {isPremium && (
                    <span className="flex items-center gap-1 rounded-full bg-secondary/15 px-2.5 py-1 font-medium text-secondary">
                      <IoDiamondOutline aria-hidden />
                      Premium
                    </span>
                  )}
                </div>

                <h1
                  className={`${poppins.className} text-pretty text-3xl font-bold leading-tight tracking-tight lg:text-[2.75rem] print:text-3xl`}
                >
                  {title}
                </h1>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-3 border-b border-default/60 pb-5">
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

                  {formatPostDate(createdAt) && (
                    <div className="text-xs text-default-500">
                      <time dateTime={createdAt}>
                        {formatPostDate(createdAt)}
                      </time>
                    </div>
                  )}

                  <div className="print:hidden">
                    <FollowUnFollowButton id={author?._id} />
                  </div>

                  {totalViews > 0 && (
                    <span className="flex items-center gap-1.5 text-xs text-default-500">
                      <HiOutlineEye aria-hidden className="text-base" />
                      {totalViews.toLocaleString()} views
                    </span>
                  )}
                </div>
              </header>

              {coverImage && (
                <div className="relative -mx-2 h-56 overflow-hidden rounded-xl bg-default-100 sm:mx-0 sm:h-72 lg:h-80 print:hidden">
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

              <div className="print:hidden">
                <AdBanner />
              </div>

              <div className="prose prose-neutral mx-auto max-w-none dark:prose-invert prose-headings:font-semibold prose-a:text-primary prose-img:rounded-lg">
                <div dangerouslySetInnerHTML={{ __html: content }} />
              </div>

              <div className="space-y-10">
                <div className="flex flex-col gap-4 border-y border-default/60 py-3 print:hidden sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center">
                    <UpVoteButton
                      postId={_id}
                      className="text-3xl"
                      radius="full"
                      variant="light"
                      isIconOnly
                      slug={slug}
                    >
                      <BiUpvote className="text-lg" />
                    </UpVoteButton>
                    <span className="min-w-6 text-center text-sm font-medium tabular-nums text-default-600">
                      {upVotes}
                    </span>
                    <DownVoteButton
                      postId={_id}
                      className="text-3xl"
                      radius="full"
                      variant="light"
                      isIconOnly
                      slug={slug}
                    >
                      <BiDownvote className="text-lg" />
                    </DownVoteButton>
                    {downVotes > 0 && (
                      <span className="min-w-6 text-center text-sm tabular-nums text-default-500">
                        {downVotes}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <BlogCommentButton />
                    <BlogShareDropdown />
                    <PrintBlogButton blog={data?.data} />
                  </div>
                </div>

                {tags?.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md bg-default-100 px-2.5 py-1 text-xs font-medium text-default-600"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="print:hidden">
                <AdBanner />
              </div>

              {/* comments */}
              <section id="comments" className="space-y-6">
                <div className="flex items-baseline gap-2">
                  <h2 className="text-xl font-semibold">Comments</h2>
                  {totalComments > 0 && (
                    <span className="text-sm text-default-500">
                      {totalComments}
                    </span>
                  )}
                </div>
                <CommentForm postId={_id} slug={slug} />

                <div className="space-y-4">
                  {comments?.length
                    ? comments.map((comment) => (
                        <CommentCard key={comment._id} {...comment} />
                      ))
                    : null}
                </div>
              </section>
            </article>
          )}
        </>
      </Container>
    </section>
  );
};

export default DynamicBlogPage;
