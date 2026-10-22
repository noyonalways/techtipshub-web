"use client";

import type { Editor } from "@tiptap/core";
import { EditorContent } from "@tiptap/react";
import SlashMenu from "./slash-menu";

interface IProps {
  editor: Editor | null;
  /** Marks the content as invalid, for form validation styling. */
  hasError?: boolean;
  /**
   * Borderless surface for a full-page composer.
   *
   * The page itself provides the readable column, so the editor is only the
   * writing area: no inner card, and the "/" menu is anchored to the page.
   */
  variant?: "card" | "surface";
}

/**
 * Editor surface plus the "/" menu.
 *
 * The menu renders itself; it only needs the editor instance.
 */
const EditorView = ({ editor, hasError, variant = "card" }: IProps) => {
  const surface = variant === "surface";

  return (
    <div
      className={
        surface
          ? `tth-editor ${hasError ? "tth-editor-invalid" : ""}`
          : `tth-editor overflow-hidden rounded-lg border bg-content1 ${
              hasError ? "border-danger" : "border-default-200"
            } focus-within:border-default-400`
      }
    >
      <EditorContent
        editor={editor}
        className={`tth-editor-content ${surface ? "tth-editor-content-surface" : ""}`}
      />
      <SlashMenu editor={editor} />
    </div>
  );
};

export default EditorView;
