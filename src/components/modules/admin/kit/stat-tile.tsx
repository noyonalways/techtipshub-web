import Link from "next/link";
import type { ReactNode } from "react";
import {
  RiArrowDownLine,
  RiArrowRightLine,
  RiArrowUpLine,
} from "react-icons/ri";
import { focusRing } from "./tau";

export interface StatDelta {
  /** Pre-formatted change, e.g. "+12.5%". */
  value: string;
  trend: "up" | "down" | "flat";
}

interface IProps {
  label: string;
  /** Pre-formatted by the caller; the tile never rounds or invents. */
  value: ReactNode;
  /** Period the value covers, e.g. "all time". */
  hint?: string;
  delta?: StatDelta;
  /** Links the whole tile when set. */
  href?: string;
}

const trendStyles = (trend: StatDelta["trend"]) =>
  trend === "up"
    ? "border-success/30 bg-success/10 text-success-700 dark:text-success"
    : trend === "down"
      ? "border-danger/30 bg-danger/10 text-danger"
      : "border-default/60 bg-default-100 text-default-600";

const Trend = ({ delta }: { delta: StatDelta }) => {
  const Icon =
    delta.trend === "up"
      ? RiArrowUpLine
      : delta.trend === "down"
        ? RiArrowDownLine
        : RiArrowRightLine;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-xs font-medium ${trendStyles(
        delta.trend,
      )}`}
    >
      <Icon aria-hidden className="size-3.5 shrink-0" />
      <span className="tabular-nums">{delta.value}</span>
      <span className="sr-only">
        {delta.trend === "up"
          ? "increase"
          : delta.trend === "down"
            ? "decrease"
            : "no change"}
      </span>
    </span>
  );
};

/**
 * One dashboard figure. The number is the largest thing in the block and uses
 * tabular figures so a row of tiles lines up; the delta is a pill because it
 * is a real comparison against a named period, and it carries an arrow plus a
 * spoken word so the direction does not depend on colour alone.
 */
export default function StatTile({ label, value, hint, delta, href }: IProps) {
  const body = (
    <>
      <p className="tth-label-sm">{label}</p>
      <p className="mt-1.5 font-[family-name:var(--type-editorial)] text-[1.75rem] font-semibold leading-none tracking-[-0.02em] tabular-nums sm:text-[2rem]">
        {value}
      </p>
      <div className="mt-2.5 flex min-h-6 flex-wrap items-center gap-x-2 gap-y-1 text-xs">
        {delta ? <Trend delta={delta} /> : null}
        {hint && <span className="text-default-600">{hint}</span>}
      </div>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={`block h-full bg-content-1 p-4 transition-colors hover:bg-default-50 ${focusRing}`}
      >
        {body}
      </Link>
    );
  }

  return <div className="h-full bg-content-1 p-4">{body}</div>;
}
