import Container from "@/components/ui/container";
import { Logo } from "@/components/shared/logo";
import { legalConfig, legalPages } from "@/config/legal";
import FollowingLink from "./following-link";
import Link from "next/link";
import type { ReactNode } from "react";
import { FiArrowRight, FiMail } from "react-icons/fi";

/*
 * The footer has three bands, and only the middle one is a column grid:
 *
 *   1. The invitation  a line in the editorial face, one action, on the site's
 *                      left measure (DESIGN.md: the left-aligned measure).
 *   2. The directory   the mark and what the site is, then Read and Help, and
 *                      contact details set as a definition list. Contact is a
 *                      term/value pair, so `dl` rather than another link list.
 *   3. The policies    all six legal documents as one wrapping row, then the
 *                      copyright.
 *
 * Reasons, one line each:
 * - Three bands, not the Product / Company / Resources / Legal template: this
 *   site has two link groups and six policies, so four half-empty columns would
 *   be a template, not a directory.
 * - A warm `default-50` wash instead of plain paper: it closes the page without
 *   repeating the page background, and keeps to the neutral ramp.
 * - One amber word (the action) and one amber line (the contact address): the
 *   accent lands at the two things a reader can do, nowhere else.
 * - Hairlines instead of boxes, shadow and radius: the footer is chrome, and
 *   DESIGN.md draws separation with rules and space.
 * - No icon row for social profiles: the configured GitHub / Twitter / Discord
 *   links point at an unrelated project's accounts, so they would be dead or
 *   wrong links. The mail icon marks a real `mailto:` and nothing else.
 * - Links are at least 32px tall and the action 44px, so the footer is
 *   thumb-sized on a phone.
 */

const helpLinks = [
  { label: "Contact us", href: "/contact" },
  { label: "Community guidelines", href: "/community-guidelines" },
];

const linkClass =
  "inline-flex min-h-8 items-center text-sm text-default-600 underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus/70";

const LinkGroup = ({
  title,
  id,
  links,
  extra,
}: {
  title: string;
  id: string;
  links: { label: string; href: string }[];
  /** Rendered after the static links, inside the same list. */
  extra?: ReactNode;
}) => (
  <nav aria-labelledby={id}>
    <h2 id={id} className="tth-label-sm">
      {title}
    </h2>
    <ul className="mt-1">
      {links.map((link) => (
        <li key={link.label}>
          <Link className={linkClass} href={link.href}>
            {link.label}
          </Link>
        </li>
      ))}
      {extra}
    </ul>
  </nav>
);

/** A labelled item in the contact block: a term with what it points to. */
const ContactItem = ({
  term,
  children,
}: {
  term: string;
  children: ReactNode;
}) => (
  <div className="border-b border-default/60 py-3 first:pt-0 last:border-b-0 last:pb-0">
    <dt className="text-xs text-default-600">{term}</dt>
    <dd className="mt-1 text-sm font-medium">{children}</dd>
  </div>
);

/**
 * The footer's Read group: the pages that exist for everyone.
 *
 * "Following" is the one link that depends on who is reading, so it is the one
 * link rendered in the browser (see `following-link.tsx`). Keeping the
 * session out of the footer is what lets every page that shows it be
 * prerendered instead of rendered per request.
 */
const readLinks = [
  { label: "The feed", href: "/" },
  { label: "Write here", href: "/features" },
  { label: "About the publication", href: "/about" },
];

const Footer = () => {

  return (
    <footer className="border-t border-default bg-default-50 print:hidden">
      <Container>
        {/* 1. The invitation */}
        <div className="grid gap-8 border-b border-default/60 py-12 md:grid-cols-[minmax(0,1fr)_auto] md:items-end md:gap-12 lg:py-16">
          <div className="max-w-xl">
            {/* The closing line for the page above, in the editorial face, so
                a reader knows the page has ended and the site has not. */}
            <p className="font-[family-name:var(--type-editorial)] text-2xl font-semibold leading-[1.15] tracking-[-0.015em] text-balance md:text-[1.75rem]">
              Keep reading, or add what you have learned to the shelf.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-default-600">
              TechTipsHub is an independent publication. Every article is free
              to read, and any member can publish.
            </p>
          </div>
          <p className="md:pb-1">
            <Link
              href="/features"
              className="group inline-flex min-h-11 items-center gap-2 rounded-md px-1 text-sm font-semibold text-primary-accessible underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus/70"
            >
              Start writing on TechTipsHub
              {/* The arrow marks the one primary action in the footer. */}
              <FiArrowRight
                aria-hidden
                className="size-4 transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          </p>
        </div>

        {/* 2. The directory */}
        <div className="grid gap-10 border-b border-default/60 py-12 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1.25fr)] lg:gap-16">
          <div className="max-w-sm md:col-span-2 lg:col-span-1">
            <Link
              href="/"
              aria-label="TechTipsHub home"
              className="inline-flex rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus/70"
            >
              <Logo size="md" tagline />
            </Link>
            <p className="mt-5 text-sm leading-relaxed text-default-600">
              Practical writing on web development, AI and the tools modern
              developers use every day.
            </p>
          </div>

          <div className="py-0 md:py-1">
            <LinkGroup
              title="Read"
              id="footer-read"
              links={readLinks}
              extra={<FollowingLink />}
            />
          </div>

          <div className="md:py-1">
            <LinkGroup title="Help" id="footer-help" links={helpLinks} />

            <dl className="mt-8 border-t border-default/60 pt-3">
              <ContactItem term="Enquiries">
                <a
                  href={`mailto:${legalConfig.contactEmail}`}
                  className="inline-flex min-h-8 flex-wrap items-center gap-x-2 gap-y-1 py-0.5 text-primary-accessible underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus/70"
                >
                  <FiMail aria-hidden className="size-4 shrink-0" />
                  {/*
                    The address breaks at normal break opportunities and not
                    mid-word, so it does not split as "gmail.co / m" in the
                    narrow column of a tablet. The current inbox has no such
                    point, so in that column the icon wraps above it instead.
                  */}
                  <span className="min-w-0">{legalConfig.contactEmail}</span>
                </a>
              </ContactItem>
              <ContactItem term="What we publish">
                Tutorials, explainers and honest tool comparisons from people
                who build with them.
              </ContactItem>
            </dl>
          </div>
        </div>

        {/* 3. Policies, then the small print. On wide screens the documents
            wrap on the left and the copyright holds the right edge. */}
        <div className="flex flex-col gap-5 py-6 text-xs text-default-600 md:flex-row md:items-start md:justify-between md:gap-10">
          <nav aria-labelledby="footer-policies">
            <h2 id="footer-policies" className="sr-only">
              Policies
            </h2>
            <ul className="flex flex-wrap gap-x-5 gap-y-1">
              {legalPages.map((page) => (
                <li key={page.href}>
                  <Link
                    href={page.href}
                    className="inline-flex min-h-8 items-center underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus/70"
                  >
                    {page.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <p className="shrink-0 md:text-right">
            &copy; {new Date().getFullYear()} {legalConfig.operator}. All rights
            reserved.
          </p>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
