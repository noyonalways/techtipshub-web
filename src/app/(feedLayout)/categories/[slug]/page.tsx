import FeedBlogs from "@/components/modules/feed";
import { getBlogs } from "@/services/blog";
import { categorySlug } from "@/lib/feed-routes";
import { siteCategories } from "@/lib/site-settings";
import { IBlog } from "@/types";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

/**
 * `/categories/<name>`: the feed filtered to one category.
 *
 * The category's own URL, so the landing page stays prerendered and each
 * category can be crawled and ranked on its own. Known categories are
 * prerendered from the list the feed already fetches; anything else renders on
 * first request and 404s if no category matches.
 */
export const revalidate = 1800;

type Props = {
  params: Promise<{ slug: string }>;
};

const INITIAL_NUMBERS_OF_BLOGS = "5";

/** The published category whose slug is `slug`, or undefined. */
const findCategory = async (slug: string) => {
  const categories = await siteCategories();
  return categories.find(
    (category) => categorySlug(category.name) === slug && !category.isDeleted,
  );
};

export async function generateStaticParams() {
  const categories = await siteCategories();
  return categories
    .filter((category) => !category.isDeleted)
    .map((category) => ({ slug: categorySlug(category.name) }))
    .filter((entry) => entry.slug);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await findCategory(slug);

  if (!category) {
    return {
      title: "Category not found",
      robots: { index: false, follow: false },
    };
  }

  const description =
    category.description ||
    `Articles filed under ${category.name} on TechTipsHub.`;

  return {
    title: category.name,
    description,
    alternates: { canonical: `/categories/${slug}` },
    openGraph: {
      title: `${category.name} articles`,
      description,
      url: `/categories/${slug}`,
      type: "website",
    },
  };
}

export default async function CategoryFeed({ params }: Props) {
  const { slug } = await params;
  const category = await findCategory(slug);

  if (!category) notFound();

  const data = await getBlogs({
    category: category.name,
    limit: INITIAL_NUMBERS_OF_BLOGS,
  });
  const blogs = (data?.data as IBlog[]) || [];

  if (blogs.length === 0) {
    return (
      <div className="rounded-xl border border-default/60 px-6 py-16 text-center">
        <h2 className="text-lg font-semibold">
          Nothing in {category.name} yet
        </h2>
        <p className="mx-auto mt-2 max-w-sm text-sm text-default-600">
          New articles will appear here as soon as they are published.
        </p>
      </div>
    );
  }

  return <FeedBlogs initialBlogs={blogs} category={category.name} />;
}
