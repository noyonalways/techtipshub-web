/**
 * Splits a blog body after its opening paragraph so an in-article ad can sit
 * between the intro and the rest of the story.
 *
 * This is not a DOM parse. It walks the tags once, keeping a stack, and only
 * cuts after a `</p>` that closes a paragraph opened at depth 0. That means a
 * paragraph nested in a blockquote, list item or div can never split the body,
 * and both halves always carry balanced tags of their own.
 *
 * Returns `null` when there is no safe cut point (a body that opens with a
 * heading, a single paragraph, plain text): the caller then renders the body in
 * one piece and places the ad after it.
 */
export const splitAfterIntro = (html?: string): [string, string] | null => {
  if (!html) return null;

  const tags = /<(\/?)([a-zA-Z][a-zA-Z0-9-]*)(?:[^>"']|"[^"]*"|'[^']*')*?(\/?)>/g;
  const voidTags = new Set([
    "area",
    "base",
    "br",
    "col",
    "embed",
    "hr",
    "img",
    "input",
    "link",
    "meta",
    "source",
    "track",
    "wbr",
  ]);

  const stack: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = tags.exec(html)) !== null) {
    const closing = match[1] === "/";
    const name = match[2].toLowerCase();
    const selfClosing = match[3] === "/" || voidTags.has(name);

    if (closing) {
      if (name === "p" && stack.length === 1 && stack[0] === "p") {
        const cut = match.index + match[0].length;
        const rest = html.slice(cut);
        // An empty remainder means the paragraph was the whole body; leave the
        // body intact and let the caller place the ad after it.
        if (!rest.trim()) return null;
        return [html.slice(0, cut), rest];
      }
      const open = stack.lastIndexOf(name);
      if (open !== -1) stack.length = open;
      continue;
    }

    if (!selfClosing) stack.push(name);
  }

  return null;
};
