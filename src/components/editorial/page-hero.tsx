import type { ReactNode } from "react";

interface IProps {
  /** Small label above the heading. Sentence case: the heading carries the voice. */
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
 * Left-aligned and narrow: the heading shares its left edge with the body
 * below it, which is what makes these pages feel authored rather than
 * centred marketing templates. The heading uses the display serif; the lede
 * stays in the interface face so it reads as text, not as a slogan.
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
    <p className="flex items-center gap-2.5 text-xs font-medium tracking-[0.02em] text-default-600">
      <span aria-hidden className="h-px w-6 bg-primary" />
      {eyebrow}
    </p>
    <Heading className="mt-5 text-pretty font-[family-name:var(--type-editorial)] text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-balance md:text-[3.25rem]">
      {title}
    </Heading>
    {lede && (
      <div className="mt-6 max-w-2xl text-lg leading-relaxed text-default-600">
        {lede}
      </div>
    )}
    {meta && <div className="mt-8">{meta}</div>}
  </header>
);

export default PageHero;
