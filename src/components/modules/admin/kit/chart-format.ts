"use client";

/**
 * Date and number formatting shared by the dashboard and the chart. Day keys
 * from `/admin/activity` are `YYYY-MM-DD`, so they are read in UTC: parsing
 * them as local time shifts every label by a day west of Greenwich.
 */

export const parseDay = (value: string) => {
  const date = new Date(`${value.slice(0, 10)}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? undefined : date;
};

/** "3 Oct" */
export const shortDay = (value: string) => {
  const date = parseDay(value);
  if (!date) return value;

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
};

/** "Thu, 3 Oct 2026" */
export const longDay = (value: string) => {
  const date = parseDay(value);
  if (!date) return value;

  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
};

/** "3 Oct to 1 Nov 2026" */
export const dayRange = (from?: string, to?: string) => {
  if (!from || !to) return "";
  return `${shortDay(from)} to ${longDay(to)}`;
};

const COMPACT = new Intl.NumberFormat("en-GB", {
  notation: "compact",
  maximumFractionDigits: 1,
});

/** "480", "12k", "1.2m": narrow enough for an axis tick. */
export const compactCount = (value: number) => COMPACT.format(value);

export const preciseCount = (value: number) => value.toLocaleString("en-GB");
