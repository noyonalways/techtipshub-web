const ACCESS_TOKEN_COOKIE = "tth_access_token";
const REFRESH_TOKEN_COOKIE = "tth_refresh_token";

/**
 * The stored session tokens.
 *
 * `next/headers` is only available in a server component, a route handler or a
 * server action. Client bundles import the helpers below (the axios instance
 * does), so the import is resolved at call time and the helpers answer
 * `undefined` in the browser instead of pulling the server module into the
 * client build.
 */
const readCookie = async (name: string): Promise<string | undefined> => {
  if (typeof window !== "undefined") return undefined;

  try {
    const { cookies } = await import("next/headers");
    return (await cookies()).get(name)?.value;
  } catch {
    return undefined;
  }
};

/**
 * Renewal itself happens in `src/proxy.ts`, before the request reaches a page,
 * because Next only lets cookies be written from a proxy, a route handler or a
 * server action — not from a page render. By the time a page reads these, an
 * expired access token has already been refreshed.
 */
export const getAccessToken = (): Promise<string | undefined> =>
  readCookie(ACCESS_TOKEN_COOKIE);

export const getRefreshToken = (): Promise<string | undefined> =>
  readCookie(REFRESH_TOKEN_COOKIE);

export { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE };
