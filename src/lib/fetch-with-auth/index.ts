import { cookies } from "next/headers";

const ACCESS_TOKEN_COOKIE = "tth_access_token";
const REFRESH_TOKEN_COOKIE = "tth_refresh_token";

/**
 * The stored session tokens.
 *
 * Renewal itself happens in `src/proxy.ts`, before the request reaches a page,
 * because Next only lets cookies be written from a proxy, a route handler or a
 * server action — not from a page render. By the time a page reads these, an
 * expired access token has already been refreshed.
 */
export const getAccessToken = async (): Promise<string | undefined> =>
  (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;

export const getRefreshToken = async (): Promise<string | undefined> =>
  (await cookies()).get(REFRESH_TOKEN_COOKIE)?.value;

export { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE };
