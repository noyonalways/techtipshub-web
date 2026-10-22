import AdBanner from "@/components/adsense/ad-banner";
import Container from "@/components/ui/container";
import { getAllCategories } from "@/services/category";
import { getAllPosts } from "@/services/post";
import type { ICategory } from "@/types";
import { Button } from "@heroui/button";
import type { Metadata } from "next";
import Link from "next/link";
import {
  BiBookOpen,
  BiChevronRight,
  BiMailSend,
  BiMessageSquare,
  BiUserPlus,
} from "react-icons/bi";
import { BsEye } from "react-icons/bs";
import { FaThumbsUp } from "react-icons/fa";
import { FaUserShield } from "react-icons/fa6";
import { FiZap } from "react-icons/fi";

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

const principles = [
  {
    icon: <BiBookOpen className="size-5" />,
    title: "Written by practitioners",
    description:
      "Every article is written by someone who builds with the technology they are explaining.",
  },
  {
    icon: <FiZap className="size-5" />,
    title: "Practical over promotional",
    description:
      "We publish worked examples and real trade-offs, not listicles written to fill a slot.",
  },
  {
    icon: <FaThumbsUp className="size-5" />,
    title: "Reader signals are real",
    description:
      "Votes, comments and view counts come straight from the database. We never inflate them.",
  },
  {
    icon: <BiMessageSquare className="size-5" />,
    title: "Open discussion",
    description:
      "Threaded comments let readers challenge a claim, and authors can respond.",
  },
  {
    icon: <BsEye className="size-5" />,
    title: "Transparent content",
    description:
      "Sponsored material is labelled. Corrections are noted on the article itself.",
  },
  {
    icon: <FaUserShield className="size-5" />,
    title: "Clear attribution",
    description:
      "Every post is signed by its author, with a public profile you can follow.",
  },
];

const AboutUs = async () => {
  const [postsResult, categoriesResult] = await Promise.all([
    getAllPosts({ limit: "1" }),
    getAllCategories().catch(() => null),
  ]);

  const articleCount = Number(postsResult?.meta?.total) || 0;
  const categories = (categoriesResult?.data as ICategory[]) || [];
  const topicCount = categories.length;

  // Only real, database-backed numbers are shown. Anything unavailable is
  // omitted rather than replaced with an estimate.
  const stats = [
    articleCount > 0
      ? { label: "Articles published", value: articleCount.toLocaleString() }
      : null,
    topicCount > 0
      ? { label: "Topics covered", value: topicCount.toLocaleString() }
      : null,
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-default/60">
        <Container>
          <div className="mx-auto max-w-3xl py-16 text-center lg:py-24">
            <p className="text-sm font-medium uppercase tracking-wider text-primary">
              About TechTips Hub
            </p>
            <h1 className="mt-4 text-pretty text-4xl font-bold leading-tight tracking-tight md:text-5xl">
              Practical writing for people who build software
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-default-600">
              TechTips Hub is an independent publication about web development,
              AI and the tools modern developers reach for every day. We favour
              clear explanations and working examples over hype.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button
                as={Link}
                href="/signup"
                radius="lg"
                color="primary"
                endContent={<BiChevronRight />}
                className="font-semibold"
              >
                Join the community
              </Button>
              <Button as={Link} href="/contact-us" radius="lg" variant="bordered">
                Get in touch
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* Real numbers, only when they exist */}
      {stats.length > 0 && (
        <section className="border-b border-default/60 bg-default-50/60">
          <Container>
            <dl className="grid grid-cols-2 divide-x divide-default/60">
              {stats.map((stat) => (
                <div key={stat.label} className="px-4 py-10 text-center">
                  <dd className="text-3xl font-bold tabular-nums tracking-tight sm:text-4xl">
                    {stat.value}
                  </dd>
                  <dt className="mt-1 text-sm text-default-500">
                    {stat.label}
                  </dt>
                </div>
              ))}
            </dl>
          </Container>
        </section>
      )}

      <Container>
        {/* Mission */}
        <section className="mx-auto grid max-w-5xl gap-10 py-16 md:grid-cols-2 lg:py-20">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Our mission</h2>
            <p className="mt-3 leading-relaxed text-default-600">
              To make hard technical subjects approachable without dumbing them
              down. A reader should finish an article able to try the idea
              themselves, and understand where it breaks.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">What we publish</h2>
            <p className="mt-3 leading-relaxed text-default-600">
              Tutorials, explanations of how things actually work, and honest
              comparisons of tools. If we have not used something in practice,
              we do not claim to have reviewed it.
            </p>
          </div>
        </section>

        {/* Principles */}
        <section className="border-t border-default/60 py-16">
          <h2 className="text-2xl font-bold tracking-tight">
            How we work
          </h2>
          <p className="mt-2 text-default-500">
            The standards every article on TechTips Hub is held to.
          </p>
          <div className="mt-8 grid gap-px overflow-hidden rounded-xl border border-default/60 bg-default/60 sm:grid-cols-2 lg:grid-cols-3">
            {principles.map((principle) => (
              <div key={principle.title} className="bg-background p-6">
                <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  {principle.icon}
                </div>
                <h3 className="mt-3 font-semibold">{principle.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-default-600">
                  {principle.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Topics we cover */}
        {categories.length > 0 && (
          <section className="border-t border-default/60 py-16">
            <h2 className="text-2xl font-bold tracking-tight">Topics we cover</h2>
            <div className="mt-6 flex flex-wrap gap-2">
              {categories.map((category) => (
                <Link
                  key={category._id}
                  href={`/?category=${encodeURIComponent(category.name)}`}
                  className="rounded-full border border-default/60 px-3 py-1.5 text-sm text-default-700 transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                >
                  {category.name}
                  {category.postCount > 0 && (
                    <span className="ml-1.5 text-xs text-default-400">
                      {category.postCount}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="my-16 rounded-2xl border border-default/60 bg-default-50/60 px-6 py-14 text-center">
          <h2 className="text-2xl font-bold tracking-tight">
            Written with the community
          </h2>
          <p className="mx-auto mt-3 max-w-xl leading-relaxed text-default-600">
            TechTips Hub is built by its readers as much as by its editors. If
            you know something worth sharing, you are welcome to publish it.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button
              as={Link}
              href="/signup"
              radius="lg"
              color="primary"
              endContent={<FiZap />}
              className="font-semibold"
            >
              Sign up free
            </Button>
            <Button
              as={Link}
              href="/contact-us"
              radius="lg"
              variant="bordered"
              endContent={<BiMailSend />}
            >
              Contact us
            </Button>
          </div>
        </section>

        {/* Existing ad unit — position preserved. */}
        <div className="mb-10 mt-6">
          <AdBanner />
        </div>
      </Container>
    </div>
  );
};

export default AboutUs;
