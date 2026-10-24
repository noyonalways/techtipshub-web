import { AdSlot, MemberAdSlot } from "@/components/adsense";
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
import ArticleAccess from "@/components/modules/blog/article-access";
import Container from "@/components/ui/container";
import { siteConfig } from "@/config/site";
import { articlePreviewPath } from "@/lib/article-access";
import { articlePreviewHtml } from "@/lib/article-preview";
import { excerpt } from "@/lib/seo";
import { decodeSlug } from "@/lib/slug";
import { getArticlePage } from "@/services/blog/article-page";
import type { IBlog } from "@/types";
import { blogForBuild, blogStaticParams } from "@/lib/blog-index";
import type { Metadata } from "next";
import Image from "next/image";

type Props = {
  params: Promise<{ slug: string }>;
};

/**
 * Expiry is driven by the data layer, not by a page-level tag: the article and
 * comments carry the `articleData` tag, and the blog services expire it when an
 * article or a comment changes. A page-level `export const tags` is not a
 * segment config here - it makes the route look dynamic and every article stops
 * being prerendered.
 */

/**
 * The article's own row from the build index.
 *
 * `generateStaticParams` already fetched every article once for the whole
 * build, so metadata costs a map lookup instead of a second request per page.
 * A slug published after the last build has no row: the page reads it from the
 * service instead, which fetches the current version and binds the page to it.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug: routeSlug } = await params;
  const slug = decodeSlug(routeSlug);
  // The build index has every article; a slug published after the last build
  // is rendered by the page itself, so its metadata comes from that render.
  const blog = (await blogForBuild(slug)) as unknown as IBlog | undefined;
  const { title, content, coverImage, tags, author, createdAt, updatedAt } =
    blog ?? {};

  const description = content ? excerpt(content, 160) : undefined;
  // The canonical address is the preview variant: it is the one search engines
  // and link unfurls can read without a session. The page itself still lives at
  // the plain address and is what members are served.
  const canonical = articlePreviewPath(slug);
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
    alternates: { canonical },
    keywords: [...(tags ?? []), siteConfig.name, "blog post", "tutorial"],
    authors: author?.fullName ? [{ name: author.fullName, url: `/users/${author.username}` }] : undefined,
    openGraph: {
      title: title,
      description: description,
      url: canonical,
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
 * The stored `params` carry the article's `updatedAt` as of the build, which is
 * how the page knows whether it still holds the current version.
 */
export async function generateStaticParams() {
  return blogStaticParams();
}

const readingMinutes = (html?: string) => {
  if (!html) return null;
  const words = html.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
};

const DynamicBlogPage = async ({ params }: Props) => {
  // `updatedAt` is what the build stored in `params` — the version this page
  // was rendered with. A route that was not prerendered stores none.
  const { slug: routeSlug, updatedAt: builtAsOf } = (await params) as {
    slug: string;
    updatedAt?: string;
  };

  const slug = decodeSlug(routeSlug);

  // The plain address is what members are served, and what a preview link is
  // redirected from (see `proxy.ts`): a crawler, or anyone without a session,
  // ends up on the preview variant.
  const page = await getArticlePage(slug, builtAsOf);

  if (!page.blog) {
    return (
      <section className="pb-16">
        <Container>
          <ArticleState
            kind="notFound"
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
    tags,
    totalViews,
    totalComments,
    category,
  } = page.blog;
  const comments = page.comments;

  const minutes = readingMinutes(content);
  const loginHref = `/login?redirect=${encodeURIComponent(`blogs/${routeSlug}`)}`;

  // The author panel hides its Follow control on the reader's own article.
  // That is decided in the browser by `FollowUnFollowButton`, from the session
  // it already holds: reading the cookie here would turn every article into a
  // per-request render, which is what kept these pages out of the static cache.
  const isOwnArticle = false;

  // What a visitor without a session is given server-side: the introduction,
  // cut where the member reading experience cuts the body for its ad. This is
  // the only version of the body a crawler is shown.
  const previewBody = articlePreviewHtml(content);

  // The in-article unit goes between the opening paragraph and the rest. A
  // body with no safe paragraph break renders whole, with the ad after it.
  // Both halves keep their own class so the body's type rules stay continuous.
  const introSplit = splitAfterIntro(content);

  // Headlines for search engines, link unfurls and anything that does not run
  // the reader check: the server-rendered preview, whole body never. This is
  // also what a visitor sees while their session is being checked.
  const previewColumn = (
    <>
      <div
        className="tth-article mt-10 print:mt-0"
        dangerouslySetInnerHTML={{ __html: previewBody }}
      />
      <LockedArticle loginHref={loginHref} />
    </>
  );

  // The body for members. Ads sit inside it and only load once the reader is
  // confirmed, so a cached copy watched by a guest requests nothing.
  const memberColumn = introSplit ? (
    <>
      <div
        className="tth-article mt-10 print:mt-0"
        dangerouslySetInnerHTML={{ __html: introSplit[0] }}
      />
      <MemberAdSlot
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
      <MemberAdSlot
        variant="inArticle"
        placement="article-after-intro"
        className="mt-10 print:hidden"
      />
    </>
  );

  // The two columns are always in the document; CSS picks one from
  // `data-article-view`, which the per-request reader answer writes (see the
  // article access rules in `globals.css`). Neither the page nor its caching
  // depends on who is asking.
  const readableColumn = (
    <div data-article-access>
      <ArticleAccess slug={slug} />
      <div data-article-for="guest">{previewColumn}</div>
      <div data-article-for="member">{memberColumn}</div>
    </div>
  );

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
                mainEntityOfPage: `${siteConfig.url}${articlePreviewPath(slug)}`,
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
              minutes={minutes}
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

          {readableColumn}

          <ArticleEndMatter blog={page.blog} />

          <ArticleTags tags={tags} />

          <ArticleAuthor author={author} isOwnArticle={isOwnArticle} />

          {/* Multiplex is a recommendation grid: it belongs where the reader
              has finished and is choosing what to read next, not mid-article.
              It replaces the old display unit here; two ad blocks back to back
              in the same spot tend to perform worse than one. */}
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
