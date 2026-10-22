import WriteBlog from "@/components/modules/write-blog";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Write Blog | TechTips Hub",
  description: "Write a blog post on TechTips Hub",
  keywords: "write blog, tech tips, TechTips Hub, blog, write, post",
  openGraph: {
    title: "Write Blog | TechTips Hub",
    description: "Write a blog post on TechTips Hub",
    url: "https://techtipshub.vercel.app/write-blog",
  },
  twitter: {
    card: "summary_large_image",
    title: "Write Blog | TechTips Hub",
    description: "Write a blog post on TechTips Hub",
    images: "https://techtipshub.vercel.app/og-image.png",
  },
};

/**
 * The composer owns the whole page width.
 *
 * A writing page should not be framed by the site's content container: the
 * column inside the composer sets the reading width, and the sticky bar can
 * then span the viewport.
 */
const WriteBlogPage = () => (
  <section className="px-4 pb-24 pt-4 sm:px-6">
    <WriteBlog />
  </section>
);

export default WriteBlogPage;
