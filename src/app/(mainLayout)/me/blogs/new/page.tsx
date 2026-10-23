import WriteBlog from "@/components/modules/write-blog";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Write a post",
  description: "Write and publish a new article on TechTipsHub.",
};

/**
 * The composer owns the whole page width.
 *
 * A writing page should not be framed by the site's content container: the
 * column inside the composer sets the reading width, and the sticky bar can
 * then span the page. `EditorShell` supplies the only frame, so the gutters are
 * not applied twice here.
 */
const NewBlogPage = () => (
  <section className="pt-4">
    <WriteBlog />
  </section>
);

export default NewBlogPage;
