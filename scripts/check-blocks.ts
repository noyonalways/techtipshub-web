// Round-trip check: stored HTML -> editor JSON -> stored HTML.
// Only `span` (Quill's cosmetic wrappers) may differ; <p>/<li> must not change.
import { generateHTML, generateJSON } from "@tiptap/html";
import {
  schemaExtensions,
  serializePostHTML,
} from "../src/components/editor/extensions.ts";

const BASE = process.env.BASE_API || "http://localhost:5000/api/v1";

const res = await fetch(`${BASE.replace(/\/$/, "")}/posts?limit=100`);
const json = (await res.json()) as { data: Array<{ slug: string; content: string }> };

const roundTrip = (html: string) =>
  serializePostHTML(generateHTML(generateJSON(html, schemaExtensions), schemaExtensions));

const countBlocks = (html: string) => {
  const tags = (name: string) =>
    (html.match(new RegExp(`<${name}(?=[\\s>])`, "gi")) || []).length;
  return {
    p: tags("p"),
    h: tags("h1") + tags("h2") + tags("h3") + tags("h4"),
    li: tags("li"),
    br: tags("br"),
    strong: tags("strong") + tags("b"),
    em: tags("em") + tags("i"),
    a: tags("a"),
    code: tags("code"),
    pre: tags("pre"),
    targetBlank: (html.match(/target=(\"_blank\"|'_blank')/g) || []).length,
  };
};

let exact = 0;
const rows: string[] = [];
const totals: Record<string, number> = {};

for (const post of json.data) {
  const before = post.content || "";
  const after = roundTrip(before);
  if (before.replace(/\s+/g, "") === after.replace(/\s+/g, "")) {
    exact++;
    continue;
  }
  const b = countBlocks(before);
  const a = countBlocks(after);
  const diffs = (Object.keys(b) as Array<keyof typeof b>)
    .filter((k) => b[k] !== a[k])
    .map((k) => `${k} ${b[k]}→${a[k]}`);
  for (const k of Object.keys(b) as Array<keyof typeof b>) {
    totals[k] = (totals[k] || 0) + (a[k] - b[k]);
  }
  rows.push(`${post.slug.slice(0, 50)}: ${diffs.join(", ") || "text/attr only"}`);
}

console.log(`posts: ${json.data.length}  exact: ${exact}  differing: ${rows.length}`);
for (const r of rows) console.log("  - " + r);
console.log("\nnet deltas:", JSON.stringify(totals));
