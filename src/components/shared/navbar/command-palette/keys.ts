"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/**
 * What a palette result can be.
 *
 * Keeping the kind on the item - instead of deriving it from the href - is
 * what lets Enter do the right thing: a theme entry runs a command, an
 * article navigates. `groups` is the grouping used in the rendered list.
 */
export type CommandKind = "article" | "category" | "profile" | "page" | "action";

export interface CommandTarget {
  /** Unique per palette session; the list keys and the active index point at it. */
  id: string;
  kind: CommandKind;
  label: string;
  /** One line of context under the label. Optional: not every row needs one. */
  detail?: string;
  href?: string;
  run?: () => void;
  /** Matched ranges from `fuzzyScore`, for emphasis. Absent means no emphasis. */
  ranges?: Array<[number, number]>;
  /** Extra words matched without being shown, so "dark mode" finds "Switch to dark". */
  keywords?: string;
}

export interface CommandGroup {
  id: string;
  label: string;
  items: CommandTarget[];
}

const flatten = (groups: CommandGroup[]) => groups.flatMap((group) => group.items);

/**
 * Roving selection over a grouped list.
 *
 * The active row is tracked by id rather than by a flat index, so a result
 * arriving from the network cannot silently move the highlight onto a
 * different item than the one Enter would run a second earlier. When the
 * active id disappears, the first row of the first group takes the highlight.
 */
export const useRovingSelection = (groups: CommandGroup[]) => {
  const [chosenId, setActiveId] = useState<string | null>(null);
  const items = useMemo(() => flatten(groups), [groups]);

  // A highlight needs a selection, not just a list. The chosen row wins while
  // it is still in the list; otherwise the first row stands in, so the row
  // Enter runs is always the row that looks active - never a first item Enter
  // reaches while nothing is marked as active.
  const chosen = items.find((item) => item.id === chosenId);
  const active = chosen ?? items[0] ?? null;
  const activeIndex = active ? items.indexOf(active) : -1;

  const move = useCallback(
    (step: 1 | -1) => {
      if (items.length === 0) return;
      const next = (activeIndex + step + items.length) % items.length;
      setActiveId(items[next].id);
    },
    [activeIndex, items],
  );

  const moveToEdge = useCallback(
    (edge: "first" | "last") => {
      if (items.length === 0) return;
      setActiveId(items[edge === "first" ? 0 : items.length - 1].id);
    },
    [items],
  );

  return {
    items,
    active,
    activeIndex,
    setActiveId,
    move,
    moveToEdge,
  };
};

/**
 * One `keydown` handler for the whole palette, rather than a listener per
 * row: a list whose length changes while it is focused keeps working.
 *
 * `Enter` runs the active row, arrows walk the list, `Escape` closes.
 * `Home`/`End` jump to the edges only while the field is empty and has no
 * caret to move. Backspace in an empty field at the start of the line closes
 * the palette.
 */
export const usePaletteKeys = ({
  inputRef,
  onEscape,
  onMove,
  onEdge,
  onRun,
}: {
  inputRef: React.RefObject<HTMLInputElement | null>;
  onEscape: () => void;
  onMove: (step: 1 | -1) => void;
  onEdge: (edge: "first" | "last") => void;
  onRun: () => void;
}) => {
  // The handler is attached once to the dialog, so it reads the latest
  // callbacks through a ref instead of being rebuilt on every keystroke.
  const handlers = useRef({ onEscape, onMove, onEdge, onRun });
  handlers.current = { onEscape, onMove, onEdge, onRun };

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      const h = handlers.current;
      const input = inputRef.current;
      const onInput = !!input && event.target === input;
      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          h.onMove(1);
          return;
        case "ArrowUp":
          event.preventDefault();
          h.onMove(-1);
          return;
        case "Home":
          // Home and End belong to the caret while there is text to move it
          // through; only an empty field hands them to the list.
          if (!onInput || !input?.value) return;
          event.preventDefault();
          h.onEdge("first");
          return;
        case "End":
          if (!onInput || !input?.value) return;
          event.preventDefault();
          h.onEdge("last");
          return;
        case "Enter":
          event.preventDefault();
          h.onRun();
          return;
        case "Escape":
          event.preventDefault();
          h.onEscape();
          return;
        case "Backspace":
          if (!onInput || !input) return;
          if (input.value || (input.selectionStart ?? 0) !== 0) return;
          // Empty field, caret at the start: closing is what Backspace means here.
          event.preventDefault();
          h.onEscape();
          return;
        default:
      }
    },
    [inputRef],
  );

  return handleKeyDown;
};

/**
 * Calls `onOpen` for ⌘K / Ctrl+K anywhere on the page, except while the user
 * is typing into another field, where the browser's own shortcuts and the
 * field's text are what they mean. Also calls `onOpen` for `/` when no field
 * has focus.
 */
export const usePaletteHotkeys = (onOpen: () => void) => {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing =
        !!target &&
        (target.isContentEditable ||
          ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));

      const opensWithK =
        (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";
      const opensWithSlash = event.key === "/" && !typing;

      if (!opensWithK && !opensWithSlash) return;
      event.preventDefault();
      onOpen();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onOpen]);
};
