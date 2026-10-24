import BlogCard from "@/components/blog-card";
import FollowingFeedBlogs from "@/components/modules/following-feed";
import { getFollowingUsersBlogs } from "@/services/blog";
import { IBlog } from "@/types";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Following Feed",
  description:
    "Stay updated with the latest tech tips, tutorials, and articles. Explore our feed to discover trending posts and expert insights across various technology topics.",
  keywords:
    "TechTipsHub, tech feed, latest articles, tutorials, technology, programming, web development, software, gadgets",
  // Personal to the signed-in reader; there is nothing stable to index.
  robots: { index: false, follow: true },
  openGraph: {
    url: "/following",
    title: "Feed",
    description:
      "Discover the latest tech tips, tutorials, and trends on the TechTipsHub feed. Stay informed with expert insights and curated content.",
  },
};

interface IProps {
  searchParams: Promise<{
    search: string;
    category: string;
  }>;
}

export default async function FollowingUsersBlogs({ searchParams }: IProps) {
  const { search, category } = await searchParams;

  const params = {
    searchTerm: search,
    category: category,
  };

  const data = await getFollowingUsersBlogs(params);
  const blogs = data?.data as IBlog[];

  return <FollowingFeedBlogs initialBlogs={blogs} />;
}
