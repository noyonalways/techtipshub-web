"use client";

import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import type { EditorView } from "@tiptap/pm/view";

/**
 * Keyboard handling for the "/" menu.
 *
 * The menu lives in React and the keystrokes happen inside ProseMirror, so the
 * React side registers a handler here and this plugin forwards the events that
 * belong to the menu. Returning `true` stops ProseMirror from also acting on
 * them (which would, for example, insert a newline on Enter).
 */
export interface SlashKeyHandler {
  (event: KeyboardEvent): boolean;
}

const handlers = new WeakMap<EditorView, SlashKeyHandler>();

export const SlashKeys = Extension.create({
  name: "slashKeys",

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("slashKeys"),
        props: {
          handleKeyDown: (view, event) => handlers.get(view)?.(event) ?? false,
        },
      }),
    ];
  },
});

/** Called by the menu while it is open; returns an unsubscribe function. */
export const registerSlashKeyHandler = (
  view: EditorView,
  handler: SlashKeyHandler,
) => {
  handlers.set(view, handler);
  return () => {
    if (handlers.get(view) === handler) handlers.delete(view);
  };
};
