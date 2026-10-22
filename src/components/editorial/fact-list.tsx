import type { ReactNode } from "react";

interface IProps {
  label: string;
  children: ReactNode;
  className?: string;
}

/**
 * A labelled divider row for small key/value facts (dates, counts, contact
 * details). Flat and hairline-ruled rather than boxed, so a list of them reads
 * as one table instead of several floating cards.
 */
const FactList = ({ label, children, className = "" }: IProps) => (
  <dl className={`border-y border-default/60 ${className}`}>
    <dt className="sr-only">{label}</dt>
    {children}
  </dl>
);

export const Fact = ({
  term,
  children,
}: {
  term: string;
  children: ReactNode;
}) => (
  <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-default/60 py-3.5 last:border-b-0">
    <dt className="text-sm text-default-500">{term}</dt>
    <dd className="text-sm font-medium tabular-nums">{children}</dd>
  </div>
);

export const FactLink = ({
  term,
  href,
  children,
}: {
  term: string;
  href: string;
  children: ReactNode;
}) => (
  <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-default/60 py-3.5 last:border-b-0">
    <dt className="text-sm text-default-500">{term}</dt>
    <dd className="text-sm font-medium">
      <a
        href={href}
        className="text-primary underline-offset-4 hover:underline"
      >
        {children}
      </a>
    </dd>
  </div>
);

export default FactList;
