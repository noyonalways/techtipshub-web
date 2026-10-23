import { AdSlot } from "@/components/adsense";
import PageHero from "@/components/editorial/page-hero";
import ButtonLink from "@/components/ui/button-link";
import Container from "@/components/ui/container";
import { getAllCategories } from "@/services/category";
import { getAllBlogs } from "@/services/blog";
import type { ICategory } from "@/types";
import { Metadata } from "next";
import Link from "next/link";
import { BiChevronRight } from "react-icons/bi";
import { FiArrowUpRight } from "react-icons/fi";

export const metadata: Metadata = {
  title: "Write and publish",
  description:
    "Share your tech knowledge on TechTipsHub: publish tutorials, reach readers who build software, and keep a public portfolio of your work.",
  keywords:
    "TechTipsHub, tech community, tech writing, knowledge sharing, tech tutorials, learning platform",
  alternates: { canonical: "/features" },
  openGraph: {
    title: "Write and publish on TechTipsHub",
    description:
      "Share your tech knowledge, learn from experts, and become part of our growing community.",
    url: "/features",
  },
};

/** The writing tools, described as what they do rather than feature names. */
const composer = [
  "Markdown-style shortcuts: type # for a heading, > for a quote, - for a list.",
  "Syntax-highlighted code blocks for every language you write about.",
  "Cover images, categories and tags, chosen when you publish.",
  "Preview the rendered article before it goes live.",
];

const community = [
  "Threaded comments on every article, and authors can reply.",
  "Follow the people whose work you want to read.",
  "Honest view and vote counts, straight from the database.",
  "A public profile with your bio, links and everything you have written.",
];

const steps = [
  {
    title: "Create a free account",
    body: "One form, no payment details. Every account has the same abilities — there is no paid tier.",
  },
  {
    title: "Draft in the composer",
    body: "Write with shortcuts, drop in code blocks and a cover image, then preview the piece as readers will see it.",
  },
  {
    title: "Publish, then keep it current",
    body: "Edit or remove any article from Manage Blogs at any time. No email required, no approval queue.",
  },
];

const CommunityPage = async () => {
  const [blogsResult, categoriesResult] = await Promise.all([
    getAllBlogs({ limit: "1" }).catch(() => null),
    getAllCategories().catch(() => null),
  ]);

  const articleCount = Number(blogsResult?.meta?.total) || 0;
  const categories = (categoriesResult?.data as ICategory[]) || [];

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-default/60">
        <Container>
          <div className="grid items-end gap-10 py-14 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-16 lg:py-24">
            <PageHero
              eyebrow="Write for TechTipsHub"
              title={
                <>
                  Share your tech knowledge with people who{" "}
                  <span className="text-primary-accessible">build</span>
                </>
              }
              lede="Publish tutorials and explainers, reach readers who actually try the code, and keep a public portfolio of everything you have written."
              meta={
                <div className="flex flex-wrap items-center gap-3">
                  <ButtonLink
                    href="/signup"
                    radius="lg"
                    color="primary"
                    endContent={<BiChevronRight />}
                    className="font-semibold"
                  >
                    Start writing today
                  </ButtonLink>
                  <ButtonLink href="/" radius="lg" variant="bordered">
                    Explore articles
                  </ButtonLink>
                </div>
              }
            />

            {/* Real counts, set as a footnote rather than a billboard. */}
            <dl className="flex gap-10 border-t border-default/60 pt-5 lg:flex-col lg:gap-5 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8">
              {articleCount > 0 && (
                <div>
                  <dd className="text-2xl font-semibold tabular-nums tracking-tight">
                    {articleCount.toLocaleString()}
                  </dd>
                  <dt className="mt-0.5 tth-label-sm text-default-600">
                    Articles published
                  </dt>
                </div>
              )}
              {categories.length > 0 && (
                <div>
                  <dd className="text-2xl font-semibold tabular-nums tracking-tight">
                    {categories.length.toLocaleString()}
                  </dd>
                  <dt className="mt-0.5 tth-label-sm text-default-600">
                    Topics to write in
                  </dt>
                </div>
              )}
            </dl>
          </div>
        </Container>
      </section>

      <Container>
        {/* The editor / the community: two columns of concrete capability. */}
        <section
          aria-labelledby="what-you-get"
          className="grid gap-10 border-b border-default/60 py-16 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-16 lg:py-20"
        >
          <div className="lg:pt-2">
            <h2
              id="what-you-get"
              className="tth-label leading-6"
            >
              What you get
            </h2>
            <p className="mt-3 max-w-[16rem] text-sm leading-relaxed text-default-600">
              Free, with no sign-up funnel or gatekeeping. The platform stays out
              of the way of the writing.
            </p>
          </div>

          <div className="grid gap-10 md:grid-cols-2 md:gap-12">
            <div>
              <h3 className="border-b border-default/60 pb-3 font-semibold tracking-tight">
                A composer that keeps up
              </h3>
              <ul className="mt-4 space-y-3">
                {composer.map((item) => (
                  <li
                    key={item}
                    className="flex gap-3 text-sm leading-relaxed text-default-600"
                  >
                    <span
                      aria-hidden
                      className="mt-2 size-1 shrink-0 rounded-full bg-primary"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="border-b border-default/60 pb-3 font-semibold tracking-tight">
                Readers who take part
              </h3>
              <ul className="mt-4 space-y-3">
                {community.map((item) => (
                  <li
                    key={item}
                    className="flex gap-3 text-sm leading-relaxed text-default-600"
                  >
                    <span
                      aria-hidden
                      className="mt-2 size-1 shrink-0 rounded-full bg-primary"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section
          aria-labelledby="how-it-works"
          className="grid gap-10 border-b border-default/60 py-16 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-16 lg:py-20"
        >
          <h2
            id="how-it-works"
            className="tth-label leading-6 lg:pt-2"
          >
            How it works
          </h2>

          <ol className="border-t border-default/60">
            {steps.map((step, index) => (
              <li
                key={step.title}
                className="grid gap-x-8 gap-y-1 border-b border-default/60 py-6 sm:grid-cols-[3rem_minmax(0,1fr)]"
              >
                <span className="text-xs font-semibold tabular-nums tracking-wider text-primary-accessible sm:pt-1">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="font-semibold tracking-tight">{step.title}</h3>
                  <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-default-600">
                    {step.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Topics */}
        {categories.length > 0 && (
          <section
            aria-labelledby="topics"
            className="grid gap-10 border-b border-default/60 py-16 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-16"
          >
            <div className="lg:pt-2">
              <h2
                id="topics"
                className="tth-label leading-6"
              >
                What we publish
              </h2>
              <p className="mt-3 max-w-[16rem] text-sm leading-relaxed text-default-600">
                Write in any of these, or pitch a new one.
              </p>
            </div>
            <ul className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <li key={category._id}>
                  <Link
                    href={`/?category=${encodeURIComponent(category.name)}`}
                    className="inline-flex items-center gap-1.5 rounded-full border border-default/60 px-3.5 py-1.5 text-sm text-default-700 transition-colors hover:border-primary-600/50 hover:bg-primary/5 hover:text-primary-accessible"
                  >
                    {category.name}
                    <FiArrowUpRight aria-hidden className="size-3.5 opacity-50" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Closing note: the primary conversion target, so the ad sits above it
            rather than pushing it down the page. */}
        <div className="pb-4">
          <AdSlot variant="display" placement="features-topics-end" />
        </div>

        <section className="py-16 lg:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-pretty text-2xl font-semibold tracking-tight md:text-3xl">
              Ready to share what you know?
            </h2>
            <p className="mx-auto mt-3 max-w-xl leading-relaxed text-default-600">
              Your first article is the hard one. After that it is just writing.
              Read the{" "}
              <Link
                href="/community-guidelines"
                className="font-medium text-primary-accessible underline-offset-4 hover:underline"
              >
                community guidelines
              </Link>{" "}
              first if you want to know what we look for.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <ButtonLink href="/signup" radius="lg" color="primary">
                Create a free account
              </ButtonLink>
              <ButtonLink href="/about" radius="lg" variant="bordered">
                About the publication
              </ButtonLink>
            </div>
          </div>
        </section>
      </Container>
    </div>
  );
};

export default CommunityPage;
