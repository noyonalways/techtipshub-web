/**
 * The API answers every route with `{ success, data }`, and returns the error
 * body instead of throwing. Unwrapping in one place keeps the screens from
 * reading a field that only exists when the request worked.
 */
export const unwrap = <T>(response: unknown): T | undefined => {
  if (!response || typeof response !== "object") return undefined;

  const payload = response as { success?: boolean; data?: T };

  if (payload.success === false) return undefined;

  return payload.data;
};

export const isFailure = (response: unknown) => !unwrap(response);

/**
 * Why a request failed, as far as the body says. The services return the API's
 * error body instead of throwing, so a 403 and a dead connection look the same
 * until the message is read. Every admin screen shows this rather than one
 * generic "check that the API is running".
 */
export const failureMessage = (response: unknown): string | undefined => {
  if (!response || typeof response !== "object") return undefined;

  const payload = response as { success?: boolean; message?: unknown };

  if (Array.isArray(payload.message)) {
    const messages = payload.message.filter(
      (item): item is string => typeof item === "string",
    );
    return messages.length > 0 ? messages.join(". ") : undefined;
  }

  return typeof payload.message === "string" && payload.message.trim()
    ? payload.message
    : undefined;
};

/** Tagged en dash style separator: the site avoids em dashes in copy. */
export const SEPARATOR = "\u00B7";

const formatElapsed = (seconds: number): string => {
  const value = Math.max(0, seconds);

  if (value < 45) return "just now";

  const minutes = Math.round(value / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.round(hours / 24);
  if (days <= 7) return `${days}d ago`;

  return new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(
    -Math.round(days / 7),
    "week",
  );
};

/**
 * Short distance in time, for a list row: "just now", "8m ago", "3h ago",
 * "2d ago", then "last week". Kept compact on purpose: a dense moderation list
 * gives the timestamp one narrow column.
 */
export const formatRelative = (
  value?: string | null,
  now: number = Date.now(),
): string => {
  if (!value) return "";

  const time = new Date(value).getTime();
  if (Number.isNaN(time)) return "";

  return formatElapsed((now - time) / 1000);
};

/**
 * The whole distance in words, for a detail pane where there is room for a
 * sentence: "5 minutes ago", "2 hours ago".
 */
export const formatRelativeLong = (
  value?: string | null,
  now: number = Date.now(),
): string => {
  if (!value) return "";

  const time = new Date(value).getTime();
  if (Number.isNaN(time)) return "";

  const seconds = Math.abs((now - time) / 1000);

  if (seconds < 45) return "just now";

  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["minute", 60],
    ["hour", 24],
    ["day", 7],
    ["week", 4.345],
    ["month", 12],
  ];

  let amount = seconds / 60;

  for (const [unit, limit] of units) {
    if (amount < limit) {
      return new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(
        -Math.round(amount),
        unit,
      );
    }
    amount = amount / limit;
  }

  return new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(
    -Math.round(amount),
    "year",
  );
};

export const formatExact = (value?: string | null): string => {
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

/** `datetime` for a <time> element, or undefined when the value is unusable. */
export const isoDate = (value?: string | null): string | undefined => {
  if (!value) return undefined;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
};

export const DAY_MS = 24 * 60 * 60 * 1000;

/** True for a timestamp inside the last `windowMs`. A broken date is not recent. */
export const isWithin = (
  value: string | undefined,
  windowMs: number,
  now: number = Date.now(),
): boolean => {
  if (!value) return false;

  const time = new Date(value).getTime();
  return !Number.isNaN(time) && now - time <= windowMs;
};

/** The first character of a name, for a text avatar. */
export const initialOf = (name?: string | null): string => {
  const trimmed = (name || "").trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() : "?";
};

export const numberOr = (value: unknown, fallback: number): number =>
  typeof value === "number" && Number.isFinite(value) ? value : fallback;

/**
 * Addresses from the contact form go straight into a `mailto:` and a
 * clipboard action, so anything that is not a plain address is dropped rather
 * than encoded into a link.
 */
const EMAIL_PATTERN =
  /^[^\s<>"'`,;:()[\]]+@[^\s<>"'`,;:()[\]]+\.[^\s<>"'`,;:()[\]]+$/;

export const safeEmail = (value?: string): string | null => {
  const email = value?.trim();
  if (!email || email.length > 254) return null;
  return EMAIL_PATTERN.test(email) ? email : null;
};

/** Build a reply link, prefilled and encoded. Returns null for an unsafe address. */
export const buildReplyLink = (email?: string, subject?: string) => {
  const address = safeEmail(email);
  if (!address) return null;

  const replySubject = `Re: ${(subject ?? "").replace(/[\r\n]+/g, " ").trim()}`;

  return `mailto:${address}?subject=${encodeURIComponent(replySubject)}`;
};

/** Whether a value can be a Mongo id, so a URL never carries garbage forward. */
export const isObjectId = (value?: string | null): value is string =>
  typeof value === "string" && /^[a-f\d]{24}$/i.test(value);
