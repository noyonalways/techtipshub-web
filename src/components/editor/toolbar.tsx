"use client";

import type { Editor } from "@tiptap/core";
import { useEffect, useState } from "react";
import {
  LuBold,
  LuCode,
  LuEllipsis,
  LuItalic,
  LuLink,
  LuMinus,
  LuPilcrow,
  LuPlus,
  LuRedo,
  LuStrikethrough,
  LuUnderline,
  LuUndo,
} from "react-icons/lu";
import { slashItems } from "./slash-items";

interface IProps {
  editor: Editor | null;
  /** Opens the command palette. */
  onOpenMenu: () => void;
}

const ToolbarButton = ({
  label,
  active,
  disabled,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    title={label}
    aria-label={label}
    aria-pressed={active}
    disabled={disabled}
    onMouseDown={(event) => event.preventDefault()}
    onClick={onClick}
    className={`flex size-8 items-center justify-center rounded-md transition-colors ${
      active
        ? "bg-default-200 text-foreground"
        : "text-default-600 hover:bg-default-100 hover:text-foreground"
    } disabled:opacity-40`}
  >
    {children}
  </button>
);

/** Applies the block menu action for the current block type. */
const BlockStyleMenu = ({ editor }: { editor: Editor | null }) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);

  const active = slashItems.find((item) => item.isActive?.(editor!));
  const ActiveIcon = active?.icon ?? LuPilcrow;

  return (
    <div className="relative">
      <ToolbarButton
        label="Block style"
        onClick={(event) => {
          event.stopPropagation();
          setOpen((v) => !v);
        }}
      >
        <ActiveIcon className="size-4" />
        <LuEllipsis className="size-3" />
      </ToolbarButton>
      {open && (
        <div
          className="absolute left-0 top-9 z-20 w-56 overflow-hidden rounded-lg border border-default-200 bg-content1 p-1 shadow-xl"
          onPointerDown={(event) => event.stopPropagation()}
        >
          {slashItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.isActive?.(editor!) ?? false;
            return (
              <button
                key={item.title}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  item.run(editor!);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm ${
                  isActive
                    ? "bg-default-100 text-foreground"
                    : "text-default-600 hover:bg-default-100"
                }`}
              >
                <Icon className="size-4 shrink-0" />
                {item.title}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

/**
 * Editor toolbar.
 *
 * Deliberately small: the "/" menu and markdown shortcuts carry the block
 * commands, so the toolbar only needs the inline formatting people reach for
 * constantly.
 */
const Toolbar = ({ editor, onOpenMenu }: IProps) => {
  if (!editor) return null;

  const chain = () => editor.chain().focus();

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-default-200 px-2 py-1.5">
      <ToolbarButton label="Insert block" onClick={onOpenMenu}>
        <LuPlus className="size-4" />
      </ToolbarButton>

      <BlockStyleMenu editor={editor} />

      <span className="mx-1 h-5 w-px bg-default-200" />

      <ToolbarButton
        label="Bold"
        active={editor.isActive("bold")}
        onClick={() => chain().toggleBold().run()}
      >
        <LuBold className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Italic"
        active={editor.isActive("italic")}
        onClick={() => chain().toggleItalic().run()}
      >
        <LuItalic className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Underline"
        active={editor.isActive("underline")}
        onClick={() => chain().toggleUnderline().run()}
      >
        <LuUnderline className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Strikethrough"
        active={editor.isActive("strike")}
        onClick={() => chain().toggleStrike().run()}
      >
        <LuStrikethrough className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Inline code"
        active={editor.isActive("code")}
        onClick={() => chain().toggleCode().run()}
      >
        <LuCode className="size-4" />
      </ToolbarButton>

      <span className="mx-1 h-5 w-px bg-default-200" />

      <ToolbarButton
        label={editor.isActive("link") ? "Edit link" : "Add link"}
        active={editor.isActive("link")}
        onClick={() => slashItems.find((item) => item.title === "Link")!.run(editor)}
      >
        <LuLink className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Divider"
        onClick={() => chain().setHorizontalRule().run()}
      >
        <LuMinus className="size-4" />
      </ToolbarButton>

      <span className="ml-auto flex items-center gap-1">
        <ToolbarButton
          label="Undo"
          disabled={!editor.can().undo()}
          onClick={() => chain().undo().run()}
        >
          <LuUndo className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Redo"
          disabled={!editor.can().redo()}
          onClick={() => chain().redo().run()}
        >
          <LuRedo className="size-4" />
        </ToolbarButton>
      </span>
    </div>
  );
};

export default Toolbar;
