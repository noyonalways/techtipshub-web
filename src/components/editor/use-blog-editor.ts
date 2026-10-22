"use client";

import { useEditor } from "@tiptap/react";
import { editorExtensions } from "./editor-extensions";
import { serializePostHTML } from "./extensions";

interface IProps {
  value: string;
  onChange: (html: string) => void;
  editable?: boolean;
}

/**
 * Creates the blog editor.
 *
 * Content is read and written as the same HTML the site stores, so this is a
 * drop-in replacement for the old rich-text component: callers keep working
 * with strings and the API needs no changes.
 */
export const useBlogEditor = ({ value, onChange, editable = true }: IProps) =>
  useEditor(
    {
      extensions: editorExtensions,
      content: value || "",
      editable,
      // The editor is client-only; rendering it during SSR would hydrate
      // against different markup.
      immediatelyRender: false,
      // The toolbar and menus read `editor.isActive(...)`, which only updates
      // on a re-render.
      shouldRerenderOnTransaction: true,
      editorProps: {
        attributes: {
          class: "tth-prose",
          spellcheck: "true",
        },
        // Pasting or dropping an image embeds it directly. The API has no
        // inline-image upload endpoint, so the alternative would be losing the
        // image entirely.
        handlePaste: (view, event) => {
          const file = Array.from(event.clipboardData?.files ?? []).find((f) =>
            f.type.startsWith("image/"),
          );
          if (!file) return false;

          event.preventDefault();
          const reader = new FileReader();
          reader.onload = () => {
            const src = String(reader.result);
            const { schema } = view.state;
            const node = schema.nodes.image.create({ src });
            view.dispatch(view.state.tr.replaceSelectionWith(node));
          };
          reader.readAsDataURL(file);
          return true;
        },
        handleDrop: (view, event) => {
          const file = Array.from(event.dataTransfer?.files ?? []).find((f) =>
            f.type.startsWith("image/"),
          );
          if (!file) return false;

          event.preventDefault();
          const reader = new FileReader();
          reader.onload = () => {
            const src = String(reader.result);
            const node = view.state.schema.nodes.image.create({ src });
            view.dispatch(view.state.tr.replaceSelectionWith(node));
          };
          reader.readAsDataURL(file);
          return true;
        },
      },
      onUpdate: ({ editor }) => {
        // `getHTML()` is the schema's own output; `serializePostHTML` only
        // restores the paragraph/`<li>` shape the site has always stored.
        onChange(serializePostHTML(editor.getHTML()));
      },
    },
    [],
  );

export default useBlogEditor;
