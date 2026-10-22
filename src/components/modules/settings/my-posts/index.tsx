"use client";

import ManageBlogCard from "@/components/manage-blog-card";
import { getLoggedInUserPosts } from "@/services/post";
import { IPost } from "@/types";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";

interface IProps {
  initialPosts: IPost[];
}

const MyPosts = ({ initialPosts }: IProps) => {
  const searchParams = useSearchParams();

  const [page, setPage] = useState(2);
  const [blogs, setBlogs] = useState<IPost[]>(initialPosts);
  const [hasMore, setHasMore] = useState(true);
  const { ref, inView } = useInView();

  // Function to load more posts
  const loadMorePosts = async () => {
    if (!hasMore) return;

    // The first page is server-rendered; this only runs after a scroll. A
    // failed request must not take the whole page down with it.
    if (!Array.isArray(initialPosts)) {
      setHasMore(false);
      return;
    }

    const params: { page: string; limit: string; [key: string]: string } = {
      page: page.toString(),
      limit: "5",
    };

    // Add searchTerm and category only if they are truthy
    const searchTerm = searchParams.get("search");
    const category = searchParams.get("category");
    if (searchTerm) params.searchTerm = searchTerm;
    if (category) params.category = category;

    const data = await getLoggedInUserPosts(params);
    const newBlogs = Array.isArray(data?.data) ? (data.data as IPost[]) : [];

    setBlogs((prevBlogs) => [...prevBlogs, ...newBlogs]);
    setPage((prevPage) => prevPage + 1);

    // Stop further fetching if fewer posts than the limit are returned
    if (newBlogs.length < 5) {
      setHasMore(false);
    }
  };

  // Watch for changes in searchParams to reset posts and refetch
  useEffect(() => {
    setBlogs(initialPosts);
    setPage(2);
    setHasMore(true);
  }, [searchParams]);

  useEffect(() => {
    if (inView && hasMore) {
      loadMorePosts();
    }
  }, [inView, hasMore]);

  return (
    <>
      <div className="space-y-4">
        {blogs &&
          blogs?.map((blog) => <ManageBlogCard key={blog._id} post={blog} />)
        }
        <div className="text-center" ref={ref}>
          {hasMore ? "Loading..." : "No more posts available."}
        </div>
      </div>
    </>
  );
};

export default MyPosts;
