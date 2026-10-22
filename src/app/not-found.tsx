import ButtonLink from "@/components/ui/button-link";
import Container from "@/components/ui/container";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page Not Found",
  description:
    "The page you're looking for doesn't exist. Please check the URL or return to the homepage for more content.",
  keywords: "404, not found, TechTips Hub, missing page, error page",
  openGraph: {
    title: "Page Not Found",
    description:
      "Oops! The page you're looking for can't be found. Explore more content at TechTips Hub.",
  },
};

const suggestions = [
  { href: "/", label: "The feed", hint: "Latest articles" },
  { href: "/features", label: "Write for us", hint: "Publish a tutorial" },
  { href: "/about-us", label: "About", hint: "What we cover" },
  { href: "/contact-us", label: "Contact", hint: "Report a broken link" },
];

const NotFoundPage = () => {
  return (
    <main>
      <Container>
        <div className="mx-auto flex min-h-[calc(100dvh-var(--header-height)-1px)] max-w-2xl flex-col justify-center py-16">
          <p className="font-mono text-sm font-medium tabular-nums text-primary">
            404
          </p>
          <h1 className="mt-3 text-pretty text-4xl font-bold leading-tight tracking-tight md:text-5xl">
            This page does not exist
          </h1>
          <p className="mt-4 max-w-lg text-lg leading-relaxed text-default-600">
            The link may be out of date, or the article may have been removed.
            The feed is the best place to pick things up.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/" radius="lg" color="primary" className="font-semibold">
              Back to the feed
            </ButtonLink>
            <ButtonLink href="/contact-us" radius="lg" variant="bordered">
              Report a broken link
            </ButtonLink>
          </div>

          <nav aria-label="Useful pages" className="mt-12 border-t border-default/60 pt-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-default-500">
              Try one of these
            </p>
            <ul className="mt-4 grid gap-x-8 gap-y-1 sm:grid-cols-2">
              {suggestions.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="flex items-baseline justify-between gap-3 border-b border-default/40 py-2.5 text-sm transition-colors hover:text-primary"
                  >
                    <span className="font-medium">{item.label}</span>
                    <span className="text-xs text-default-500">{item.hint}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </Container>
    </main>
  );
};

export default NotFoundPage;
