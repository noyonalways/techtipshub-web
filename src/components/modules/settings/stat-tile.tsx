import Link from "next/link";
import type { ReactNode } from "react";

interface IProps {
  label: string;
  value: string;
  /** A short qualifier under the number, e.g. "across 23 articles". */
  hint?: string;
  icon?: ReactNode;
  /** Makes the whole tile a link, used when there is a page to continue to. */
  href?: string;
  /** Smaller type for values that are a date rather than a number. */
  compact?: boolean;
}

/**
 * A single number from the account, sized to be scanned next to its
 * neighbours. Numbers are tabular so a column of them lines up.
 */
const StatTile = ({ label, value, hint, icon, href, compact = false }: IProps) => {
  const body = (
    <>
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-default-500">
        {icon && (
          <span aria-hidden className="text-default-400">
            {icon}
          </span>
        )}
        {label}
      </div>
      <p
        className={`mt-2 font-semibold tabular-nums tracking-tight ${
          compact ? "text-base" : "text-2xl"
        }`}
      >
        {value}
      </p>
      {hint && (
        <p className="mt-0.5 truncate text-xs text-default-500">{hint}</p>
      )}
    </>
  );

  const classes =
    "block rounded-xl border border-default/60 bg-content1 px-4 py-3.5 transition-colors";

  return href ? (
    <Link
      href={href}
      className={`${classes} hover:border-primary/40 hover:bg-primary/[0.03]`}
    >
      {body}
    </Link>
  ) : (
    <div className={classes}>{body}</div>
  );
};

export default StatTile;
