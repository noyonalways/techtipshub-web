/**
 * Format a blog timestamp for display. Returns `null` when the value is
 * missing or unparseable, so callers can omit the date instead of rendering
 * "Invalid Date".
 */
export const formatBlogDate = (value?: string | null): string | null => {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};
