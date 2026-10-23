/**
 * Matching for the search key palette.
 *
 * Two jobs, kept apart on purpose:
 *
 * - `fuzzyScore` orders static commands. They are known ahead of time, so the
 *   user can be typing a subsequence ("crb" for "Copy current page URL") and
 *   the palette should still find it.
 * - `matchesQuery` happens at the API. Splitting the query into words keeps
 *   "react hooks" from missing an article whose title has the two words in a
 *   different order. The API runs a plain case-insensitive regex over title,
 *   slug and body, so an empty or regex-breaking query is filtered out here.
 */

export interface Scored {
  score: number;
  ranges: Array<[number, number]>;
}

/** Bounds for the regex the API builds from our term, to keep it cheap. */
const MAX_TERM_LENGTH = 48;

/**
 * Expand a typed phrase into API-safe search terms.
 *
 * Returns `__ALL__` for an empty query so a caller can branch on "no query"
 * without a second check, and drops terms shorter than two characters that
 * would match nearly everything.
 */
export const ALL_TERMS = "__ALL__";

export const toSearchTerms = (query: string): string | typeof ALL_TERMS => {
  const words = query
    .replace(/[.*+?^${}()|[\]\\]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter((word) => word.length > 1)
    .map((word) => word.slice(0, MAX_TERM_LENGTH));

  if (words.length === 0) return ALL_TERMS;
  return words.join(" ");
};

/**
 * Does this value contain every word of the query, in any order?
 *
 * Mirrors the API's AND-of-terms rule on the client so the "nothing found"
 * state appears for the same input the server would return nothing for.
 */
export const matchesQuery = (value: string, query: string) => {
  const terms = toSearchTerms(query);
  if (terms === ALL_TERMS) return true;
  const haystack = value.toLowerCase();
  return terms
    .split(" ")
    .every((term) => haystack.includes(term.toLowerCase()));
};

const charScore = (candidate: string, query: string, index: number) =>
  candidate[index] === query[index]
    ? index === 0
      ? 3
      : 1
    : 0;

/**
 * Score a label against a query and return the matched character ranges.
 *
 * Higher is better. Substring hits beat scattered letters, and among
 * substrings a word start beats the middle of a word. The ranges feed the
 * `<mark>` emphasis, so a command that matched by subsequence still shows
 * which letters the user typed.
 */
export const fuzzyScore = (label: string, query: string): Scored => {
  const target = label.toLowerCase();
  const needle = query.toLowerCase().trim();
  if (!needle) return { score: 0, ranges: [] };

  const direct = target.indexOf(needle);
  if (direct !== -1) {
    const atWordStart =
      direct === 0 || /[\s/:-]/.test(target[direct - 1] ?? "");
    return {
      score: direct + (atWordStart ? 40 : 20) + needle.length,
      ranges: [[direct, direct + needle.length]],
    };
  }

  // Subsequence: every character of the query in order, not necessarily
  // adjacent. `charScore` rewards characters that line up with the query and
  // words that start a new segment.
  let cursor = 0;
  let score = 0;
  const ranges: Array<[number, number]> = [];

  for (let index = 0; index < target.length && cursor < needle.length; index++) {
    score += charScore(target, needle, cursor);
    if (target[index] !== needle[cursor]) continue;

    const previous = target[index - 1];
    if (index === 0 || /[\s/:-]/.test(previous)) score += 5;
    if (ranges.length && ranges[ranges.length - 1][1] === index) {
      ranges[ranges.length - 1][1] = index + 1;
    } else {
      ranges.push([index, index + 1]);
    }
    cursor++;
  }

  return cursor === needle.length ? { score, ranges } : { score: 0, ranges: [] };
};

/** Split a label into plain and `<mark>`-able segments for rendering. */
export const splitByRanges = (
  label: string,
  ranges: Array<[number, number]>,
): Array<{ text: string; match: boolean }> => {
  if (!ranges.length) return [{ text: label, match: false }];

  const parts: Array<{ text: string; match: boolean }> = [];
  let cursor = 0;
  for (const [start, end] of ranges) {
    if (start > cursor) parts.push({ text: label.slice(cursor, start), match: false });
    parts.push({ text: label.slice(start, end), match: true });
    cursor = end;
  }
  if (cursor < label.length) parts.push({ text: label.slice(cursor), match: false });
  return parts;
};
