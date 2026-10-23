import PageHero from "@/components/editorial/page-hero";
import Container from "@/components/ui/container";
import { legalConfig, legalPages } from "@/config/legal";
import Link from "next/link";
import { BiEnvelope, BiLinkExternal } from "react-icons/bi";

export interface ILegalSection {
  /** Anchor id, also used to build the table of contents. */
  id: string;
  title: string;
  content: React.ReactNode;
}

interface IProps {
  title: string;
  summary: string;
  sections: ILegalSection[];
  /** href of the document being rendered, used to filter the cross-links. */
  currentHref: string;
}

const tocLinkClasses =
  "block border-l border-default/60 py-1.5 pl-4 text-sm leading-snug text-default-600 transition-colors hover:border-primary-600 hover:text-primary-accessible";

/**
 * Shared shell for every legal document: hero, sticky contents rail, prose
 * body and cross-links to the other policies. Server-rendered on purpose —
 * these pages carry no interactivity and should stay cheap and crawlable.
 *
 * The page uses the site's page container, so the hero, the contents rail and
 * the body all start on the same left edge as the header and the footer. The
 * body runs to the full column beside the rail rather than being capped at a
 * narrower measure, which is what left the prose floating away from its title.
 */
const LegalPage = ({ title, summary, sections, currentHref }: IProps) => {
  const otherPages = legalPages.filter((page) => page.href !== currentHref);
  const currentPage = legalPages.find((page) => page.href === currentHref);

  return (
    <main>
      {/* Hero */}
      <section className="border-b border-default/60">
        <Container>
          <div className="py-12 lg:py-16">
            <PageHero
              eyebrow={currentPage?.label ?? "Legal"}
              title={title}
              lede={summary}
              meta={
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-default/60 pt-5 text-sm text-default-600">
                  <span>
                    Last updated{" "}
                    <time
                      dateTime={legalConfig.lastUpdated}
                      className="font-medium text-default-700"
                    >
                      {legalConfig.lastUpdatedLabel}
                    </time>
                  </span>
                  <a
                    href={`mailto:${legalConfig.contactEmail}`}
                    className="inline-flex items-center gap-1.5 font-medium text-primary-accessible underline-offset-4 hover:underline"
                  >
                    <BiEnvelope aria-hidden className="size-4" />
                    Ask a question
                  </a>
                </div>
              }
            />
          </div>
        </Container>
      </section>

      <Container>
        <div className="grid gap-10 py-12 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-16 lg:py-16">
          {/* Contents rail */}
          <aside className="lg:sticky lg:top-[calc(var(--header-height)+2rem)] lg:max-h-[calc(100dvh-var(--header-height)-4rem)] lg:self-start lg:overflow-y-auto lg:pr-2">
            <details className="rounded-xl border border-default/60 bg-default-50/60 px-4 py-3 lg:hidden">
              <summary className="cursor-pointer text-sm font-semibold">
                On this page ({sections.length} sections)
              </summary>
              <ol className="mt-3 space-y-1">
                {sections.map((section, index) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="block py-1 text-sm leading-snug text-default-600"
                    >
                      {index + 1}. {section.title}
                    </a>
                  </li>
                ))}
              </ol>
            </details>

            <nav aria-label="On this page" className="hidden lg:block">
              <h2 className="tth-label">
                On this page
              </h2>
              <ol className="mt-3 space-y-0.5">
                {sections.map((section) => (
                  <li key={section.id}>
                    <a href={`#${section.id}`} className={tocLinkClasses}>
                      {section.title}
                    </a>
                  </li>
                ))}
              </ol>

              <div className="mt-8 border-t border-default/60 pt-5">
                <h2 className="tth-label">
                  All policies
                </h2>
                <ul className="mt-3 space-y-2 text-sm text-default-600">
                  {legalPages.map((page) => (
                    <li key={page.href}>
                      <Link
                        href={page.href}
                        aria-current={
                          page.href === currentHref ? "page" : undefined
                        }
                        className={
                          page.href === currentHref
                            ? "font-medium text-primary-accessible"
                            : "transition-colors hover:text-primary-accessible"
                        }
                      >
                        {page.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </nav>
          </aside>

          {/* Document */}
          <div className="min-w-0">
            <article
              className="prose prose-neutral max-w-none dark:prose-invert prose-headings:font-semibold prose-headings:tracking-tight prose-h2:mt-12 prose-h2:mb-3 prose-h2:border-t prose-h2:border-default/60 prose-h2:pt-8 prose-h2:text-xl prose-h2:first:mt-0 prose-h2:first:border-t-0 prose-h2:first:pt-0 prose-h3:mt-6 prose-h3:text-base prose-p:leading-relaxed prose-p:text-default-600 prose-li:leading-relaxed prose-li:text-default-600 prose-strong:text-foreground prose-a:font-medium prose-a:text-primary-accessible prose-a:underline-offset-4 prose-th:pb-2 prose-th:text-left prose-td:py-2.5 prose-td:align-top prose-table:text-sm prose-code:rounded prose-code:bg-default-100 prose-code:px-1 prose-code:py-0.5 prose-code:font-medium prose-code:text-[0.85em] prose-code:text-foreground prose-code:before:content-none prose-code:after:content-none [&_tbody_tr]:border-default/60 [&_tbody_tr:last-child]:border-0"
            >
              {sections.map((section) => (
                <section
                  key={section.id}
                  id={section.id}
                  aria-labelledby={`${section.id}-heading`}
                  className="scroll-mt-[calc(var(--header-height)+1.5rem)]"
                >
                  <h2 id={`${section.id}-heading`}>{section.title}</h2>
                  {section.content}
                </section>
              ))}
            </article>

            {/* Contact strip */}
            <div className="mt-12 rounded-xl border border-default/60 p-5 sm:p-6">
              <h2 className="text-base font-semibold">
                Questions about this document?
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-default-600">
                Write to us at{" "}
                <a
                  href={`mailto:${legalConfig.contactEmail}`}
                  className="font-medium text-primary-accessible underline-offset-4 hover:underline"
                >
                  {legalConfig.contactEmail}
                </a>{" "}
                and we will answer within a reasonable time, usually a few
                business days.
              </p>
              <dl className="mt-4 space-y-1 border-t border-default/60 pt-4 text-sm text-default-600">
                <div className="flex flex-wrap gap-x-1.5">
                  <dt className="font-medium">Legal entity:</dt>
                  <dd>{legalConfig.legalEntity}</dd>
                </div>
                <div className="flex flex-wrap gap-x-1.5">
                  <dt className="font-medium">Registered address:</dt>
                  <dd>{legalConfig.legalAddress}</dd>
                </div>
              </dl>
            </div>

            {/* Other policies */}
            <nav aria-label="Other policies" className="mt-10">
              <h2 className="tth-label">
                Other policies
              </h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {otherPages.map((page) => (
                  <li key={page.href}>
                    <Link
                      href={page.href}
                      className="group flex h-full flex-col rounded-xl border border-default/60 p-4 transition-colors hover:border-primary-600/50 hover:bg-primary/5"
                    >
                      <span className="flex items-center justify-between gap-2 text-sm font-semibold">
                        {page.label}
                        <BiLinkExternal
                          aria-hidden
                          className="size-4 shrink-0 text-default-600 transition-colors group-hover:text-primary-accessible"
                        />
                      </span>
                      <span className="mt-1 text-xs leading-relaxed text-default-600">
                        {page.description}
                      </span>
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

export default LegalPage;
