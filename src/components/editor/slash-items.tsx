import type { ChainedCommands, Editor } from "@tiptap/core";
import {
  LuCode,
  LuHeading1,
  LuHeading2,
  LuHeading3,
  LuList,
  LuListOrdered,
  LuMinus,
  LuQuote,
  LuText,
  LuImage,
  LuLink,
} from "react-icons/lu";

/**
 * The block palette for the "/" menu.
 *
 * An entry either contributes a step to the menu's chain, or handles itself
 * when it needs to ask the writer something first (a URL, a dialog).
 */
export interface SlashItem {
  title: string;
  hint: string;
  keywords: string[];
  icon: React.ComponentType<{ className?: string }>;
  /**
   * Adds the block to an existing chain.
   *
   * It receives the chain that has already deleted the "/query" text, so the
   * deletion and the block change commit as one transaction — see
   * `clearSlashText` for why that matters.
   */
  chain?: (chain: ChainedCommands) => ChainedCommands;
  /** Runs the command itself, for entries that need input before acting. */
  run?: (editor: Editor) => void;
  /** Extra check used to highlight the active block. */
  isActive?: (editor: Editor) => boolean;
}

export const slashItems: SlashItem[] = [
  {
    title: "Text",
    hint: "Plain paragraph",
    keywords: ["text", "paragraph", "p"],
    icon: LuText,
    chain: (chain) => chain.setParagraph(),
    isActive: (editor) => editor.isActive("paragraph"),
  },
  {
    title: "Heading 1",
    hint: "Big section title",
    keywords: ["h1", "title", "heading"],
    icon: LuHeading1,
    chain: (chain) => chain.setHeading({ level: 1 }),
    isActive: (editor) => editor.isActive("heading", { level: 1 }),
  },
  {
    title: "Heading 2",
    hint: "Section heading",
    keywords: ["h2", "subtitle", "heading"],
    icon: LuHeading2,
    chain: (chain) => chain.setHeading({ level: 2 }),
    isActive: (editor) => editor.isActive("heading", { level: 2 }),
  },
  {
    title: "Heading 3",
    hint: "Small section heading",
    keywords: ["h3", "heading"],
    icon: LuHeading3,
    chain: (chain) => chain.setHeading({ level: 3 }),
    isActive: (editor) => editor.isActive("heading", { level: 3 }),
  },
  {
    title: "Bulleted list",
    hint: "Simple list",
    keywords: ["ul", "bullet", "unordered", "list"],
    icon: LuList,
    chain: (chain) => chain.toggleBulletList(),
    isActive: (editor) => editor.isActive("bulletList"),
  },
  {
    title: "Numbered list",
    hint: "List with numbers",
    keywords: ["ol", "ordered", "number", "list"],
    icon: LuListOrdered,
    chain: (chain) => chain.toggleOrderedList(),
    isActive: (editor) => editor.isActive("orderedList"),
  },
  {
    title: "Quote",
    hint: "Capture a quotation",
    keywords: ["blockquote", "quote", "citation"],
    icon: LuQuote,
    chain: (chain) => chain.toggleBlockquote(),
    isActive: (editor) => editor.isActive("blockquote"),
  },
  {
    title: "Code block",
    hint: "Code with syntax highlighting",
    keywords: ["code", "pre", "snippet", "```"],
    icon: LuCode,
    chain: (chain) => chain.toggleCodeBlock(),
    isActive: (editor) => editor.isActive("codeBlock"),
  },
  {
    title: "Divider",
    hint: "Visual separator",
    keywords: ["hr", "divider", "separator", "line", "---"],
    icon: LuMinus,
    chain: (chain) => chain.setHorizontalRule(),
  },
  {
    title: "Image from URL",
    hint: "Embed a hosted image",
    keywords: ["image", "img", "picture", "photo"],
    icon: LuImage,
    run: (editor) => {
      const url = window.prompt("Image URL");
      if (url) editor.chain().focus().setImage({ src: url }).run();
    },
    isActive: (editor) => editor.isActive("image"),
  },
  {
    title: "Link",
    hint: "Link the selected text",
    keywords: ["a", "link", "url", "href"],
    icon: LuLink,
    run: (editor) => {
      const previous = editor.getAttributes("link").href as string | undefined;
      const url = window.prompt("Link URL", previous ?? "https://");
      if (url === null) return;
      if (url === "") {
        editor.chain().focus().extendMarkRange("link").unsetLink().run();
        return;
      }
      editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    },
    isActive: (editor) => editor.isActive("link"),
  },
];

/** Filters the palette by the text typed after "/". */
export const filterSlashItems = (items: SlashItem[], query: string) => {
  const q = query.trim().toLowerCase();
  if (!q) return items;
  return items.filter(
    (item) =>
      item.title.toLowerCase().includes(q) ||
      item.keywords.some((keyword) => keyword.includes(q)),
  );
};
