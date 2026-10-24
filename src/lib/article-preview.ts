import { splitAfterIntro } from "@/components/modules/blog/split-article-intro";

/**
 * How much of an article a visitor without a session is shown, server-side.
 *
 * This is the copy search engines and link unfurls read (`?view=preview`), so
 * it has to be a real part of the article rather than a teaser sentence. It is
 * cut exactly where the member reading experience cuts the body for its
 * in-article ad: after the opening paragraph. An article whose body has no safe
 * paragraph to cut after shows its opening words instead.
 *
 * Runs at build and render time only, never in the browser.
 */

/** Words shown when the body has no paragraph to cut after. */
const FALLBACK_PREVIEW_WORDS = 120;

const VOID_ELEMENTS = /^(area|base|br|col|embed|hr|img|input|link|meta|source|track|wbr)$/;

/**
 * The first `words` words of a body, as HTML, with every tag it opened closed.
 *
 * The cut is pushed back to the end of the last whole word, so the result is
 * never half a tag or half an attribute — word tokens are matched outside
 * tags. The opening elements still in effect at the cut are closed in reverse
 * order, so the snippet stays valid even when the article opens with a list, a
 * quote or a table.
 */
const firstWords = (html: string, words: number): string => {
  const tokens = /<[^>]*>|[^\s<]+/g;
  const open: string[] = [];
  let seen = 0;
  let end = html.length;
  let match: RegExpExecArray | null;

  while ((match = tokens.exec(html)) !== null) {
    const token = match[0];

    if (token.startsWith("<")) {
      const name = /^<\/?([a-zA-Z][a-zA-Z0-9-]*)/.exec(token)?.[1]?.toLowerCase();
      if (!name) continue;

      if (token[1] === "/") {
        const index = open.lastIndexOf(name);
        if (index !== -1) open.length = index;
      } else if (!token.endsWith("/>") && !VOID_ELEMENTS.test(name)) {
        open.push(name);
      }
      continue;
    }

    seen += 1;
    if (seen > words) {
      // The word that overran the budget is the first one left out.
      end = match.index;
      break;
    }
  }

  const closers = open
    .slice()
    .reverse()
    .map((name) => `</${name}>`)
    .join("");

  return `${html.slice(0, end).trimEnd()}${closers}`;
};

export const articlePreviewHtml = (
  html?: string,
  words = FALLBACK_PREVIEW_WORDS,
) => {
  if (!html) return "";

  const intro = splitAfterIntro(html)?.[0];
  if (intro?.trim()) return intro;

  return firstWords(html, words);
};
