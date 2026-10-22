import type { ReactNode } from "react";

interface IProps {
  title: string;
  description: string;
  /** A call to action, usually a link to where the empty state can be filled. */
  action?: ReactNode;
  icon?: ReactNode;
  /** Use "inline" inside a table body where vertical space is tight. */
  variant?: "box" | "inline";
}

/**
 * Honest empty state: says what is missing and what will appear here, rather
 * than showing a blank panel or fake rows.
 */
const EmptyState = ({
  title,
  description,
  action,
  icon,
  variant = "box",
}: IProps) => {
  if (variant === "inline") {
    return (
      <div className="px-4 py-10 text-center">
        <p className="text-sm font-medium">{title}</p>
        <p className="mx-auto mt-1 max-w-sm text-sm text-default-500">
          {description}
        </p>
        {action && <div className="mt-4">{action}</div>}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed border-default/60 px-6 py-12 text-center">
      {icon && (
        <span
          aria-hidden
          className="mb-3 flex size-10 items-center justify-center rounded-lg bg-default-100 text-default-500"
        >
          {icon}
        </span>
      )}
      <p className="text-sm font-semibold">{title}</p>
      <p className="mx-auto mt-1 max-w-sm text-sm leading-relaxed text-default-500">
        {description}
      </p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
};

export default EmptyState;
