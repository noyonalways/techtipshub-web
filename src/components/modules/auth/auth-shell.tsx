import Container from "@/components/ui/container";
import { poppins } from "@/config/fonts";
import Link from "next/link";
import type { ReactNode } from "react";
import { BiCheck } from "react-icons/bi";
import { HiOutlineArrowLeft } from "react-icons/hi2";

interface IProps {
  /** Eyebrow above the heading, e.g. "Account". */
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  /** Bottom row, usually "Don't have an account? Sign up". */
  footer?: ReactNode;
  /** The points listed beside the form on wide screens. */
  points?: { title: string; description: string }[];
}

/**
 * Shared shell for login, sign up and password reset.
 *
 * Form on the left, a quiet value panel on the right — full width on the page
 * rather than a floating card, so it reads as part of the site.
 *
 * The split is deliberately measured rather than even: the form column is
 * capped near a comfortable field width and the panel is padded well clear of
 * the divider. The earlier version pinned the panel's text to the rule and let
 * the form float in the left third of a wide screen; here the two columns are
 * centred as a pair at a fixed gap.
 */
const AuthShell = ({
  eyebrow,
  title,
  description,
  children,
  footer,
  points = [],
}: IProps) => {
  return (
    <main className="border-b border-default/60">
      <Container>
        <div className="grid gap-12 py-10 sm:py-14 lg:grid-cols-[minmax(0,26rem)_minmax(0,22rem)] lg:justify-center lg:gap-16 lg:py-20 xl:gap-20">
          {/* Form column */}
          <div className="min-w-0">
            <Link
              href="/"
              className="mb-8 inline-flex w-fit items-center gap-1.5 text-sm font-medium text-default-500 transition-colors hover:text-primary"
            >
              <HiOutlineArrowLeft aria-hidden className="size-3.5" />
              Back to the feed
            </Link>

            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
              {eyebrow}
            </p>
            <h1
              className={`${poppins.className} mt-3 text-pretty text-3xl font-semibold leading-tight tracking-tight md:text-[2.5rem]`}
            >
              {title}
            </h1>
            <p className="mt-3 leading-relaxed text-default-600">
              {description}
            </p>

            <div className="mt-9">{children}</div>

            {footer && (
              <div className="mt-7 text-sm text-default-600">{footer}</div>
            )}
          </div>

          {/* Support panel */}
          {points.length > 0 && (
            <aside className="lg:border-l lg:border-default/60 lg:pl-14 xl:pl-20">
              <div className="lg:sticky lg:top-[calc(var(--header-height)+4rem)]">
                <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-default-500">
                  What you get
                </h2>
                <ul className="mt-5 space-y-5">
                  {points.map((point) => (
                    <li key={point.title} className="flex gap-3">
                      <BiCheck
                        aria-hidden
                        className="mt-0.5 size-4 shrink-0 text-primary"
                      />
                      <div>
                        <p className="text-sm font-semibold">{point.title}</p>
                        <p className="mt-0.5 text-sm leading-relaxed text-default-600">
                          {point.description}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>

                <p className="mt-8 border-t border-default/60 pt-5 text-sm leading-relaxed text-default-500">
                  Questions before you join? Read the{" "}
                  <Link
                    href="/community-guidelines"
                    className="font-medium text-primary underline-offset-4 hover:underline"
                  >
                    community guidelines
                  </Link>{" "}
                  or{" "}
                  <Link
                    href="/contact-us"
                    className="font-medium text-primary underline-offset-4 hover:underline"
                  >
                    get in touch
                  </Link>
                  .
                </p>
              </div>
            </aside>
          )}
        </div>
      </Container>
    </main>
  );
};

export default AuthShell;
