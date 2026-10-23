import type { ReactNode } from "react";

interface IProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  meta?: ReactNode;
  /** Link label of the current section, from adminLinks. Kept so call sites
   * compile; the top bar already shows the breadcrumb. */
  section?: string;
  /** Section group shown before the section in the breadcrumb. */
  group?: string;
}

/**
 * Heading block for every admin screen: the title is the page's one focal
 * point, the description says what the screen is for, the actions sit on the
 * same baseline on wide screens and under the title on phones.
 *
 * It used to repeat the breadcrumb that the top bar renders one row above it.
 * One location line is enough, so this header starts at the title.
 */
export default function AdminPageHeader({
  title,
  description,
  actions,
  meta,
}: IProps) {
  return (
    <header className="mb-6 flex flex-col gap-4 border-b border-default/60 pb-5 sm:flex-row sm:items-end sm:justify-between lg:mb-8">
      <div className="min-w-0">
        <h1 className="text-balance font-[family-name:var(--type-editorial)] text-[1.75rem] font-semibold leading-[1.1] tracking-[-0.02em] sm:text-[2rem]">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-[62ch] text-sm leading-relaxed text-default-600">
            {description}
          </p>
        )}
        {meta && (
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-default-600">
            {meta}
          </div>
        )}
      </div>

      {actions && (
        <div className="-mx-1 flex shrink-0 flex-wrap items-center gap-2 sm:mx-0 sm:justify-end">
          {actions}
        </div>
      )}
    </header>
  );
}
