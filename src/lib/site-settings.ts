import { cache } from "react";
import { siteConfig } from "@/config/site";
import { getCategories } from "@/services/category";
import type { ICategory } from "@/types";

/**
 * Data that is the same for every visitor, so a page can be prerendered.
 *
 * Nothing here reads a cookie or the request: that is the whole point. Both
 * readers cache per request with React's `cache` (the header and the footer
 * both ask for the categories, and the API should be called once), and the
 * fetch underneath carries a tag so a category edit can invalidate it.
 */

/** The public category list, or an empty list when the API cannot answer. */
export const siteCategories = cache(async (): Promise<ICategory[]> => {
  try {
    const answer = await getCategories();
    return Array.isArray(answer?.data) ? (answer.data as ICategory[]) : [];
  } catch {
    return [];
  }
});

/**
 * What the site itself is, independent of who is reading: name, contact
 * address, the policy pages. Safe to prerender into every page.
 */
export const siteSettings = cache(async () => ({
  name: siteConfig.name,
  shortName: siteConfig.shortName,
  tagline: siteConfig.tagline,
  description: siteConfig.description,
  url: siteConfig.url,
}));
