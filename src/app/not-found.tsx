import ButtonLink from "@/components/ui/button-link";
import Container from "@/components/ui/container";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page Not Found",
  description:
    "The page you're looking for doesn't exist. Please check the URL or return to the homepage for more content.",
  keywords: "404, not found, TechTipsHub, missing page, error page",
  openGraph: {
    title: "Page Not Found",
    description:
      "Oops! The page you're looking for can't be found. Explore more content at TechTipsHub.",
  },
};

const suggestions = [
  { href: "/", label: "The feed", hint: "Latest articles" },
  { href: "/features", label: "Write for us", hint: "Publish a tutorial" },
  { href: "/about", label: "About", hint: "What we cover" },
  { href: "/contact", label: "Contact", hint: "Report a broken link" },
];

const NotFoundPage = () => {
  return (
    <main>
      <Container>
        <div className="grid min-h-[calc(100dvh-var(--header-height)-1px)] content-center gap-10 py-16 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-16">
          <p className="tth-label font-mono tabular-nums lg:pt-2">
            404
          </p>

          <div>
            <h1 className="text-pretty font-[family-name:var(--type-editorial)] text-4xl font-semibold leading-[1.05] tracking-[-0.015em] md:text-5xl">
              This page does not exist
            </h1>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-default-600">
              The link may be out of date, or the article may have been removed.
              The feed is the best place to pick things up.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink
                href="/"
                radius="lg"
                color="primary"
                className="font-semibold"
              >
                Back to the feed
              </ButtonLink>
              <ButtonLink href="/contact" radius="lg" variant="bordered">
                Report a broken link
              </ButtonLink>
            </div>

            <nav
              aria-label="Useful pages"
              className="mt-12 border-t border-default/60 pt-6"
            >
              <p className="tth-label">
                Try one of these
              </p>
              <ul className="mt-4 grid gap-x-8 gap-y-1 sm:grid-cols-2">
                {suggestions.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="flex items-baseline justify-between gap-3 border-b border-default/40 py-2.5 text-sm transition-colors hover:text-primary-accessible"
                    >
                      <span className="font-medium">{item.label}</span>
                      <span className="text-xs text-default-600">{item.hint}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </Container>
    </main>
  );
};

export default NotFoundPage;
