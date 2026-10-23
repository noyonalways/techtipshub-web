import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Article not found",
  robots: { index: false, follow: false },
};

/**
 * `/me/blogs/<slug>` is not a page.
 *
 * The article list is at `/me/blogs` and an article's editor at
 * `/me/blogs/<slug>/edit`, so a bare slug is most likely a mistyped edit link.
 * Saying so beats rendering an empty shell.
 */
const BareBlogAddress = () => notFound();

export default BareBlogAddress;
