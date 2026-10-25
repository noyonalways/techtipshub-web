"use server";

import envConfig from "@/config/env.config";
import { readReaderSession, logAfterResponse } from "@/lib/reader-session";
import { decodeSlug } from "@/lib/slug";
import { after } from "next/server";

export interface ArticleAccessResult {
  /** Whether this request carries a session. */
  member: boolean;
  /**
   * Whether the body may be shown. Only a signed-in browser gets it: a crawler
   * has no session, and a request that is not a browser is not the person the
   * page is for.
   */
  canRead: boolean;
}

/** Where a view is recorded: the API's own counting route. */
const viewsUrl = (slug: string) =>
  `${envConfig.baseApi}/views/${encodeURIComponent(decodeSlug(slug))}`;

/**
 * Record one read of an article for this request's reader.
 *
 * The API keys a view by the session when the request carries one and by a
 * guest key otherwise, and it never counts authors or admins. Forwarding the
 * cookie is what lets it tell those apart; doing it from the server means the
 * token never reaches the browser twice.
 */
const recordView = async (slug: string, accessToken?: string) => {
  try {
    await fetch(viewsUrl(slug), {
      method: "POST",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { authorization: `Bearer ${accessToken}` } : {}),
      },
      body: "{}",
    });
  } catch (error) {
    logAfterResponse("article views", error);
  }
};

/**
 * The reader's own answer to "may I read this article".
 *
 * An article page is prerendered once and served from the CDN to everyone, so
 * it cannot ask who is reading while it is built. This action does instead: it
 * runs on the server inside the page the browser already holds, reads that
 * request's session cookie, and returns the answer. The page around it is not
 * re-rendered; only the small client component that calls this changes.
 *
 * The answer is the cookie read and nothing else. It used to wait on recording
 * the view, which is a round trip to the API: the browser showed the members
 * prompt for that whole time, after every cold load, to a reader who was
 * allowed in. Counting is not part of deciding what to show, so it is handed to
 * `after` and runs once the answer has been sent. Crawlers are still not
 * counted — they never reach the recording at all.
 */
export const resolveArticleAccess = async (
  slug: string,
): Promise<ArticleAccessResult> => {
  const session = await readReaderSession();

  if (!session.reader) {
    return { member: session.member, canRead: false };
  }

  const canRead = session.member;
  const accessToken = session.accessToken;

  after(() => recordView(slug, accessToken));

  return { member: session.member, canRead };
};
