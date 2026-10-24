import type { MetadataRoute } from "next";
import { articlePreviewPath } from "@/lib/article-access";
import { absoluteUrl } from "@/lib/seo";
import { allBlogsForBuild } from "@/lib/blog-index";
import { categorySlug } from "@/lib/feed-routes";
import { siteCategories } from "@/lib/site-settings";

/**
 * The public pages that exist without asking the API.
 *
 * Articles and member profiles are data, so they live in `sitemap.ts` next to
 * the code that fetches them. Auth screens, `/me`, `/settings` and the admin
 * shell are deliberately absent: they are disallowed in `robots.ts` and have
 * nothing worth indexing.
 */
const staticPages: Array<{
  path: string;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
}> = [
  { path: "/", priority: 1, changeFrequency: "daily" },
  { path: "/features", priority: 0.8, changeFrequency: "weekly" },
  { path: "/about", priority: 0.6, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.6, changeFrequency: "monthly" },
  { path: "/community-guidelines", priority: 0.4, changeFrequency: "yearly" },
  { path: "/privacy", priority: 0.3, changeFrequency: "yearly" },
  { path: "/terms", priority: 0.3, changeFrequency: "yearly" },
  { path: "/cookie", priority: 0.3, changeFrequency: "yearly" },
  { path: "/disclaimer", priority: 0.3, changeFrequency: "yearly" },
  { path: "/refund-policy", priority: 0.3, changeFrequency: "yearly" },
];

/** The category pages, one per published category, if the API answers. */
const categoryEntries = async (): Promise<
  MetadataRoute.Sitemap
> => {
  try {
    const categories = await siteCategories();
    return categories
      .filter((category) => !category.isDeleted)
      .map((category) => ({ path: categorySlug(category.name) }))
      .filter((entry) => entry.path && entry.path !== "/")
      .map(({ path }) => ({
        url: absoluteUrl(`/categories/${path}`),
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.6,
      }));
  } catch {
    return [];
  }
};

/**
 * /sitemap.xml
 *
 * Regenerated whenever an article changes: the blog services expire the
 * `allBlogs` and `sitemap` tags on create, edit and delete, so a newly
 * published post appears without waiting for a deploy. The hourly timer below
 * is the backstop.
 */
export const revalidate = 3600;

/**
 * Articles and member profiles, keyed to the build index.
 *
 * The same rows `generateStaticParams` uses, so the pages listed here are
 * exactly the pages that were prerendered.
 */
const articleEntries = async (): Promise<
  MetadataRoute.Sitemap> => {
  const { rows } = await allBlogsForBuild();

  return rows.map((row) => ({
    // The preview variant is the article's canonical address: it is the copy a
    // crawler can read without a session (see `lib/article-access`).
    url: absoluteUrl(articlePreviewPath(row.slug)),
    lastModified: new Date(row.updatedAt || row.createdAt || Date.now()),
    changeFrequency: "weekly",
    priority: 0.7,
  }));
};

/** One profile per publishing author, pointed at the public profile page. */
const profileEntries = async (): Promise<MetadataRoute.Sitemap> => {
  const { rows } = await allBlogsForBuild();
  const seen = new Set<string>();
  const entries: MetadataRoute.Sitemap = [];

  for (const row of rows) {
    const username = row.author?.username;
    if (!username || seen.has(username)) continue;
    seen.add(username);

    entries.push({
      url: absoluteUrl(`/users/${encodeURIComponent(username)}`),
      lastModified: new Date(row.updatedAt || row.createdAt || Date.now()),
      changeFrequency: "weekly",
      priority: 0.5,
    });
  }

  return entries;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = staticPages.map(
    ({ path, priority, changeFrequency }) => ({
      url: absoluteUrl(path),
      lastModified: now,
      changeFrequency,
      priority,
    }),
  );

  return [
    ...staticEntries,
    ...(await categoryEntries()),
    ...(await articleEntries()),
    ...(await profileEntries()),
  ];
}
