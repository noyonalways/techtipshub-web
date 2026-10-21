"use client";

import AdBanner from "@/components/adsense/ad-banner";
import BlogCard from "@/components/blog-card";
import { getFollowingUsersPosts } from "@/services/post";
import { IPost } from "@/types";
import { useSearchParams } from "next/navigation";
import { Fragment, useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";

interface IProps {
  initialPosts: IPost[];
}

const FollowingFeedPosts = ({ initialPosts }: IProps) => {
  const searchParams = useSearchParams();

  const [page, setPage] = useState(2);
  const [posts, setPosts] = useState<IPost[]>(initialPosts);
  const [hasMore, setHasMore] = useState(true);
  const { ref, inView } = useInView();

  // Function to load more posts
  const loadMorePosts = async () => {
    if (!hasMore) return;

    const params: { page: string; limit: string; [key: string]: string } = {
      page: page.toString(),
      limit: "5",
    };

    // Add searchTerm and category only if they are truthy
    const searchTerm = searchParams.get("search");
    const category = searchParams.get("category");
    if (searchTerm) params.searchTerm = searchTerm;
    if (category) params.category = category;

    const data = await getFollowingUsersPosts(params);
    const newPosts = data?.data || [];

    if(data.success && newPosts.length > 0) {
      setPosts((prevPosts) => [...prevPosts, ...newPosts]);
      setPage((prevPage) => prevPage + 1);
    }

    // Stop further fetching if fewer posts than the limit are returned
    if (newPosts.length < 5) {
      setHasMore(false);
    }
  };

  // Watch for changes in searchParams to reset posts and refetch
  useEffect(() => {
    setPosts(initialPosts);
    setPage(2);
    setHasMore(true);
  }, [searchParams]);

  useEffect(() => {
    if (inView && hasMore) {
      loadMorePosts();
    }
  }, [inView, hasMore]);

  return (
    <div className="space-y-6 flex-1 w-full">
      {posts?.map((post, index) => (
        <Fragment key={post?._id}>
          <BlogCard {...post} />
          {(index + 1) % 4 === 0 && <AdBanner />}
        </Fragment>
      ))}
      <div className="text-center" ref={ref}>
        {hasMore ? "Loading..." : "No more posts available."}
      </div>
    </div>
  );
};

export default FollowingFeedPosts;
