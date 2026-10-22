import AdSlot from "@/components/adsense/ad-slot";
import AdBanner from "@/components/adsense/ad-banner";
import PageHero from "@/components/editorial/page-hero";
import ButtonLink from "@/components/ui/button-link";
import Container from "@/components/ui/container";
import { getAllCategories } from "@/services/category";
import { getAllPosts } from "@/services/post";
import type { ICategory } from "@/types";
import { Metadata } from "next";
import Link from "next/link";
import { BiChevronRight } from "react-icons/bi";
import { FiArrowUpRight } from "react-icons/fi";

export const metadata: Metadata = {
  title: "Write and publish",
  description:
    "Share your tech knowledge on TechTips Hub: publish tutorials, reach readers who build software, and keep a public portfolio of your work.",
  keywords:
    "TechTips Hub, tech community, tech writing, knowledge sharing, tech tutorials, learning platform",
  alternates: { canonical: "/features" },
  openGraph: {
    title: "Write and publish on TechTips Hub",
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
  const [postsResult, categoriesResult] = await Promise.all([
    getAllPosts({ limit: "1" }).catch(() => null),
    getAllCategories().catch(() => null),
  ]);

  const articleCount = Number(postsResult?.meta?.total) || 0;
  const categories = (categoriesResult?.data as ICategory[]) || [];

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-default/60">
        <Container>
          <div className="grid items-end gap-10 py-14 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-16 lg:py-24">
            <PageHero
              eyebrow="Write for TechTips Hub"
              title={
                <>
                  Share your tech knowledge with people who{" "}
                  <span className="text-primary">build</span>
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
                  <dt className="mt-0.5 text-xs uppercase tracking-wider text-default-500">
                    Articles published
                  </dt>
                </div>
              )}
              {categories.length > 0 && (
                <div>
                  <dd className="text-2xl font-semibold tabular-nums tracking-tight">
                    {categories.length.toLocaleString()}
                  </dd>
                  <dt className="mt-0.5 text-xs uppercase tracking-wider text-default-500">
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
              className="text-xs font-semibold uppercase leading-6 tracking-[0.14em] text-default-500"
            >
              What you get
            </h2>
            <p className="mt-3 max-w-[16rem] text-sm leading-relaxed text-default-500">
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
            className="text-xs font-semibold uppercase leading-6 tracking-[0.14em] text-default-500 lg:pt-2"
          >
            How it works
          </h2>

          <ol className="border-t border-default/60">
            {steps.map((step, index) => (
              <li
                key={step.title}
                className="grid gap-x-8 gap-y-1 border-b border-default/60 py-6 sm:grid-cols-[3rem_minmax(0,1fr)]"
              >
                <span className="text-xs font-semibold tabular-nums tracking-wider text-primary sm:pt-1">
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
                className="text-xs font-semibold uppercase leading-6 tracking-[0.14em] text-default-500"
              >
                What we publish
              </h2>
              <p className="mt-3 max-w-[16rem] text-sm leading-relaxed text-default-500">
                Write in any of these, or pitch a new one.
              </p>
            </div>
            <ul className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <li key={category._id}>
                  <Link
                    href={`/?category=${encodeURIComponent(category.name)}`}
                    className="inline-flex items-center gap-1.5 rounded-full border border-default/60 px-3.5 py-1.5 text-sm text-default-700 transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                  >
                    {category.name}
                    <FiArrowUpRight aria-hidden className="size-3.5 opacity-50" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Closing note */}
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
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                community guidelines
              </Link>{" "}
              first if you want to know what we look for.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <ButtonLink href="/signup" radius="lg" color="primary">
                Create a free account
              </ButtonLink>
              <ButtonLink href="/about-us" radius="lg" variant="bordered">
                About the publication
              </ButtonLink>
            </div>
          </div>
        </section>

        {/* Existing ad unit — position preserved. */}
        <div className="pb-10">
          <AdSlot>
            <AdBanner />
          </AdSlot>
        </div>
      </Container>
    </div>
  );
};

export default CommunityPage;
