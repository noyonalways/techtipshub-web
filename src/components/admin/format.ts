/** Number formatting shared by the admin screens, so counts read the same everywhere. */

export const formatCount = (value?: number | null): string =>
  typeof value === "number" && Number.isFinite(value)
    ? value.toLocaleString("en-GB")
    : "";

export const formatDate = (value?: string | null): string => {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const formatDateTime = (value?: string | null): string => {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const initialsOf = (name?: string | null): string =>
  (name || "?").trim().charAt(0).toUpperCase() || "?";

/** A count with thousands separators, or "" when the value is not a number. */
export const formatNumber = (value?: number | null): string =>
  typeof value === "number" && Number.isFinite(value)
    ? value.toLocaleString("en-GB")
    : "";

/** "1 image", "2 images": a response count is never written as "2 image". */
export const plural = (count: number, singular: string, many?: string) =>
  `${count.toLocaleString("en-GB")} ${count === 1 ? singular : (many ?? `${singular}s`)}`;
