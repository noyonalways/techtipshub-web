"use client";

import { useCallback } from "react";
import EditorView from "./editor-view";
import Toolbar from "./toolbar";
import { useBlogEditor } from "./use-blog-editor";

interface IProps {
  value: string;
  onChange: (html: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  hasError?: boolean;
  /** Read-only posts still use the editor's typography, without a toolbar. */
  editable?: boolean;
}

/**
 * The blog composer.
 *
 * Writes the same HTML the site already stores, so it replaces the old editor
 * without touching the API or existing posts.
 */
const RichTextEditor = ({
  value,
  onChange,
  onBlur,
  hasError,
  editable = true,
}: IProps) => {
  const editor = useBlogEditor({ value, onChange, editable });

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
    <div onBlur={onBlur}>
      {editable && <Toolbar editor={editor} onOpenMenu={openMenu} />}
      <EditorView editor={editor} hasError={hasError} />
    </div>
  );
};

export default RichTextEditor;
