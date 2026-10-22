"use client";

import type { Editor } from "@tiptap/core";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { filterSlashItems, slashItems } from "./slash-items";
import { clearSlashText, useSlashMenu } from "./slash-command";
import { registerSlashKeyHandler } from "./slash-keys";

interface IProps {
  editor: Editor | null;
}

export const SLASH_MENU_ID = "tth-slash-menu";

/**
 * The Notion-style "/" command menu.
 *
 * Rendered as a `fixed` element positioned from the caret's viewport
 * coordinates, so it stays attached to the text while the form scrolls.
 */
const SlashMenu = ({ editor }: IProps) => {
  const slash = useSlashMenu(editor);
  const listRef = useRef<HTMLDivElement>(null);

  const items = useMemo(
    () => filterSlashItems(slashItems, slash.query),
    [slash.query],
  );

  // A new query resets the highlight to the first match. Tracking the query the
  // highlight belongs to (and adjusting during render, as React recommends for
  // derived state) avoids an effect that would re-render with a stale row.
  const [selection, setSelection] = useState<{
    query: string;
    index: number;
  }>({ query: slash.query, index: 0 });
  let selected = selection.index;
  if (selection.query !== slash.query) {
    selected = 0;
    setSelection({ query: slash.query, index: 0 });
  }
  const setSelected = useCallback(
    (next: number | ((current: number) => number)) => {
      setSelection((current) => {
        const value =
          typeof next === "function" ? next(current.index) : next;
        return { query: slash.query, index: value };
      });
    },
    [slash.query],
  );

  // Keep the highlighted row visible in a long list.
  useLayoutEffect(() => {
    listRef.current
      ?.querySelector('[data-selected="true"]')
      ?.scrollIntoView({ block: "nearest" });
  }, [selected, items.length]);

  const run = useCallback(
    (index: number) => {
      if (!editor || !slash.open) return;
      const item = items[index];
      if (!item) return;
      clearSlashText(editor, slash.range);
      item.run(editor);
    },
    [editor, items, slash.open, slash.range],
  );

  /**
   * Arrow keys, Enter and Escape drive the menu from inside the editor.
   *
   * The keystrokes happen in ProseMirror, so the handler is registered with
   * the `SlashKeys` plugin, which calls it from `handleKeyDown`.
   */
  const itemsLength = items.length;
  const menuOpen = slash.open;
  useEffect(() => {
    if (!editor || !menuOpen) return;

    const handler = (event: KeyboardEvent) => {
      if (!itemsLength) return false;

      switch (event.key) {
        case "ArrowDown":
          setSelected((i) => (i + 1) % itemsLength);
          return true;
        case "ArrowUp":
          setSelected((i) => (i - 1 + itemsLength) % itemsLength);
          return true;
        case "Enter":
        case "Tab":
          run(selected);
          return true;
        case "Escape":
          // Hide the menu but keep what was typed.
          editor.view.dispatch(editor.state.tr.setMeta("slash:close", true));
          return true;
        default:
          return false;
      }
    };

    return registerSlashKeyHandler(editor.view, handler);
  }, [editor, itemsLength, menuOpen, run, selected, setSelected]);

  if (!editor || !slash.open) return null;

  const coords = editor.view.coordsAtPos(slash.range.to);
  const empty = items.length === 0;

  return (
    <div
      className="fixed z-50 w-72 max-h-80 overflow-hidden rounded-lg border border-default-200 bg-content1 shadow-2xl"
      style={{ left: coords.left, top: coords.bottom + 8 }}
      // Prevent the editor from losing focus when a row is clicked.
      onMouseDown={(event) => event.preventDefault()}
      role="listbox"
      aria-label="Insert block"
    >
      {empty ? (
        <p className="px-4 py-3 text-sm text-default-500">No matching blocks</p>
      ) : (
        <div ref={listRef} className="max-h-80 overflow-y-auto py-1">
          {items.map((item, index) => {
            const Icon = item.icon;
            const active = index === selected;
            return (
              <button
                key={item.title}
                type="button"
                data-selected={active}
                onMouseEnter={() => setSelected(index)}
                onClick={() => run(index)}
                className={`flex w-full items-center gap-3 px-3 py-2 text-left ${
                  active ? "bg-default-100" : ""
                }`}
                role="option"
                aria-selected={active}
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-md border border-default-200 bg-content2 text-default-600">
                  <Icon className="size-4" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-foreground">
                    {item.title}
                  </span>
                  <span className="block truncate text-xs text-default-500">
                    {item.hint}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SlashMenu;
