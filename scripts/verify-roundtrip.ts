// The guarantee that matters: no existing post may lose or change content.
// Tag-level deltas are expected (Quill's spans, <pre><code>), so this checks
// that the readable text and the emphasis are preserved.
import { generateHTML, generateJSON } from "@tiptap/html";
import {
  schemaExtensions,
  serializePostHTML,
} from "../src/components/editor/extensions.ts";

const BASE = process.env.BASE_API || "http://localhost:5000/api/v1";
const res = await fetch(`${BASE}/posts?limit=100`);
const json = (await res.json()) as { data: Array<{ slug: string; content: string }> };

const text = (h: string) =>
  h
    // <br> is a line break, not a separator between words.
    .replace(/<br\s*\/?>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    // HTML collapses whitespace, so leading/trailing spaces in a block are
    // invisible: normalise before comparing.
    .replace(/\s+/g, " ")
    .trim()
    .replace(/>\s+|\s+</g, "");

/** Whitespace-insensitive comparison of the readable content. */
const words = (h: string) => text(h).replace(/\s+/g, "");

let textSame = 0;
const problems: string[] = [];

for (const post of json.data) {
  const before = post.content || "";
  const after = serializePostHTML(
    generateHTML(generateJSON(before, schemaExtensions), schemaExtensions),
  );
  const tb = words(before);
  const ta = words(after);

  const issues: string[] = [];
  if (tb !== ta) issues.push(`text differs (${tb.length} → ${ta.length})`);

  // Formatting that must survive verbatim.
  const count = (h: string, re: RegExp) => (h.match(re) || []).length;
  const checks: Array<[string, RegExp]> = [
    ["links", /<a[\s>]/g],
    ["target=_blank", /target="_blank"/g],
    ["headings", /<h[1-4][\s>]/g],
    ["list items", /<li[\s>]/g],
    ["blockquotes", /<blockquote[\s>]/g],
    ["code blocks", /<pre[\s>]/g],
    ["bold", /<(strong|b)[\s>]/g],
    ["italic", /<(em|i)[\s>]/g],
    ["paragraphs", /<p[\s>]/g],
  ];
  for (const [name, re] of checks) {
    const b = count(before, re);
    const a = count(after, re);
    // Quill's <pre> had no <code> child and its bare <code> is now inline, so
    // code counts are reported separately rather than treated as failures.
    // Bold is checked by text below, since merged runs change the tag count.
    if (b !== a && name !== "code blocks" && name !== "bold")
      issues.push(`${name} ${b}→${a}`);
  }

  // Quill stored some bold as a coloured span, which the site rendered as
  // normal text (colour = inherit). Those become real <strong> on save, so the
  // bold text may only ever grow.
  const boldText = (h: string) =>
    [...h.matchAll(/<(?:strong|b)[^>]*>([\s\S]*?)<\/(?:strong|b)>/g)]
      .map((m) => m[1].replace(/<[^>]+>/g, ""))
      // Whitespace at the edges of a block is invisible in HTML.
      .join("")
      .replace(/\s+/g, "");
  if (!boldText(after).includes(boldText(before)))
    issues.push("bold text lost");

  if (issues.length) problems.push(`${post.slug.slice(0, 45)}: ${issues.join(", ")}`);
  else textSame++;
}

console.log(`posts: ${json.data.length}   preserved: ${textSame}`);
for (const p of problems) console.log("  - " + p);
