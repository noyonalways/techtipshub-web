import FeedBlogs from "@/components/modules/feed";
import { getBlogs } from "@/services/blog";import { IBlog } from "@/types";
import type { Metadata } from "next";

/**
 * `/search?q=<term>`: the feed filtered to a search term.
 *
 * A real URL rather than `/?search=`, so the landing page can stay prerendered.
 * The `q` parameter is read against the search term only: the results refresh
 * on their own timer, while the shell (heading, rails) is generated once.
 */
export const revalidate = 600;

type Props = {
  searchParams: Promise<{ q?: string | string[] }>;
};

const INITIAL_NUMBERS_OF_BLOGS = "5";

const termFrom = (raw?: string | string[]) =>
  (Array.isArray(raw) ? raw[0] : raw)?.trim() ?? "";

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const term = termFrom((await searchParams).q);

  if (!term) {
    // Nothing to search for: the same content as the feed, so point search
    // engines at the feed instead of indexing an empty twin.
    return {
      title: "Search",
      robots: { index: false, follow: true },
      alternates: { canonical: "/" },
    };
  }

  return {
    title: `Search: ${term}`,
    description: `Articles on TechTipsHub matching "${term}".`,
    // A result page for an arbitrary string is not a landing page.
    robots: { index: false, follow: true },
    alternates: { canonical: "/search" },
  };
}

export default async function SearchFeed({ searchParams }: Props) {
  const term = termFrom((await searchParams).q);

  const data = await getBlogs({
    searchTerm: term || undefined,
    limit: INITIAL_NUMBERS_OF_BLOGS,
  });
  const blogs = (data?.data as IBlog[]) || [];

  if (blogs.length === 0) {
    return (
      <div className="rounded-xl border border-default/60 px-6 py-16 text-center">
        <h2 className="text-lg font-semibold">
          {term ? "No blogs match your search" : "Nothing to search for yet"}
        </h2>
        <p className="mx-auto mt-2 max-w-sm text-sm text-default-600">
          Try a different search term or browse the categories.
        </p>
      </div>
    );
  }

  return <FeedBlogs initialBlogs={blogs} searchTerm={term} />;
}
