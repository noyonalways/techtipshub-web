import type { ReactNode } from "react";

/** How a metric moved versus the previous period, if that is known. */
export type MetricTrend = "increase" | "decrease" | "no change" | string;

interface IProps {
  label: string;
  value: ReactNode;
  /** Previous-period delta, e.g. "+3" or "N/A". */
  delta?: string;
  trend?: MetricTrend;
  /** Optional context line, e.g. "this month" or "all time". */
  meta?: string;
  icon?: ReactNode;
}

const trendClasses = (trend?: MetricTrend) => {
  if (trend === "increase") return "text-success";
  if (trend === "decrease") return "text-danger";
  return "text-default-400";
};

const trendGlyph = (trend?: MetricTrend) => {
  if (trend === "increase") return "↑";
  if (trend === "decrease") return "↓";
  return "—";
};

/**
 * A single dashboard metric. Flat surface, hairline border, tabular figures —
 * designed to sit in a dense grid rather than to be a decorative card.
 */
const MetricTile = ({ label, value, delta, trend, meta, icon }: IProps) => {
  return (
    <div className="flex flex-col justify-between gap-3 p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium text-default-500">{label}</p>
        {icon && (
          <span aria-hidden className="text-default-300">
            {icon}
          </span>
        )}
      </div>

      <div>
        <p className="text-2xl font-bold tabular-nums tracking-tight">
          {value}
        </p>

        {(delta !== undefined || meta) && (
          <p className="mt-1 flex items-baseline gap-1.5 text-xs">
            {delta !== undefined && (
              <span className={`font-semibold tabular-nums ${trendClasses(trend)}`}>
                <span aria-hidden className="mr-0.5">
                  {trendGlyph(trend)}
                </span>
                {delta}
              </span>
            )}
            {meta && <span className="text-default-500">{meta}</span>}
          </p>
        )}
      </div>
    </div>
  );
};

export default MetricTile;
