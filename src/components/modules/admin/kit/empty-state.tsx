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
 * than showing a blank panel or fake rows. Used for empty, failed and
 * filtered-to-nothing lists; the copy is what tells those three apart.
 *
 * One action only. A state with three equally weighted buttons asks the
 * reader to decide what the product should decide.
 */
const EmptyState = ({
  title,
  description,
  action,
  icon,
  variant = "box",
}: IProps) => {
  const iconTile = (size: string) =>
    icon ? (
      <span
        aria-hidden
        className={`${size} flex items-center justify-center rounded-[10px] border border-default/60 bg-default-50 text-default-600`}
      >
        {icon}
      </span>
    ) : null;

  if (variant === "inline") {
    return (
      <div className="px-4 py-10 text-center">
        {icon && (
          <div className="mb-3 flex justify-center">{iconTile("size-9")}</div>
        )}
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="mx-auto mt-1 max-w-sm text-sm leading-relaxed text-default-600">
          {description}
        </p>
        {action && <div className="mt-4 flex justify-center">{action}</div>}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center rounded-xl border border-default/60 bg-content-1 px-6 py-12 text-center">
      {icon && <div className="mb-3">{iconTile("size-10")}</div>}
      <p className="font-[family-name:var(--type-editorial)] text-lg font-semibold tracking-[-0.015em]">
        {title}
      </p>
      <p className="mx-auto mt-1 max-w-sm text-sm leading-relaxed text-default-600">
        {description}
      </p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
};

export default EmptyState;
