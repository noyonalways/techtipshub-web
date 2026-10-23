import ManageBlogs from "@/components/modules/settings/manage-blogs";
import Container from "@/components/ui/container";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "My articles",
  description: "Everything you have published on TechTipsHub, ready to edit or remove.",
  robots: { index: false, follow: false },
};

interface IProps {
  searchParams: Promise<{
    search?: string;
    category?: string;
    sort?: string;
  }>;
}

/**
 * The account's article list. It reads like a page rather than an article, so
 * it uses the site's page container instead of the narrow reading measure.
 */
const MyArticlesPage = ({ searchParams }: IProps) => (
  <section className="pb-24">
    <Container className="pt-10">
      <ManageBlogs searchParams={searchParams} />
    </Container>
  </section>
);

export default MyArticlesPage;
