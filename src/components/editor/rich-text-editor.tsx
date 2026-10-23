"use client";

import { useCallback, useEffect, useRef } from "react";
import EditorView from "./editor-view";
import Toolbar from "./toolbar";
import { useBlogEditor, getBlogHTML } from "./use-blog-editor";

export type BlogEditor = ReturnType<typeof useBlogEditor>;

/* -------------------------------------------------------------------------- */
/* Building blocks used by each composer layout                               */
/* -------------------------------------------------------------------------- */

/**
 * The toolbar with a working "insert block" button.
 *
 * The page decides where it sits (above a card, or sticky at the top of the
 * composer), but the "/" action belongs to the editor.
 */
export const EditorToolbar = ({
  editor,
  children,
}: {
  editor: BlogEditor;
  children?: React.ReactNode;
}) => {
  const openMenu = useCallback(() => {
    if (!editor) return;
    const { empty } = editor.state.selection;

    if (empty) {
      // Drop into a fresh block and start a command there.
      editor.chain().focus().splitBlock().insertContent("/").run();
      return;
    }

    editor.chain().focus().insertContent("/").run();
  }, [editor]);

  return (
    <Toolbar editor={editor} onOpenMenu={openMenu}>
      {children}
    </Toolbar>
  );
};

interface ISurfaceProps {
  editor: BlogEditor;
  hasError?: boolean;
  /** `surface` drops the inner card so the page provides the column. */
  variant?: "card" | "surface";
}

/** The writing area itself. */
export const EditorSurface = ({
  editor,
  hasError,
  variant = "surface",
}: ISurfaceProps) => (
  <EditorView editor={editor} hasError={hasError} variant={variant} />
);

/**
 * Creates the editor and keeps the form value in sync without re-creating it.
 *
 * `useBlogEditor` takes the value once (the initial content). When the value
 * changes from outside the editor — restoring a draft, or resetting after a
 * publish — the content is replaced too.
 */
export const useComposerEditor = ({
  value,
  onChange,
  editable,
}: {
  value: string;
  onChange: (html: string) => void;
  editable?: boolean;
}) => {
  const editor = useBlogEditor({ value, onChange, editable });
  const initial = useRef(value);

  useEffect(() => {
    if (!editor) return;
    if (value === initial.current) return;
    // Compare against what the editor reports, not its raw HTML: the two differ
    // for lists and quotes, and an unequal compare would reset the document the
    // editor just produced (losing the caret position).
    if (value === getBlogHTML(editor)) return;

    initial.current = value;
    editor.commands.setContent(value, { emitUpdate: false });
  }, [editor, value]);

  return editor;
};

/* -------------------------------------------------------------------------- */
/* Composer used by forms and modals                                          */
/* -------------------------------------------------------------------------- */

interface IProps {
  value: string;
  onChange: (html: string) => void;
  onBlur?: () => void;
  hasError?: boolean;
  /** Read-only blogs still use the editor's typography, without a toolbar. */
  editable?: boolean;
}

/**
 * The boxed editor with its own toolbar: update page and the admin modal.
 *
 * These callers already hold the content in form state, so the editor owns it
 * after mount and reports every change through `onChange`. Syncing back from
 * `value` is deliberately not done here — see `useComposerEditor` for the
 * composer, which needs it to restore drafts.
 */
const RichTextEditor = ({
  value,
  onChange,
  onBlur,
  hasError,
  editable = true,
}: IProps) => {
  const editor = useBlogEditor({ value, onChange, editable });

  return (
    <div onBlur={onBlur}>
      {editable && <EditorToolbar editor={editor} />}
      <EditorSurface editor={editor} hasError={hasError} variant="card" />
    </div>
  );
};

export default RichTextEditor;
