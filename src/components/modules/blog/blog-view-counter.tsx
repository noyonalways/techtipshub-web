import { recordBlogView } from "@/services/blog";
import { HiOutlineEye } from "react-icons/hi2";

interface IProps {
  slug: string;
  /** Count from the initial render, shown if recording the read fails. */
  fallback: number;
}

/**
 * Records this page's read on the server and shows the resulting total.
 *
 * Runs per request, so the number is always the API's current value rather
 * than a number baked into a cached page. The API decides uniqueness: signed-in
 * readers are counted once per account, guests once per browser (the API
 * derives a pseudonymous key from the forwarded IP and user agent).
 *
 * The read is a side effect of *rendering*, not an action, so it cannot come
 * from a client fetch without adding a flash of a stale number.
 */
const BlogViewCounter = async ({ slug, fallback }: IProps) => {
  const result = await recordBlogView(slug);
  const totalViews = result?.data?.totalViews ?? fallback ?? 0;

  return (
    <span className="flex items-center gap-1.5 text-xs text-default-600">
      <HiOutlineEye aria-hidden className="text-base" />
      <span className="tabular-nums">{totalViews.toLocaleString()}</span>
      {totalViews === 1 ? "view" : "views"}
    </span>
  );
};

export default BlogViewCounter;
