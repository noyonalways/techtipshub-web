import AdSlot from "@/components/adsense/ad-slot";
import AdBanner from "@/components/adsense/ad-banner";
import FactList, { Fact, FactLink } from "@/components/editorial/fact-list";
import PageHero from "@/components/editorial/page-hero";
import ButtonLink from "@/components/ui/button-link";
import Container from "@/components/ui/container";
import { legalConfig } from "@/config/legal";
import { getAllCategories } from "@/services/category";
import { getAllPosts } from "@/services/post";
import type { ICategory } from "@/types";
import type { Metadata } from "next";
import Link from "next/link";
import { BiChevronRight } from "react-icons/bi";
import { FiArrowUpRight } from "react-icons/fi";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "TechTips Hub publishes practical writing on web development, AI and the tools modern developers use. Learn what we cover and why.",
  openGraph: {
    title: "About Us",
    description:
      "Practical writing on web development, AI and the tools modern developers use.",
    url: "https://techtipshub.vercel.app/about-us",
  },
};

/** The standards every article is held to. Written as rules, not features. */
const standards = [
  {
    number: "01",
    title: "Written by practitioners",
    body: "Every article is written by someone who builds with the technology they are explaining. We do not publish pieces about tools we have never used.",
  },
  {
    number: "02",
    title: "Practical over promotional",
    body: "Worked examples and honest trade-offs, not listicles written to fill a slot. If something breaks, the article says where.",
  },
  {
    number: "03",
    title: "Reader signals are real",
    body: "Votes, comments and view counts come straight from the database. We never inflate them, and there is nothing to buy.",
  },
  {
    number: "04",
    title: "Open discussion",
    body: "Threaded comments let readers challenge a claim. Authors can reply, and corrections are noted on the article itself.",
  },
];

const AboutUs = async () => {
  const [postsResult, categoriesResult] = await Promise.all([
    getAllPosts({ limit: "1" }).catch(() => null),
    getAllCategories().catch(() => null),
  ]);

  const articleCount = Number(postsResult?.meta?.total) || 0;
  const categories = (categoriesResult?.data as ICategory[]) || [];
  const topicCount = categories.length;

  return (
    <div>
      <section className="border-b border-default/60">
        <Container>
          <div className="max-w-6xl py-14 lg:py-24">
            <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-20">
              <div>
                <PageHero
                  eyebrow="About TechTips Hub"
                  title={
                    <>
                      Practical writing for people who{" "}
                      <span className="text-primary">build software</span>
                    </>
                  }
                  lede="TechTips Hub is an independent publication about web development, AI and the tools modern developers reach for every day. We favour clear explanations and working examples over hype."
                  meta={
                    <div className="flex flex-wrap items-center gap-3">
                      <ButtonLink
                        href="/signup"
                        radius="lg"
                        color="primary"
                        endContent={<BiChevronRight />}
                        className="font-semibold"
                      >
                        Join the community
                      </ButtonLink>
                      <ButtonLink
                        href="/contact-us"
                        radius="lg"
                        variant="bordered"
                      >
                        Get in touch
                      </ButtonLink>
                    </div>
                  }
                />
              </div>

              {/* The masthead facts, as a quiet table rather than giant numerals. */}
              <aside className="lg:pt-2">
                <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-default-500">
                  The publication
                </h2>
                <FactList label="Publication details" className="mt-4">
                  {articleCount > 0 && (
                    <Fact term="Articles published">
                      {articleCount.toLocaleString()}
                    </Fact>
                  )}
                  {topicCount > 0 && (
                    <Fact term="Topics covered">
                      {topicCount.toLocaleString()}
                    </Fact>
                  )}
                  <Fact term="Access">Free, no tiers</Fact>
                  <FactLink term="Contact" href={`mailto:${legalConfig.contactEmail}`}>
                    {legalConfig.contactEmail}
                  </FactLink>
                </FactList>
              </aside>
            </div>
          </div>
        </Container>
      </section>

      <Container>
        {/* Mission, in article form: a lead paragraph and a pull quote. */}
        <section
          aria-labelledby="mission"
          className="grid gap-10 border-b border-default/60 py-16 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-16 lg:py-20"
        >
          <h2
            id="mission"
            className="text-xs font-semibold uppercase leading-6 tracking-[0.14em] text-default-500 lg:pt-2"
          >
            Our mission
          </h2>
          <div className="max-w-3xl">
            <p className="text-pretty text-xl leading-relaxed tracking-tight md:text-2xl md:leading-relaxed">
              Make hard technical subjects approachable without dumbing them
              down. A reader should finish an article able to try the idea
              themselves, and understand where it breaks.
            </p>
            <blockquote className="mt-8 border-l-2 border-primary pl-5 text-pretty text-base leading-relaxed text-default-600">
              Tutorials, explanations of how things actually work, and honest
              comparisons of tools. If we have not used something in practice,
              we do not claim to have reviewed it.
            </blockquote>
          </div>
        </section>

        {/* Standards */}
        <section
          aria-labelledby="standards"
          className="grid gap-10 border-b border-default/60 py-16 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-16 lg:py-20"
        >
          <div className="lg:pt-2">
            <h2
              id="standards"
              className="text-xs font-semibold uppercase leading-6 tracking-[0.14em] text-default-500"
            >
              How we work
            </h2>
            <p className="mt-3 max-w-[16rem] text-sm leading-relaxed text-default-500">
              The standards every article on TechTips Hub is held to.
            </p>
          </div>

          <ol className="divide-y divide-default/60 border-t border-default/60 md:grid md:grid-cols-2 md:gap-x-12 md:divide-y-0">
            {standards.map((standard) => (
              <li
                key={standard.number}
                className="border-b border-default/60 py-6"
              >
                <span className="text-xs font-semibold tabular-nums tracking-wider text-primary">
                  {standard.number}
                </span>
                <h3 className="mt-2 font-semibold tracking-tight">
                  {standard.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-default-600">
                  {standard.body}
                </p>
              </li>
            ))}
          </ol>
        </section>

        {/* Topics, as a directory rather than pills */}
        {categories.length > 0 && (
          <section
            aria-labelledby="topics"
            className="grid gap-10 border-b border-default/60 py-16 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-16"
          >
            <h2
              id="topics"
              className="text-xs font-semibold uppercase leading-6 tracking-[0.14em] text-default-500 lg:pt-2"
            >
              Topics we cover
            </h2>
            <ul className="grid gap-x-8 sm:grid-cols-2">
              {categories.map((category) => (
                <li key={category._id} className="border-b border-default/60">
                  <Link
                    href={`/?category=${encodeURIComponent(category.name)}`}
                    className="group flex items-baseline justify-between gap-4 py-3.5 transition-colors hover:text-primary"
                  >
                    <span className="text-sm font-medium">{category.name}</span>
                    <span className="flex items-baseline gap-2 text-xs tabular-nums text-default-400">
                      {category.postCount > 0 && category.postCount}
                      <FiArrowUpRight
                        aria-hidden
                        className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Close */}
        <section className="py-16 lg:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-pretty text-2xl font-semibold tracking-tight md:text-3xl">
              Written with the community
            </h2>
            <p className="mx-auto mt-3 max-w-xl leading-relaxed text-default-600">
              TechTips Hub is built by its readers as much as by its editors. If
              you know something worth sharing, you are welcome to publish it.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <ButtonLink href="/signup" radius="lg" color="primary">
                Sign up free
              </ButtonLink>
              <ButtonLink href="/contact-us" radius="lg" variant="bordered">
                Contact us
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

export default AboutUs;
