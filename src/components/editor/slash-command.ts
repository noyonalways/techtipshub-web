"use client";

import { Extension, type ChainedCommands, type Editor, type Range } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import { useEffect, useState } from "react";

/**
 * The Notion-style "/" menu.
 *
 * Built directly on a ProseMirror plugin rather than `@tiptap/suggestion`: the
 * menu only needs to open on a "/" at the start of an empty block and close as
 * soon as the text stops matching, so the trigger, the query and the range all
 * live in one small piece of state.
 */

export interface SlashState {
  open: boolean;
  /** Query typed after the "/". */
  query: string;
  /** Range covering the "/query" text. */
  range: Range;
}

const EMPTY: SlashState = { open: false, query: "", range: { from: 0, to: 0 } };

const slashKey = new PluginKey<SlashState>("slashMenu");

/** Text that may follow "/" and still be a command query. */
const QUERY_RE = /^\/([\w:-]*)$/;

export const SlashCommand = Extension.create({
  name: "slashCommand",

  addProseMirrorPlugins() {
    return [
      new Plugin<SlashState>({
        key: slashKey,

        state: {
          init: () => EMPTY,

          apply(tr) {
            const { $from } = tr.selection;

            // Only a plain paragraph opens the menu; "/" in a heading or a
            // code block should just type a slash.
            if (!$from.parent.isTextblock || $from.parent.type.name !== "paragraph") {
              return EMPTY;
            }

            // A command only starts at the beginning of the block.
            if ($from.parentOffset === 0) return EMPTY;

            const text = $from.parent.textBetween(0, $from.parentOffset, undefined, "\ufffc");
            const match = QUERY_RE.exec(text);
            if (!match) return EMPTY;

            const from = $from.start();
            return { open: true, query: match[1], range: { from, to: $from.pos } };
          },
        },

        props: {
          decorations(state) {
            const slash = slashKey.getState(state);
            if (!slash?.open) return null;
            return DecorationSet.create(state.doc, [
              Decoration.inline(slash.range.from, slash.range.to, {
                class: "tth-slash-query",
              }),
            ]);
          },
        },
      }),
    ];
  },
});

/**
 * Deletes the "/query" text the menu was opened from, then applies the block.
 *
 * Both steps run as one chain so the document is never rendered in the
 * intermediate states that ProseMirror's trailing-node plugin reacts to.
 */
export const clearSlashText = (
  editor: Editor,
  range: Range,
  apply?: (chain: ChainedCommands) => ChainedCommands,
) => {
  const chain = apply?.(editor.chain().focus().deleteRange(range));
  (chain ?? editor.chain().focus().deleteRange(range)).run();
};

/**
 * Subscribes a component to the slash menu state.
 *
 * Tiptap re-renders on a document change, but the menu also has to react to
 * selection-only transactions (such as clicking away), hence the listener.
 */
export const useSlashMenu = (editor: Editor | null) => {
  const [state, setState] = useState<SlashState>(EMPTY);

  useEffect(() => {
    if (!editor) return;

    const update = () => {
      const next = slashKey.getState(editor.state) ?? EMPTY;
      setState((prev) =>
        prev.open === next.open &&
        prev.query === next.query &&
        prev.range.from === next.range.from &&
        prev.range.to === next.range.to
          ? prev
          : next,
      );
    };

    update();
    editor.on("transaction", update);
    return () => {
      editor.off("transaction", update);
    };
  }, [editor]);

  return state;
};
