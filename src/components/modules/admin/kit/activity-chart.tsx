"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from "recharts";
import {
  compactCount,
  dayRange,
  longDay,
  parseDay,
  preciseCount,
} from "./chart-format";
import { focusRing } from "./tau";
import { useChartTheme } from "./use-chart-theme";
import { useElementWidth } from "./use-element-width";
import { useIsNarrow } from "./use-is-narrow";

export interface AdminChartSeries {
  key: string;
  label: string;
  /**
   * Any CSS colour. A `var(...)` or `hsl(var(...))` string is resolved to a
   * real colour after mount; plain hex values pass straight through.
   */
  color: string;
}

export interface AdminChartPoint {
  /** Point identity, e.g. the ISO day. Falls back to the position when absent. */
  key?: string;
  /** Human label for the point ("3 Oct"), used on the x axis. */
  label: string;
  /** Fuller label for the tooltip ("Thu, 3 Oct 2026"). Defaults from `label`. */
  title?: string;
  [seriesKey: string]: number | string | undefined;
}

interface IProps {
  data: AdminChartPoint[];
  series: AdminChartSeries[];
  /** Default 256. */
  height?: number;
  /** Default "line". Bars are drawn as bars, lines as lines. */
  type?: "line" | "bar";
  /** In-frame series legend. Default false, for callers that already have one. */
  showLegend?: boolean;
  /** Quiet message inside the frame when nothing was recorded. */
  emptyMessage?: string;
  /** What the chart measures, for the screen reader summary. */
  summary?: string;
}

type Row = AdminChartPoint & {
  __label: string;
  __title: string;
  __key: string;
};

const SERIES_FALLBACK = "#8A8178";
const MIN_WIDTH = 200;
const AXIS_TICK_SIZE = 11;
/** Rough advance of one 11px axis label such as "12 Oct" or "12k". */
const TICK_ADVANCE = AXIS_TICK_SIZE * 0.62;
/** Space kept between two neighbouring labels so they read as separate. */
const TICK_GUTTER = 18;

/**
 * A y axis wide enough for its own ticks: "12k" needs less room than
 * "10 thousand", so the width follows the compact label rather than a guess.
 */
const axisWidth = (max: number, narrow: boolean) =>
  Math.round(compactCount(max).length * TICK_ADVANCE + (narrow ? 18 : 12));

/**
 * The date on a day, "1 Nov".
 *
 * Used once per labelled tick on a wide range so the month is stated even when
 * the ticks are three or four weeks apart.
 */
const axisDay = (value: string) => {
  const date = parseDay(value);
  if (!date) return value;

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
};

/**
 * How many x-axis labels the plot can carry.
 *
 * This is what stops the axis turning into a smear when the range jumps from
 * 14 to 90 days: the count comes from the measured width and the labels' own
 * length, not from the viewport. One point per day is still written to the
 * tooltip and the table, so a skipped label never hides a day.
 */
const tickCountFor = (available: number) => {
  const slot = "12 Oct".length * TICK_ADVANCE;
  const fit = Math.floor(available / (slot + TICK_GUTTER)) + 1;

  return Math.max(2, Math.min(fit, 12));
};

/**
 * Which points get a label: a fixed grid across the range, nudged so it starts
 * and ends on a real day, with a month boundary taking the nearest slot so the
 * axis states the new month ("1 Nov") instead of a bare "30 Oct".
 *
 * Recharts addresses ticks by the data value of the axis, not by position, so
 * the answer is a set of day keys. `undefined` means "label every day".
 */
const labelledKeys = (rows: Row[], wanted: number) => {
  if (rows.length <= wanted) return undefined;

  const last = rows.length - 1;
  const step = last / (wanted - 1);
  const chosen = new Set<number>();

  for (let slot = 0; slot <= wanted - 1; slot += 1) {
    chosen.add(Math.round(slot * step));
  }

  // The last day always keeps its label, so the axis ends where the range ends.
  if (last - Math.round((wanted - 1) * step) >= Math.round(step / 2)) {
    chosen.add(last);
  }

  const months: number[] = [];
  for (const [position, row] of rows.entries()) {
    const date = parseDay(row.__key);
    if (date && date.getUTCDate() === 1) months.push(position);
  }

  // A month start within one step of a chosen day takes that day's place, so
  // the axis states the new month ("1 Nov") instead of a bare "29 Oct".
  for (const position of months) {
    let nearest: number | undefined;
    for (const value of chosen) {
      if (value === 0 || value === last) continue;
      if (
        nearest === undefined ||
        Math.abs(value - position) < Math.abs(nearest - position)
      ) {
        nearest = value;
      }
    }

    if (nearest === undefined) continue;
    if (Math.abs(nearest - position) <= Math.max(2, Math.round(step * 0.6))) {
      chosen.delete(nearest);
      chosen.add(position);
    }
  }

  return new Set(
    [...chosen]
      .filter((index) => index >= 0 && index <= last)
      .map(
        (index) => rows[index]?.__key || rows[index]?.__label || String(index),
      ),
  );
};

const valuesIn = (row: Row, series: AdminChartSeries[]) =>
  series
    .map((item) => Number(row[item.key] ?? 0))
    .filter((value) => Number.isFinite(value));

const maxOf = (rows: Row[], series: AdminChartSeries[]) =>
  rows.reduce((top, row) => Math.max(top, ...valuesIn(row, series), 0), 0);

const sumOf = (rows: Row[], key: string) =>
  rows.reduce((total, row) => {
    const value = Number(row[key] ?? 0);
    return total + (Number.isFinite(value) ? value : 0);
  }, 0);

const colourFor = (colours: string[], index: number) =>
  colours[index] ?? colours[0] ?? SERIES_FALLBACK;

const TooltipBox = ({
  active,
  payload,
  label,
  colours,
}: Omit<TooltipContentProps, "payload"> & {
  colours: string[];
  payload?: ReadonlyArray<{
    dataKey?: unknown;
    color?: string;
    name?: unknown;
    value?: unknown;
    payload?: unknown;
  }>;
}) => {
  if (!active || !payload?.length) return null;

  const row = payload[0]?.payload as Row | undefined;
  const title = row?.__title || String(label ?? "");

  return (
    <div className="pointer-events-none rounded-[6px] border border-default-200 bg-content-1 px-2.5 py-2 text-xs">
      <p className="font-medium text-foreground">{title}</p>
      <ul className="mt-1 space-y-0.5">
        {payload.map((entry, index) => (
          <li
            key={String(entry.dataKey ?? index)}
            className="flex items-baseline gap-2"
          >
            <span
              aria-hidden
              className="size-2 shrink-0 rounded-[2px]"
              style={{
                backgroundColor:
                  typeof entry.color === "string"
                    ? entry.color
                    : colourFor(colours, index),
              }}
            />
            <span className="text-default-600">{String(entry.name ?? "")}</span>
            <span className="ml-auto font-medium tabular-nums text-foreground">
              {typeof entry.value === "number"
                ? preciseCount(entry.value)
                : String(entry.value ?? "0")}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

const Legend = ({
  series,
  colours,
}: {
  series: AdminChartSeries[];
  colours: string[];
}) => (
  <ul
    aria-label="Chart series"
    className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-default-600"
  >
    {series.map((item, index) => (
      <li key={item.key} className="flex items-center gap-1.5">
        <span
          aria-hidden
          className="size-2.5 shrink-0 rounded-[2px]"
          style={{ backgroundColor: colourFor(colours, index) }}
        />
        {item.label}
      </li>
    ))}
  </ul>
);

const ChartTable = ({
  rows,
  series,
}: {
  rows: Row[];
  series: AdminChartSeries[];
}) => (
  <details className="mt-2 text-xs">
    <summary
      className={`inline-flex min-h-11 cursor-pointer items-center rounded-sm text-default-600 hover:text-foreground sm:min-h-8 ${focusRing}`}
    >
      The same numbers as a table
    </summary>
    <div className="mt-2 max-h-64 overflow-auto rounded-md border border-default-200">
      <table className="w-full text-left text-xs">
        <thead className="sticky top-0 bg-content-2">
          <tr>
            <th scope="col" className="px-3 py-2 font-medium">
              Day
            </th>
            {series.map((item) => (
              <th
                key={item.key}
                scope="col"
                className="px-3 py-2 text-right font-medium"
              >
                {item.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-default/60">
          {rows.map((row, index) => (
            <tr key={row.__key || index}>
              <th
                scope="row"
                className="px-3 py-1.5 font-normal tabular-nums text-default-600"
              >
                {axisDay(row.__key || row.__label)}
              </th>
              {series.map((item) => (
                <td
                  key={item.key}
                  className="px-3 py-1.5 text-right tabular-nums"
                >
                  {preciseCount(Number(row[item.key] ?? 0))}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </details>
);

/**
 * The one chart component behind the dashboard and analytics.
 *
 * A real LineChart for lines and a real BarChart for bars, colours resolved to
 * concrete strings once mounted (recharts writes them into SVG attributes,
 * where `var()` is not dependable), a frame measured in px so it draws inside
 * flex and grid children, and an honest empty state instead of a blank grid.
 * The figure carries an aria-label summary plus the same numbers as a table,
 * so the data is reachable without reading the picture.
 */
export function AdminActivityChart({
  data,
  series,
  height = 256,
  type = "line",
  showLegend = false,
  emptyMessage = "Nothing recorded in this range",
  summary = "Daily activity",
}: IProps) {
  const isNarrow = useIsNarrow();
  const { tokens, resolved, resolveColour } = useChartTheme();
  const { ref: plotRef, width: plotWidth } = useElementWidth<HTMLDivElement>();

  const rows: Row[] = (Array.isArray(data) ? data : []).map((point) => ({
    ...point,
    __label: typeof point.label === "string" ? point.label : "",
    __key: typeof point.key === "string" ? point.key : "",
    __title:
      typeof point.title === "string" && point.title
        ? point.title
        : longDay(point.label),
  }));

  const colours = series.map((item) => resolveColour(item.color));
  const hasPoints = rows.length > 0;
  const max = maxOf(rows, series);
  const hasSignal = max > 0;

  const totals = series
    .map((item) => `${item.label} ${preciseCount(sumOf(rows, item.key))}`)
    .join(", ");

  // The range reads from the real day keys, so "3 Oct to 1 Nov 2026" cannot
  // come out as "3 Oct to 3 Oct" when only the labels are passed in.
  const span = dayRange(rows[0]?.__key, rows.at(-1)?.__key);
  const ariaLabel =
    hasPoints && hasSignal
      ? `${summary}${span ? ` for ${span}` : ""}. Totals: ${totals}.`
      : `${summary}. ${emptyMessage}.`;

  // One label per day is a smear on a phone and on a 90 day range: the count
  // comes from the measured plot width, so changing 14 -> 90 relabels the axis
  // instead of printing 90 dates in a row.
  const axisTick = { fontSize: AXIS_TICK_SIZE, fill: tokens.axis };
  const tooltip = (props: TooltipContentProps) => (
    <TooltipBox {...props} colours={colours} />
  );
  // The y axis tops out just above the highest point so the line does not run
  // along the top border, and repeats the tick count so grid lines land on
  // whole numbers rather than eighths of a count.
  const tickCount = isNarrow ? 3 : 4;
  const yMax = Math.max(1, Math.ceil((max * 1.08) / tickCount) * tickCount);
  const gutter = axisWidth(yMax, isNarrow);
  const wantedLabels = tickCountFor(Math.max(plotWidth - gutter - 6, 0));
  const ticks = labelledKeys(rows, wantedLabels);
  const frame = (
    <>
      <CartesianGrid
        strokeDasharray="2 4"
        stroke={tokens.grid}
        vertical={false}
      />
      <XAxis
        dataKey="__label"
        tickLine={false}
        axisLine={{ stroke: tokens.grid }}
        tick={axisTick}
        interval="preserveStartEnd"
        ticks={ticks ? [...ticks] : undefined}
        tickFormatter={ticks ? axisDay : undefined}
        tickMargin={8}
        height={26}
        stroke={tokens.grid}
        minTickGap={4}
      />
      <YAxis
        tickLine={false}
        axisLine={false}
        allowDecimals={false}
        width={axisWidth(yMax, isNarrow)}
        tick={axisTick}
        tickFormatter={(value: number) => compactCount(value)}
        domain={[0, yMax]}
        ticks={Array.from({ length: tickCount + 1 }, (_, index) =>
          Math.round((yMax / tickCount) * index),
        )}
        stroke={tokens.grid}
      />
    </>
  );

  return (
    <figure className="m-0 min-w-0 w-full" aria-label={ariaLabel}>
      {!hasPoints ? (
        <div
          className="flex w-full items-center justify-center rounded-md border border-dashed border-default-200 px-4 text-center text-sm text-default-600"
          style={{ height }}
        >
          No daily figures for this range yet.
        </div>
      ) : !resolved || plotWidth === 0 ? (
        // First paint: the theme has not been read and the plot has not been
        // measured yet, so the axis would be labelled from a guess. A quiet
        // frame is the honest wait.
        <div
          ref={plotRef}
          className="w-full rounded-md border border-dashed border-default-200"
          style={{ height }}
          aria-hidden
        />
      ) : (
        <div className="min-w-0 w-full">
          <div ref={plotRef} className="min-w-0 w-full" style={{ height }}>
            <ResponsiveContainer
              width="100%"
              height="100%"
              minWidth={MIN_WIDTH}
            >
              {type === "bar" ? (
                <BarChart
                  data={rows}
                  accessibilityLayer
                  margin={{ left: 0, right: 6, top: 10, bottom: 0 }}
                >
                  {frame}
                  <Tooltip
                    cursor={{ fill: tokens.grid, fillOpacity: 0.4 }}
                    content={tooltip}
                  />
                  {series.map((item, index) => (
                    <Bar
                      key={item.key}
                      dataKey={item.key}
                      name={item.label}
                      fill={colourFor(colours, index)}
                      radius={[3, 3, 0, 0]}
                      maxBarSize={28}
                      isAnimationActive={false}
                    />
                  ))}
                </BarChart>
              ) : (
                <LineChart
                  data={rows}
                  accessibilityLayer
                  margin={{ left: 0, right: 6, top: 10, bottom: 0 }}
                >
                  {frame}
                  <Tooltip
                    cursor={{ stroke: tokens.grid, strokeWidth: 1 }}
                    content={tooltip}
                  />
                  {series.map((item, index) => (
                    <Line
                      key={item.key}
                      type="monotone"
                      dataKey={item.key}
                      name={item.label}
                      stroke={colourFor(colours, index)}
                      strokeWidth={1.75}
                      dot={false}
                      activeDot={{ r: 3 }}
                      isAnimationActive={false}
                    />
                  ))}
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* The legend holds its row whether or not it is asked for: a frame
              that grows after mount makes ResponsiveContainer drop the axis
              labels it had already measured. */}
          <div className="shrink-0 pt-2" style={{ minHeight: 20 }}>
            {showLegend && series.length > 0 ? (
              <Legend series={series} colours={colours} />
            ) : null}
          </div>
        </div>
      )}

      {!hasPoints ? null : hasSignal ? (
        <ChartTable rows={rows} series={series} />
      ) : (
        <p className="mt-2 text-xs text-default-600">{emptyMessage}</p>
      )}
    </figure>
  );
}

export default AdminActivityChart;

/** Series colours read from the theme; one amber against three warm neutrals. */
export const adminChartColours = {
  primary: "hsl(var(--heroui-primary))",
  foreground: "hsl(var(--heroui-foreground))",
  muted: "hsl(var(--heroui-default-500))",
  faint: "hsl(var(--heroui-default-300))",
} as const;
