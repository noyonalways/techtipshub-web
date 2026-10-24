import { siteConfig } from "@/config/site";

/**
 * The site's own origin, resolved once.
 *
 * Deployments move (preview URLs, a custom domain later), so the origin comes
 * from `SITE_URL` when set and falls back to the name in `siteConfig`. A
 * sitemap entry that names the wrong host is worse than a missing one, so every
 * place that builds an absolute URL - sitemap, robots, canonicals - reads it
 * from here.
 */
const configured = process.env.SITE_URL?.trim();

export const siteOrigin = (configured || siteConfig.url).replace(/\/+$/, "");

export const absoluteUrl = (path = "/") =>
  `${siteOrigin}${path.startsWith("/") ? path : `/${path}`}`;

/**
 * Strips stored HTML down to readable text for descriptions and previews.
 * Collapses whitespace so line breaks and indentation in the markup do not
 * leak into a meta tag.
 */
export const toPlainText = (html?: string | null) =>
  (html ?? "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();

export const excerpt = (html?: string | null, max = 160) => {
  const text = toPlainText(html);
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trimEnd()}…`;
};
