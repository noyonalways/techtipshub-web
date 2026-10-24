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
import { excerpt } from "@/lib/seo";
import { decodeSlug } from "@/lib/slug";
import { getCommentsByBlogId, getPublishedBlog } from "@/services/blog";
import { blogForBuild, blogStaticParams } from "@/lib/blog-index";
import { IBlog } from "@/types";
import { IComment } from "@/types/comment.type";
import type { Metadata } from "next";
import Image from "next/image";

type Props = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 43200; // Revalidate every 12 hours (43200 seconds)

/**
 * Expiry is driven by the fetch cache, not by a page-level tag: the article
 * body and comments carry the `singleBlog` / `allBlogs` / `comments` tags, and
 * the blog services expire them on create, edit and delete. A page-level
 * `export const tags` is not a segment config here - it makes the route look
 * dynamic and every article stops being prerendered.
 */

/**
 * The article's own row from the build index.
 *
 * `generateStaticParams` already fetched every article once for the whole
 * build, so metadata costs a map lookup instead of a second request per page.
 * A slug published after the last build has no row: the page renders on first
 * request and the article services fill it in from the API.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug: routeSlug } = await params;
  const slug = decodeSlug(routeSlug);
  // The build index has every article; one published after the last build is
  // read once from the cached endpoint instead.
  const indexed = await blogForBuild(slug);
  const blog = indexed ?? (await getPublishedBlog(slug))?.data;
  const { title, content, coverImage, tags, author, createdAt, updatedAt } =
    blog ?? {};

  const description = content ? excerpt(content, 160) : undefined;
  const blogUrl = `/blogs/${slug}`;
  // Blogs without an upload fall back to the brand cover, so a shared link
  // still shows the house mark rather than no image at all.
  const ogImage = coverImage
    ? [{ url: coverImage, alt: title }]
    : [{ url: "/brand/og-image.png", width: 1200, height: 630, alt: siteConfig.name }];
  const published = createdAt ? new Date(createdAt) : undefined;
  const modified = updatedAt ? new Date(updatedAt) : published;

  if (!blog) {
    // A deleted or mistyped slug should drop out of the index, not be
    // remembered as a thin page.
    return {
      title: "Article not found",
      robots: { index: false, follow: false },
    };
  }

  return {
    title: title,
    description: description,
    alternates: { canonical: blogUrl },
    keywords: [...(tags ?? []), siteConfig.name, "blog post", "tutorial"],
    authors: author?.fullName ? [{ name: author.fullName, url: `/users/${author.username}` }] : undefined,
    openGraph: {
      title: title,
      description: description,
      url: blogUrl,
      images: ogImage,
      siteName: siteConfig.name,
      type: "article",
      publishedTime: published?.toISOString(),
      modifiedTime: modified?.toISOString(),
      authors: author?.fullName ? [author.fullName] : undefined,
      tags: tags,
    },
    twitter: {
      card: "summary_large_image",
      title: title,
      description: description,
      images: ogImage.map((image) => image.url),
    },
  };
}

/**
 * Prerender every published article at build time.
 *
 * Paginated past the API's page cap and fetched once for the whole build (see
 * `lib/blog-index`), so a site with a thousand posts still produces a thousand
 * static files instead of stopping at the first hundred.
 */
export async function generateStaticParams() {
  return blogStaticParams();
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
  const slug = decodeSlug(routeSlug);
  const data = await getPublishedBlog(slug);

  if (!data?.success) {
    return (
      <section className="pb-16">
        <Container>
          <ArticleState
            kind={data?.statusCode === 404 ? "notFound" : "auth"}
            loginHref={`/login?redirect=${encodeURIComponent(`blogs/${routeSlug}`)}`}
          />
        </Container>
      </section>
    );
  }

  const {
    _id,
    coverImage,
    title,
    author,
    createdAt,
    updatedAt,
    content,
    isLocked,
    tags,
    totalViews,
    totalComments,
    category,
  } = (data.data as IBlog) ?? {};

  const res = await getCommentsByBlogId(_id);
  const comments = ((res?.data as IComment[]) ?? []).filter(
    (comment) => !comment.isDeleted,
  );

  const minutes = readingMinutes(content);
  const loginHref = `/login?redirect=${encodeURIComponent(`blogs/${routeSlug}`)}`;

  // The author panel hides its Follow control on the reader's own article.
  // That is decided in the browser by `FollowUnFollowButton`, from the session
  // it already holds: reading the cookie here would turn every article into a
  // per-request render, which is what kept these pages out of the static cache.
  const isOwnArticle = false;

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
          itemScope
          itemType="https://schema.org/BlogPosting"
          className="mx-auto max-w-read scroll-mt-20 pt-4 print:max-w-xl print:pt-0"
        >
          {/* Structured data: who wrote it, when, and what it is about. Search
              results and readers both get the byline from one place. */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "BlogPosting",
                headline: title,
                description: excerpt(content, 160),
                image: coverImage ? [coverImage] : undefined,
                datePublished: createdAt,
                dateModified: updatedAt ?? createdAt,
                author: author?.fullName
                  ? {
                      "@type": "Person",
                      name: author.fullName,
                      url: `${siteConfig.url}/users/${author.username}`,
                    }
                  : undefined,
                publisher: {
                  "@type": "Organization",
                  name: siteConfig.name,
                  logo: {
                    "@type": "ImageObject",
                    url: `${siteConfig.url}/brand/icon-512.png`,
                  },
                },
                mainEntityOfPage: `${siteConfig.url}/blogs/${routeSlug}`,
                keywords: tags?.join(", "),
              }),
            }}
          />
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

          {/* Multiplex is a recommendation grid: it belongs where the reader
              has finished and is choosing what to read next, not mid-article.
              It replaces the old display unit here; two ad blocks back to
              back in the same spot tend to perform worse than one. */}
          <div className="mt-14 print:hidden">
            <AdSlot variant="multiplex" placement="article-after-story" />
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
