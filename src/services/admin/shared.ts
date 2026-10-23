import axios from "axios";
import type { IPaginationMeta } from "@/types/admin.type";

/**
 * Helpers shared by the admin services.
 *
 * Two habits live here. First, a list answer is read defensively: the API
 * changes shape between endpoints (`data` as an array, `data.result`, a bare
 * array with top-level `meta`), so every reader checks each spot before giving
 * up. Second, a failed request throws with the API's own message instead of
 * resolving to the error body — a table then shows an error state, and a 404
 * for an endpoint the API has not shipped yet cannot be mistaken for "no rows".
 */

/** `undefined` and `""` are left out of a query string; other values survive. */
export const cleanParams = (
  params: object | undefined,
): Record<string, string> => {
  const out: Record<string, string> = {};
  if (!params) return out;

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    out[key] = String(value);
  }

  return out;
};

/** "All" is the absence of a filter, not a value the API knows. */
export const cleanFilter = (
  params: object | undefined,
): Record<string, string> =>
  cleanParams(
    Object.fromEntries(
      Object.entries(params ?? {}).filter(
        ([, value]) => value !== "all" && value !== "none",
      ),
    ),
  );

const messageOf = (body: unknown): string | undefined => {
  const payload = body as
    { message?: unknown; errorSources?: { message?: unknown }[] } | undefined;

  const first = payload?.errorSources?.[0]?.message;
  if (typeof first === "string" && first) return first;
  if (typeof payload?.message === "string" && payload.message) {
    return payload.message;
  }

  return undefined;
};

/**
 * Re-throws a request failure as an `Error` carrying the API's message.
 *
 * The error body is kept on `.body`, so a caller that wants the `success:
 * false` payload can still read it.
 */
export const toServiceError = (error: unknown, fallback: string): Error => {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return new Error(
        error.code === "ECONNABORTED"
          ? "The request took too long. Try again."
          : "The server could not be reached.",
      );
    }

    const wrapped = new Error(messageOf(error.response.data) ?? fallback);
    (wrapped as Error & { body?: unknown; status?: number }).body =
      error.response.data;
    (wrapped as Error & { body?: unknown; status?: number }).status =
      error.response.status;
    return wrapped;
  }

  return error instanceof Error ? error : new Error(fallback);
};

export const isSuccessful = (body: unknown) =>
  Boolean(body) && (body as { success?: boolean }).success !== false;

const asPositiveInt = (value: unknown): number | undefined => {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : undefined;
};

/** Reads `meta` from wherever the endpoint put it; fills gaps from `page`. */
export const readMeta = (
  payload: unknown,
  rows = 0,
  requestedPage?: number,
  requestedLimit?: number,
): IPaginationMeta => {
  const body = payload as
    | {
        meta?: Record<string, unknown>;
        total?: unknown;
        page?: unknown;
        limit?: unknown;
        totalPages?: unknown;
        data?: { meta?: Record<string, unknown> };
      }
    | undefined;

  const meta = body?.meta ?? body?.data?.meta ?? {};

  const page = asPositiveInt(meta.page ?? body?.page) ?? requestedPage ?? 1;
  const limit =
    asPositiveInt(meta.limit ?? body?.limit) ?? requestedLimit ?? rows;
  const total =
    asPositiveInt(meta.total ?? body?.total) ??
    (rows === 0 ? 0 : (requestedPage ?? 1) * Math.max(limit, 1));
  const totalPages =
    asPositiveInt(meta.totalPages ?? body?.totalPages) ??
    (limit > 0 ? Math.max(1, Math.ceil(total / limit)) : total > 0 ? 1 : 0);

  return { page, limit, total, totalPages };
};

/**
 * The rows of a list answer, wherever the endpoint put them: a bare array, the
 * body itself, `data`, `data.result` (in that order).
 */
export const readRows = <T>(payload: unknown): T[] => {
  if (Array.isArray(payload)) return payload as T[];

  const body = payload as { data?: unknown; result?: unknown } | undefined;

  const data = body?.data;
  const nested = data as { result?: unknown } | undefined;

  if (Array.isArray(data)) return data as T[];
  if (Array.isArray(nested?.result)) return nested!.result as T[];
  if (Array.isArray(body?.result)) return body!.result as T[];

  return [];
};

/** Parses `{ success, data: T }`, throwing when `success` is false. */
export const readData = (payload: unknown, fallback: string) => {
  if (!isSuccessful(payload)) {
    throw new Error(messageOf(payload) ?? fallback);
  }

  return (payload as { data?: unknown }).data;
};
