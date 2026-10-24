import "server-only";

import { cookies, headers } from "next/headers";
import { after } from "next/server";
import { cache } from "react";

export const ACCESS_TOKEN_COOKIE = "tth_access_token";

/**
 * Whether the current request carries a session, and whether it is a reader at
 * all.
 *
 * Called from a Server Action, which runs on the server inside the page the
 * browser already has: the cookie is readable there without turning the page
 * into a per-request render. The answer is what decides whether an article's
 * body is shown, so it is computed in one place (`cache` keeps its callers in
 * one request from reading the headers twice).
 */
export interface ReaderSession {
  member: boolean;
  /** A browser (something that could be a person), rather than a crawler. */
  reader: boolean;
  /** The session token, when there is one. */
  accessToken?: string;
}

/**
 * User agents that never run the reader check.
 *
 * Only real crawlers are listed: a plain HTTP client (a health check, a
 * prefetch, a link unfurler without a bot name) is not trying to read an
 * article, but it also has no session, so it falls through to the guest answer
 * rather than needing to be caught here.
 */
const CRAWLER_PATTERN =
  /bot\b|bot\/|crawl|spider|slurp|\bba[iy]du\b|yandex|duckduck|facebookexternalhit|facebot|twitterbot|linkedinbot|embedly|pinterest|telegrambot|applebot|ia_archiver|google-?other|chrome-lighthouse|headlesschrome|phantomjs/i;

export const readReaderSession = cache(async (): Promise<ReaderSession> => {
  const [{ get }, requestHeaders] = await Promise.all([cookies(), headers()]);
  const accessToken = get(ACCESS_TOKEN_COOKIE)?.value;
  const userAgent = requestHeaders.get("user-agent") ?? "";

  return {
    member: Boolean(accessToken),
    reader: !CRAWLER_PATTERN.test(userAgent),
    accessToken,
  };
});

/** Log a server-side failure without failing the request that noticed it. */
export const logAfterResponse = (scope: string, error: unknown) => {
  after(() => {
    console.error(`[${scope}]`, error);
  });
};
