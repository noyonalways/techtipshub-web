import { AdSlot } from "@/components/adsense";
import ArticleHeader from "@/components/modules/blog/article-header";
import ArticleState from "@/components/modules/blog/article-state";
import {
  ArticleAuthor,
  ArticleEndMatter,
  ArticleTags,
  BackToTop,
} from "@/components/modules/blog/article-end-matter";
import BlogComments from "@/components/modules/blog/blog-comments";
import LockedArticle from "@/components/modules/blog/locked-article";
import ReadingProgress from "@/components/modules/blog/reading-progress";
import { splitAfterIntro } from "@/components/modules/blog/split-article-intro";
import Container from "@/components/ui/container";
import { siteConfig } from "@/config/site";
import { getAccessToken } from "@/lib/fetch-with-auth";
import {
  getAllBlogs,
  getBlogBySlug,
  getCommentsByBlogId,
} from "@/services/blog";
import { IBlog } from "@/types";
import { IComment } from "@/types/comment.type";
import { jwtTokenDecode } from "@/utils";
import type { Metadata } from "next";
import Image from "next/image";

type Props = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 43200; // Revalidate every 12 hours (43200 seconds)

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await getBlogBySlug(slug);
  const { title, content, coverImage } = (data?.data as IBlog) ?? {};

  const description = content ? content.substring(0, 150) + "..." : undefined;
  const blogUrl = `${siteConfig.url}/blogs/${slug}`;
  // Blogs without an upload fall back to the brand cover, so a shared link
  // still shows the house mark rather than no image at all.
  const ogImage = coverImage
    ? [{ url: coverImage, alt: title }]
    : [{ url: "/brand/og-image.png", width: 1200, height: 630, alt: siteConfig.name }];

  return {
    title: title,
    description: description,
    alternates: { canonical: blogUrl },
    keywords: `${title}, TechTipsHub, blog post, technology, tutorial`,
    openGraph: {
      title: title,
      description: description,
      url: blogUrl,
      images: ogImage,
      siteName: siteConfig.name,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: title,
      description: description,
      images: ogImage.map((image) => image.url),
    },
  };
}

export async function generateStaticParams() {
  try {
    const response = await getAllBlogs({ limit: "100" });
    const blogs = response?.data as IBlog[];

    if (!blogs || !Array.isArray(blogs)) {
      return [];
    }

    return blogs.map((blog) => ({
      slug: blog.slug,
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
  const data = await getBlogBySlug(routeSlug);
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
    totalComments,
    category,
  } = (data?.data as IBlog) ?? {};

  let comments: IComment[] = [];
  if (data?.success) {
    const res = await getCommentsByBlogId(_id);
    comments = ((res?.data as IComment[]) ?? []).filter(
      (comment) => !comment.isDeleted,
    );
  }

  const minutes = readingMinutes(content);
  const loginHref = `/login?redirect=blogs/${routeSlug}`;

  // The author panel hides its Follow control on the reader's own article, and
  // the whole page is cached, so this has to be read per request rather than
  // baked into the rendered HTML.
  let viewerId: string | undefined;
  try {
    const token = await getAccessToken();
    if (token) viewerId = (jwtTokenDecode(token) as { _id?: string })?._id;
  } catch {
    viewerId = undefined;
  }
  const isOwnArticle = Boolean(viewerId && author?._id === viewerId);

  if (!data?.success) {
    return (
      <section className="pb-16">
        <Container>
          <ArticleState
            kind={data?.statusCode === 404 ? "notFound" : "auth"}
            loginHref={loginHref}
          />
        </Container>
      </section>
    );
  }

  // The in-article unit goes between the opening paragraph and the rest. A
  // body with no safe paragraph break renders whole, with the ad after it.
  // Both halves keep their own class so the body's type rules stay continuous.
  const introSplit = isLocked ? null : splitAfterIntro(content);

  return (
    <section className="pb-16">
      <ReadingProgress targetId="article-body" />
      <Container>
        <article
          id="article-body"
          className="mx-auto max-w-read scroll-mt-20 pt-4 print:max-w-xl print:pt-0"
        >
          <div id="article-start" className="scroll-mt-24">
            <ArticleHeader
              slug={routeSlug}
              title={title}
              author={author}
              category={category}
              createdAt={createdAt}
              minutes={isLocked ? null : minutes}
              views={totalViews ?? 0}
            />
          </div>

          {coverImage && (
            <figure className="mt-8 print:hidden">
              <div className="relative aspect-[16/9] overflow-hidden rounded-[10px] border border-default/60 bg-default-100 sm:aspect-[2/1]">
                <Image
                  className="object-cover"
                  src={coverImage}
                  alt={title}
                  fill
                  priority
                  sizes="(min-width: 768px) 46rem, 100vw"
                />
              </div>
            </figure>
          )}

          {isLocked ? (
            <LockedArticle loginHref={loginHref} />
          ) : introSplit ? (
            <>
              <div
                className="tth-article mt-10 print:mt-0"
                dangerouslySetInnerHTML={{ __html: introSplit[0] }}
              />
              <AdSlot
                variant="inArticle"
                placement="article-after-intro"
                className="mt-10 print:hidden"
              />
              <div
                className="tth-article tth-article-continued"
                dangerouslySetInnerHTML={{ __html: introSplit[1] }}
              />
            </>
          ) : (
            <>
              <div
                className="tth-article mt-10 print:mt-0"
                dangerouslySetInnerHTML={{ __html: content ?? "" }}
              />
              <AdSlot
                variant="inArticle"
                placement="article-after-intro"
                className="mt-10 print:hidden"
              />
            </>
          )}

          <ArticleEndMatter blog={data.data as IBlog} />

          <ArticleTags tags={tags} />

          <ArticleAuthor author={author} isOwnArticle={isOwnArticle} />

          <div className="mt-14 print:hidden">
            <AdSlot variant="display" placement="article-before-comments" />
          </div>

          <div className="mt-14">
            <BlogComments
              blogId={_id}
              comments={comments}
              totalComments={totalComments ?? 0}
              redirectPath={`blogs/${routeSlug}`}
            />
          </div>

          <BackToTop />
        </article>
      </Container>
    </section>
  );
};

export default DynamicBlogPage;
