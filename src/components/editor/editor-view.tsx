"use client";

import type { Editor } from "@tiptap/core";
import { EditorContent } from "@tiptap/react";
import SlashMenu from "./slash-menu";

interface IProps {
  editor: Editor | null;
  /** Marks the content as invalid, for form validation styling. */
  hasError?: boolean;
}

/**
 * Editor surface plus the "/" menu.
 *
 * The menu renders itself; it only needs the editor instance.
 */
const EditorView = ({ editor, hasError }: IProps) => (
  <div
    className={`tth-editor overflow-hidden rounded-lg border bg-content1 ${
      hasError ? "border-danger" : "border-default-200"
    } focus-within:border-default-400`}
  >
    <EditorContent editor={editor} className="tth-editor-content" />
    <SlashMenu editor={editor} />
  </div>
);

export default EditorView;
