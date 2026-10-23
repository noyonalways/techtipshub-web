import type { ReactNode } from "react";

interface IProps {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  /** Remove the inner padding when the child manages its own (e.g. tables). */
  flush?: boolean;
  /** Shorter header and padding, for panels stacked in a sidebar column. */
  dense?: boolean;
  /** A rule-separated row under the content, e.g. a link or a count. */
  footer?: ReactNode;
  className?: string;
}

/**
 * Titled panel used to group admin content. The border is a hairline and the
 * radius the panel step of the scale; the only elevation is a 1px shadow in
 * light mode, which keeps a panel sitting just above paper without the stack
 * of shadows a dashboard usually carries.
 *
 * The fill is `content1`, the theme's surface token, which is white in the
 * light theme and the raised charcoal step in the dark one. The page behind
 * the cards keeps the site's warm paper, so a panel reads as a sheet on it.
 * Panels and tiles use this same token; the toolbar fields keep `background`
 * so a field inside a panel still reads as recessed.
 *
 * The header is a quiet strip inside the same surface, not a tinted band: a
 * different fill would turn every section into a card inside a card.
 */
const SectionCard = ({
  title,
  description,
  action,
  children,
  flush = false,
  dense = false,
  footer,
  className = "",
}: IProps) => {
  return (
    <section
      className={`overflow-hidden rounded-xl border border-default/60 bg-content-1 shadow-[0_1px_2px_rgba(20,19,21,0.04)] dark:shadow-none ${className}`}
    >
      <div
        className={`flex flex-wrap items-start justify-between gap-x-4 gap-y-2 border-b border-default/60 ${
          dense ? "px-3 py-2.5 sm:px-4" : "px-4 py-3 sm:px-5 sm:py-3.5"
        }`}
      >
        <div className="min-w-0">
          <h2
            className={`font-[family-name:var(--type-editorial)] font-semibold tracking-[-0.01em] ${
              dense ? "text-[0.9375rem]" : "text-base"
            }`}
          >
            {title}
          </h2>
          {description && (
            <p className="mt-0.5 max-w-[62ch] text-xs leading-relaxed text-default-600">
              {description}
            </p>
          )}
        </div>
        {action && (
          <div className="flex shrink-0 items-center gap-2">{action}</div>
        )}
      </div>

      <div className={flush ? "" : dense ? "p-3 sm:p-4" : "p-4 sm:p-5"}>
        {children}
      </div>

      {footer && (
        <div className="border-t border-default/60 bg-default-50/40 px-4 py-2.5 text-xs text-default-600 sm:px-5">
          {footer}
        </div>
      )}
    </section>
  );
};

export default SectionCard;
