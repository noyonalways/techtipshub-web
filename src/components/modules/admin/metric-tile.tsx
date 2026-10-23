import type { ReactNode } from "react";
import {
  RiArrowDownLine,
  RiArrowRightLine,
  RiArrowUpLine,
} from "react-icons/ri";

/** How a metric moved versus the previous period, if that is known. */
export type MetricTrend = "increase" | "decrease" | "no change" | string;

interface IProps {
  label: string;
  value: ReactNode;
  /** Pre-formatted previous-period change, e.g. "+12.5% vs last month". */
  delta?: string;
  trend?: MetricTrend;
  /** Context line, e.g. "this month" or "all time". */
  meta?: string;
  icon?: ReactNode;
}

const trendClasses = (trend?: MetricTrend) => {
  if (trend === "increase") return "text-success-700 dark:text-success";
  if (trend === "decrease") return "text-danger";
  return "text-default-600";
};

const trendWord = (trend?: MetricTrend) => {
  if (trend === "increase") return "increase";
  if (trend === "decrease") return "decrease";
  return "no change";
};

/**
 * A single dashboard metric. Flat surface, hairline border, tabular figures,
 * and a trend carried by an arrow and a word as well as by colour, so the
 * meaning survives a colour-blind read.
 */
const MetricTile = ({ label, value, delta, trend, meta, icon }: IProps) => {
  const TrendIcon =
    trend === "increase"
      ? RiArrowUpLine
      : trend === "decrease"
        ? RiArrowDownLine
        : RiArrowRightLine;

  return (
    <div className="flex h-full flex-col justify-between gap-3 p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="tth-label-sm">{label}</p>
        {icon && (
          <span aria-hidden className="text-default-500">
            {icon}
          </span>
        )}
      </div>

      <div>
        <p className="font-[family-name:var(--type-editorial)] text-[1.75rem] font-semibold leading-none tracking-[-0.02em] tabular-nums">
          {value}
        </p>

        {(delta !== undefined || meta) && (
          <p className="mt-2 flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5 text-xs">
            {delta !== undefined && (
              <span
                className={`inline-flex items-center gap-1 font-medium tabular-nums ${trendClasses(
                  trend,
                )}`}
              >
                <TrendIcon aria-hidden className="size-3.5 shrink-0" />
                {delta}
                <span className="sr-only">{trendWord(trend)}</span>
              </span>
            )}
            {meta && <span className="text-default-600">{meta}</span>}
          </p>
        )}
      </div>
    </div>
  );
};

export default MetricTile;
