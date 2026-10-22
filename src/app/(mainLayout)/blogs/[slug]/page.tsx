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
import { Avatar } from "@heroui/avatar";
import { Button } from "@heroui/button";
import { Image as NextImage } from "@heroui/image";
import { Textarea } from "@heroui/input";
import type { Metadata } from "next";
import Link from "next/link";
import { AiOutlineComment } from "react-icons/ai";
import { BiBookmark, BiDownvote, BiUpvote } from "react-icons/bi";
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
  } = (data?.data as IPost) ?? {};

  let comments;
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
            <div className="space-y-4">
              <div className="flex justify-center mt-4 w-full print:max-w-xl print:mx-auto rounded-md overflow-hideen">
                <Image
                  className="w-full h-full"
                  src={coverImage}
                  alt={`${title}-cover-image`}
                  width={800}
                  height={400}
                />
              </div>
              <div className="space-y-14 print:space-y-8">
                <div className="space-y-6">
                  <h1
                    className={`${poppins.className} text-3xl lg:text-4xl font-bold text-center`}
                  >
                    {title}
                  </h1>
                  <div className="flex justify-center lg:justify-center items-center space-x-2 lg:space-x-4 mx-auto w-full max-w-xl">
                    <Link
                      href={`/users/@${author?.username}`}
                      className="flex items-center space-x-4"
                    >
                      <Avatar
                        className="h-8 w-8 object-cover"
                        radius="full"
                        src={author?.profilePicture}
                        name={author?.fullName}
                        isBordered
                      />
                      <h3 className="font-medium text-sm lg:text-lg">
                        {author?.fullName}
                      </h3>
                    </Link>
                    <span className="text-default-500">-</span>
                    <div className="text-default-500 text-xs lg:text-base">
                      {new Date(createdAt)?.toDateString()}
                    </div>

                    <div className="print:hidden">
                      <FollowUnFollowButton id={author?._id} />
                    </div>
                  </div>

                  <div
                    className={`flex flex-col lg:flex-row justify-center items-center gap-4 print:hidden`}
                  >
                    <div className="flex items-center space-x-2">
                      {isPremium && (
                        <Button
                          color="secondary"
                          variant="flat"
                          radius="full"
                          startContent={
                            <IoDiamondOutline className="text-lg" />
                          }
                        >
                          Premium Content
                        </Button>
                      )}

                      {totalViews > 0 && (
                        <Button size="md" variant="flat" radius="full">
                          {totalViews} Views
                        </Button>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 print:hidden">
                      <Button
                        size="md"
                        variant="light"
                        radius="full"
                        startContent={<BiDownvote />}
                      >
                        {downVotes} votes
                      </Button>
                      <Button
                        size="md"
                        variant="light"
                        radius="full"
                        startContent={<BiUpvote />}
                      >
                        {upVotes} votes
                      </Button>
                      <Button
                        size="md"
                        variant="light"
                        radius="full"
                        startContent={<AiOutlineComment />}
                      >
                        {totalComments} comments
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="print:hidden">
                  <AdBanner />
                </div>

                <div className="prose dark:prose-invert max-w-full">
                  <div dangerouslySetInnerHTML={{ __html: content }} />
                </div>

                <div className="space-y-10">
                  <div className="border border-default/50 py-2 px-2 rounded-full w-full max-w-fit mx-auto flex justify-center items-center print:hidden">
                    <div className="border-r border-default/30 ">
                      <DownVoteButton
                        postId={_id}
                        className="text-3xl mr-2"
                        radius="full"
                        variant="light"
                        isIconOnly
                        slug={slug}
                      >
                        <BiDownvote className="text-lg" />
                      </DownVoteButton>
                    </div>

                    <div className="border-r border-default/30 ">
                      <UpVoteButton
                        postId={_id}
                        className="text-3xl mx-2"
                        radius="full"
                        variant="light"
                        isIconOnly
                        slug={slug}
                      >
                        <BiUpvote className="text-lg" />
                      </UpVoteButton>
                    </div>

                    <div className="border-r border-default/30 ">
                      <BlogCommentButton />
                    </div>

                    <div className="border-r border-default/30">
                      <Button
                        className="text-2xl mx-2"
                        variant="light"
                        isIconOnly
                        radius="full"
                      >
                        <BiBookmark />
                      </Button>
                    </div>

                    <div className="border-r border-default/30">
                      <BlogShareDropdown />
                    </div>

                    <div>
                      <PrintBlogButton blog={data?.data} />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 justify-center w-full max-w-3xl flex-wrap mx-auto">
                    {tags?.map((tag) => (
                      <Button key={tag} variant="flat" radius="sm" size="sm">
                        {tag}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="print:hidden">
                  <AdBanner />
                </div>

                {/* comments */}
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Comments</h2>
                  <CommentForm postId={_id} slug={slug} />

                  <div className="mt-8 space-y-4">
                    {comments &&
                      comments?.map((comment) => (
                        <CommentCard key={comment._id} {...comment} />
                      ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      </Container>
    </section>
  );
};

export default DynamicBlogPage;
