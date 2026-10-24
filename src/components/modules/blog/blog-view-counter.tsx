"use client";

import { useEffect, useState } from "react";
import { HiOutlineEye } from "react-icons/hi2";

interface IProps {
  slug: string;
  /** Count baked into the cached page, shown until the read is recorded. */
  fallback: number;
}

/**
 * Records this page's read and shows the resulting total.
 *
 * The read happens in the browser, not during the server render: a server
 * render that POSTs to the API reads cookies and bypasses the cache, which
 * makes the whole article route request-bound and leaves nothing to serve from
 * the CDN. Here the shell and the count stay cacheable, and the number is
 * updated once the API answers.
 *
 * The API decides uniqueness. Signed-in readers count once per account (the
 * bearer token is attached by `/api/views/[slug]`), guests once per browser via
 * a `visitorId` this component keeps in `localStorage`.
 *
 * A failed request keeps the baked-in count, so a blocked or offline reader
 * still sees a number instead of a blank.
 */
const VISITOR_KEY = "tth_visitor_id";

const visitorId = (): string | undefined => {
  try {
    const existing = window.localStorage.getItem(VISITOR_KEY);
    if (existing) return existing;

    const created = crypto.randomUUID();
    window.localStorage.setItem(VISITOR_KEY, created);
    return created;
  } catch {
    // Storage disabled: count the read without a stable key.
    return undefined;
  }
};

const BlogViewCounter = ({ slug, fallback }: IProps) => {
  const [totalViews, setTotalViews] = useState(fallback);

  useEffect(() => {
    let active = true;

    const record = async () => {
      try {
        const res = await fetch(`/api/views/${encodeURIComponent(slug)}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ visitorId: visitorId() }),
        });

        if (!res.ok) return;

        const body = await res.json();
        const fresh = body?.data?.totalViews;

        if (active && typeof fresh === "number") setTotalViews(fresh);
      } catch {
        // Counts are not worth an error state.
      }
    };

    record();

    return () => {
      active = false;
    };
  }, [slug]);

  return (
    <span className="flex items-center gap-1.5 text-xs text-default-600">
      <HiOutlineEye aria-hidden className="text-base" />
      <span className="tabular-nums">{totalViews.toLocaleString()}</span>
      {totalViews === 1 ? "view" : "views"}
    </span>
  );
};

export default BlogViewCounter;
