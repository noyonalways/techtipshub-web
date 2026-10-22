import FeedPosts from "@/components/modules/feed";
import { getAllPosts } from "@/services/post";
import { IPost } from "@/types";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Feed",
  description:
    "Stay updated with the latest tech tips, tutorials, and articles. Explore our feed to discover trending posts and expert insights across various technology topics.",
  keywords:
    "TechTips Hub, tech feed, latest articles, tutorials, technology, programming, web development, software, gadgets",
  openGraph: {
    title: "Feed",
    description:
      "Discover the latest tech tips, tutorials, and trends on the TechTips Hub feed. Stay informed with expert insights and curated content.",
  },
};

interface IProps {
  searchParams: Promise<{
    search: string;
    category: string;
  }>;
}

const INITIAL_NUMBERS_OF_POSTS = "5";

export default async function Home({ searchParams }: IProps) {
  const { search, category } = await searchParams;

  const params = {
    searchTerm: search,
    category: category,
    limit: INITIAL_NUMBERS_OF_POSTS,
  };

  const data = await getAllPosts(params);
  const posts = (data?.data as IPost[]) || [];

  if (posts.length === 0) {
    const hasFilters = Boolean(search || category);

    return (
      <div className="rounded-xl border border-default/60 px-6 py-16 text-center">
        <h2 className="text-lg font-semibold">
          {hasFilters ? "No posts match your filters" : "No posts published yet"}
        </h2>
        <p className="mx-auto mt-2 max-w-sm text-sm text-default-500">
          {hasFilters
            ? "Try a different search term or category to see more articles."
            : "New articles will appear here as soon as they are published."}
        </p>
      </div>
    );
  }

  return <FeedPosts initialPosts={posts} />;
}
