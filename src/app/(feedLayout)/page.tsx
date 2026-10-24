import FeedBlogs from "@/components/modules/feed";
import { getBlogs } from "@/services/blog";
import { IBlog } from "@/types";
import { Metadata } from "next";

/**
 * The landing page. Prerendered, revalidated from the blog services and every
 * half hour as a backstop, so a reader never waits on the API for it.
 *
 * Filtered views live at `/search` and `/categories/<name>`: reading
 * `searchParams` here would make this page render per request, which is the
 * one thing a homepage must not do.
 */
export const revalidate = 1800;

export const metadata: Metadata = {
  title: "Feed",
  description:
    "Stay updated with the latest tech tips, tutorials, and articles. Explore our feed to discover trending posts and expert insights across various technology topics.",
  keywords:
    "TechTipsHub, tech feed, latest articles, tutorials, technology, programming, web development, software, gadgets",
  alternates: { canonical: "/" },
  openGraph: {
    url: "/",
    title: "Feed",
    description:
      "Discover the latest tech tips, tutorials, and trends on the TechTipsHub feed. Stay informed with expert insights and curated content.",
  },
};

/** Articles in the first prerendered page; the rest load a page at a time. */
const INITIAL_NUMBERS_OF_BLOGS = "5";

export default async function Home() {
  const data = await getBlogs({
    limit: INITIAL_NUMBERS_OF_BLOGS,
  });
  const blogs = (data?.data as IBlog[]) || [];

  if (blogs.length === 0) {
    return (
      <div className="rounded-xl border border-default/60 px-6 py-16 text-center">
        <h2 className="text-lg font-semibold">No blogs published yet</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm text-default-600">
          New articles will appear here as soon as they are published.
        </p>
      </div>
    );
  }

  return <FeedBlogs initialBlogs={blogs} />;
}
