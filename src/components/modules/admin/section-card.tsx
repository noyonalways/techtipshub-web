import type { ReactNode } from "react";

interface IProps {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  /** Remove the inner padding when the child manages its own (e.g. tables). */
  flush?: boolean;
  className?: string;
}

/** Titled panel used to group admin content on flat surfaces. */
const SectionCard = ({
  title,
  description,
  action,
  children,
  flush = false,
  className = "",
}: IProps) => {
  return (
    <section
      className={`overflow-hidden rounded-xl border border-default/60 bg-background ${className}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-default/60 px-4 py-3.5 sm:px-5">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
          {description && (
            <p className="mt-0.5 text-xs text-default-500">{description}</p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>

      <div className={flush ? "" : "p-4 sm:p-5"}>{children}</div>
    </section>
  );
};

export default SectionCard;
