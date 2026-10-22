import { Extension } from "@tiptap/core";
import { Plugin } from "@tiptap/pm/state";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { Code } from "@tiptap/extension-code";
import { Bold } from "@tiptap/extension-bold";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import { Placeholder } from "@tiptap/extensions";
import StarterKit from "@tiptap/starter-kit";
import { common, createLowlight } from "lowlight";

/**
 * Editor extensions shared by the composer and the read-only renderer.
 *
 * Posts are stored as HTML, so the schema here is also the contract for how
 * existing (Quill-era) posts are normalised. Anything this file gets wrong is a
 * silent edit to content people have already published, which is why the tight
 * list handling below exists at all.
 */

/** lowlight/highlight.js for fenced code blocks (```js ... ```). */
const lowlight = createLowlight(common);

/**
 * Links from the old editor were saved as
 * `<a href="..." rel="noopener noreferrer" target="_blank">`. Tiptap drops
 * `target` unless it is declared, which would silently retarget every existing
 * outbound link into the same tab on the next save.
 */
const LinkWithTarget = Link.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      target: {
        default: null,
        parseHTML: (element) => element.getAttribute("target"),
        renderHTML: (attributes) =>
          attributes.target ? { target: attributes.target } : {},
      },
    };
  },
});

/** Images carry `alt`; missing alt text hurts accessibility and SEO. */
const ImageWithAlt = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      alt: {
        default: null,
        parseHTML: (element) => element.getAttribute("alt"),
        renderHTML: (attributes) =>
          attributes.alt ? { alt: attributes.alt } : {},
      },
    };
  },
});

/**
 * Tutorials written in the old editor use bare inline `<code>`. Tiptap's code
 * block claims every `<code>` element, which would turn a word inside a
 * sentence into a full-width block. Only `<code>` inside `<pre>` is a block
 * (that is also the HTML spec's rule); anything else is inline code.
 *
 * The `tag` is required, but by default it would also wrap every text node it
 * parses into code. `getAttrs` returns `null` (match, no attributes) for real
 * `<code>` elements and `false` for anything else.
 */
const InlineCode = Code.extend({
  parseHTML() {
    return [
      {
        tag: "code",
        getAttrs: (node) =>
          typeof node === "string"
            ? false
            : (node as HTMLElement).closest("pre")
              ? false
              : null,
      },
    ];
  },
});

/**
 * Tight lists.
 *
 * Every existing post was written as a tight list (`<li>text</li>`), and the
 * site styles `<li>` and `<p>` differently. Tiptap's listItem requires a
 * paragraph child, so an unmodified save emits `<li><p>text</p></li>` — +270
 * paragraphs across current posts — and visibly changes every list on the site.
 *
 * The paragraph stays a real `<p>` in the DOM: the caret, native typing and the
 * browser's block handling all depend on real block elements (inline spans put
 * consecutive paragraphs on one line and made typed text land in the wrong
 * block). Only the saved HTML unwraps it, below.
 */

/**
 * Rewrites saved HTML so list items and single-paragraph quotes stay in the
 * tight form the posts were authored in: `<li>text</li>`, not
 * `<li><p>text</p></li>`.
 *
 * Only a paragraph that is the item's own first child is unwrapped; anything
 * after it (a nested list, a second paragraph) keeps its `<p>`, which is what
 * HTML requires.
 */
export const listItemsTight = (html: string) =>
  html
    .replace(
      /<li>(\s*)<p>((?:(?!<p>)[\s\S])*?)<\/p>/g,
      (_, space: string, inner: string) => `<li>${space}${inner}`,
    )
    .replace(
      /<blockquote>(\s*)<p>((?:(?!<p>)[\s\S])*?)<\/p>/g,
      (_, space: string, inner: string) => `<blockquote>${space}${inner}`,
    );

/** Serialises the composer's HTML into the stored format. */
export const serializePostHTML = (html: string) => listItemsTight(html);

/**
 * Notion-style shortcuts beyond what StarterKit ships: `--- ` → horizontal rule.
 * StarterKit already covers `# ` → heading, `> ` → quote, `- ` → list and ```.
 */
const MarkdownShortcuts = Extension.create({
  name: "markdownShortcuts",

  addProseMirrorPlugins() {
    return [
      new Plugin({
        props: {
          handleTextInput: (view, from, _to, text) => {
            if (text !== " ") return false;

            const { state } = view;
            const { $from } = state.selection;
            if (!$from.parent.isTextblock) return false;

            const lineText = $from.parent.textBetween(
              0,
              $from.parentOffset,
              undefined,
              "\ufffc",
            );
            if (lineText !== "---") return false;

            const start = from - 3;
            view.dispatch(
              state.tr
                .delete(start, from)
                .replaceWith(
                  start,
                  start,
                  state.schema.nodes.horizontalRule.create(),
                ),
            );
            return true;
          },
        },
      }),
    ];
  },
});

/**
 * Headings from the old editor carry `class="ql-align-center"` (Quill's
 * alignment). TextAlign only reads inline `text-align` styles, so without this
 * the alignment is silently dropped when a post is next saved.
 *
 * Only the three non-default alignments are recognised: left alignment is the
 * default, and treating `ql-align-left` as an attribute would add
 * `style="text-align: left"` to posts that do not have it today.
 */
const AlignWithLegacyClasses = TextAlign.configure({ types: ["heading", "paragraph"] }).extend({
  addGlobalAttributes() {
    return (this.parent?.() ?? []).map((attributeSet) => ({
      ...attributeSet,
      attributes: {
        ...attributeSet.attributes,
        textAlign: {
          ...(attributeSet.attributes.textAlign as Record<string, unknown>),
          default: null,
          parseHTML: (element: HTMLElement) => {
            const match = /ql-align-(center|right|justify)/.exec(
              element.getAttribute("class") || "",
            );
            if (match) return match[1];

            const style = element.style.textAlign;
            return ["center", "right", "justify"].includes(style)
              ? style
              : null;
          },
        },
      },
    }));
  },
});

/**
 * Quill legacy: bold sometimes landed in
 * `<span style="color: var(--tw-prose-bold)">` instead of `<strong>`.
 * The span carries no style the site needs — only the weight — so map it to
 * the bold mark. Without this the text silently loses its emphasis when the
 * post is saved from the new editor.
 */
const LegacyBoldSpan = Bold.extend({
  parseHTML() {
    const own = Array.isArray(this.parent?.())
      ? (this.parent?.() as unknown[])
      : [];
    return [
      ...own,
      {
        tag: "span[style]",
        getAttrs: (element) =>
          /--tw-prose-bold/.test((element as HTMLElement).getAttribute("style") || "")
            ? null
            : false,
      },
    ] as ReturnType<NonNullable<typeof Bold.config.parseHTML>>;
  },
});

/**
 * Everything that defines the document schema and its HTML representation.
 *
 * Kept separate from the interactive extensions below so this list can be used
 * outside the browser (the round-trip verification scripts) without pulling in
 * React UI or ProseMirror plugins.
 */
export const schemaExtensions = [
  StarterKit.configure({
    // Replaced by CodeBlockLowlight below for syntax highlighting.
    codeBlock: false,
    // Replaced by InlineCode below so sentence-embedded code stays inline.
    code: false,
    // Replaced by LinkWithTarget below so `target` is preserved.
    link: false,
    // Replaced by LegacyBoldSpan below so Quill's bold spans stay bold.
    bold: false,
  }),
  CodeBlockLowlight.configure({ lowlight }),
  InlineCode,
  LegacyBoldSpan,
  LinkWithTarget.configure({
    openOnClick: false,
    autolink: true,
    HTMLAttributes: { rel: "noopener noreferrer nofollow" },
  }),
  ImageWithAlt.configure({ inline: false, allowBase64: true }),
  AlignWithLegacyClasses,
  Placeholder.configure({
    placeholder: ({ node }) =>
      node.type.name === "heading"
        ? "Heading"
        : "Write something, or type '/' for commands…",
  }),
  MarkdownShortcuts,
];
