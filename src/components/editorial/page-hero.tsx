import type { ReactNode } from "react";

interface IProps {
  /** Small uppercase label above the heading. */
  eyebrow: string;
  /** Render as h1 on the page's first hero, h2 further down. */
  as?: "h1" | "h2";
  title: ReactNode;
  lede?: ReactNode;
  /** Row beneath the lede: dates, buttons, links. */
  meta?: ReactNode;
  className?: string;
}

/**
 * The opening block for editorial pages.
 *
 * Deliberately left-aligned and narrow: the previous centred heroes read like
 * generic marketing pages and left huge empty fields either side. A left edge
 * shared with the body below it is what makes these pages feel authored.
 */
const PageHero = ({
  eyebrow,
  as: Heading = "h1",
  title,
  lede,
  meta,
  className = "",
}: IProps) => (
  <header className={`max-w-3xl ${className}`}>
    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
      {eyebrow}
    </p>
    <Heading className="mt-4 text-pretty text-4xl font-semibold leading-[1.1] tracking-tight text-balance md:text-[2.75rem]">
      {title}
    </Heading>
    {lede && (
      <div className="mt-5 max-w-2xl text-lg leading-relaxed text-default-600">
        {lede}
      </div>
    )}
    {meta && <div className="mt-8">{meta}</div>}
  </header>
);

export default PageHero;
