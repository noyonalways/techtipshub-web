/**
 * Route segments for user pages arrive as `@username` (and may be
 * percent-encoded). Normalise to the bare username the API expects.
 *
 * The follower pages previously did `routeUsername.split("40")[1]`, which
 * only worked for `%40username` and threw for every other form.
 */
export const normaliseRouteUsername = (segment?: string | null): string => {
  if (!segment) return "";

  let value = segment;
  try {
    value = decodeURIComponent(segment);
  } catch {
    // Malformed escapes: fall back to the raw segment.
  }

  return value.trim().replace(/^@+/, "");
};
