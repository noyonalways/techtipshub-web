import type { ReactNode } from "react";

interface IProps {
  title: string;
  description?: string;
  /** Marks the heading so a section can be referenced with `aria-labelledby`. */
  id?: string;
  /** Controls that belong to the section, aligned with the heading. */
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

/**
 * One settings topic in its own card.
 *
 * The dense settings column reads as a list of jobs — identity, public
 * details, links — so each gets a card with a heading that says what it is for
 * rather than another horizontal rule between fields.
 */
const SettingsSection = ({
  title,
  description,
  id,
  action,
  children,
  className = "",
}: IProps) => {
  return (
    <section
      id={id}
      aria-labelledby={id ? `${id}-heading` : undefined}
      className={`rounded-2xl border border-default/60 bg-content1 ${className}`}
    >
      <div className="flex flex-col gap-2 border-b border-default/60 px-5 py-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div className="min-w-0">
          <h2
            id={id ? `${id}-heading` : undefined}
            className="text-sm font-semibold tracking-tight"
          >
            {title}
          </h2>
          {description && (
            <p className="mt-0.5 text-sm leading-relaxed text-default-600">
              {description}
            </p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>

      <div className="px-5 py-5">{children}</div>
    </section>
  );
};

export default SettingsSection;
