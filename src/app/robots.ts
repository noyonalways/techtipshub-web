import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";

/**
 * /robots.txt, generated with the build.
 *
 * Accounts, the composer, the admin shell and the API answer only to a signed-in
 * (or admin) session, so they are disallowed: a crawler has nothing to index
 * there and every crawl of one is a wasted request. Everything else is open.
 */
const disallowed = [
  "/admin",
  "/admin/",
  "/api/",
  "/me",
  "/me/",
  "/settings",
  "/settings/",
  "/login",
  "/signup",
  "/forget-password",
  "/reset-password",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: disallowed },
      // Ad crawlers only need the page, the SDK script and the text files.
      {
        userAgent: "Mediapartners-Google",
        allow: "/",
        disallow: ["/admin", "/api/", "/me/", "/settings/"],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl("/"),
  };
}
