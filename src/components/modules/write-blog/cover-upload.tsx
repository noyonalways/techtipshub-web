"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { LuImagePlus, LuTrash2, LuUpload } from "react-icons/lu";

interface IProps {
  file: File | null;
  onChange: (file: File | null) => void;
  invalid?: boolean;
  /** A cover already stored on the post, shown until a replacement is chosen. */
  existing?: string | null;
  /**
   * Called when "Remove" is pressed on an `existing` cover. Callers that cannot
   * actually delete a stored image use this to say so; without it, Remove just
   * clears `file`.
   */
  onRemoveExisting?: () => void;
}

const MAX_BYTES = 5 * 1024 * 1024;

/**
 * Cover image band.
 *
 * Empty it is a slim dashed strip rather than a large empty box, so the title
 * stays the first thing on the page. It accepts a click, a drop and a file
 * dialog, and shows the chosen image in the shape the article header uses.
 *
 * On the edit screen `existing` is the saved cover: choosing a file replaces
 * it, and "Remove" clears it so the post is left without one.
 */
const CoverUpload = ({ file, onChange, invalid, existing, onRemoveExisting }: IProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Object URLs are derived from the file, so they are created during render
  // (not in an effect) and only revoked once they are replaced or unmounted.
  const preview = useMemo(
    () => (file ? URL.createObjectURL(file) : null),
    [file],
  );
  useEffect(() => {
    if (!preview) return;
    return () => URL.revokeObjectURL(preview);
  }, [preview]);

  const accept = (candidate: File | undefined) => {
    if (!candidate) return;
    if (!candidate.type.startsWith("image/")) {
      setError("That file is not an image.");
      return;
    }
    if (candidate.size > MAX_BYTES) {
      setError("Images must be smaller than 5 MB.");
      return;
    }
    setError(null);
    onChange(candidate);
  };

  const remove = () => {
    if (existing) {
      onRemoveExisting?.();
      return;
    }
    onChange(null);
  };

  // The saved cover only shows until the writer picks or removes one — the
  // caller decides that by passing `existing` (or null).
  const shownPreview = preview ?? existing ?? null;

  const dragHandlers = {
    onDragOver: (event: React.DragEvent) => {
      event.preventDefault();
      setDragging(true);
    },
    onDragLeave: () => setDragging(false),
    onDrop: (event: React.DragEvent) => {
      event.preventDefault();
      setDragging(false);
      accept(event.dataTransfer.files?.[0]);
    },
  };

  return (
    <div>
      {shownPreview ? (
        <div
          className={`group relative overflow-hidden rounded-xl border ${
            dragging ? "border-primary ring-2 ring-primary/30" : "border-default-200"
          }`}
          {...dragHandlers}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={shownPreview}
            alt="Cover"
            className="h-40 w-full object-cover sm:h-52 md:h-60"
          />
          <div className="absolute inset-0 flex items-end justify-between gap-2 bg-gradient-to-t from-black/60 via-transparent p-3">
            <span className="hidden rounded-md bg-black/50 px-2 py-1 text-xs text-white/90 backdrop-blur sm:inline">
              {existing ? "Current cover" : "New cover"}
            </span>
            <div className="flex gap-2 sm:opacity-0 sm:transition-opacity sm:group-focus-within:opacity-100 sm:group-hover:opacity-100">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="flex items-center gap-1.5 rounded-md bg-black/60 px-2.5 py-1.5 text-xs text-white backdrop-blur transition-colors hover:bg-black/80 focus-visible:opacity-100"
              >
                <LuUpload className="size-3.5" />
                Replace
              </button>
              <button
                type="button"
                onClick={remove}
                className="flex items-center gap-1.5 rounded-md bg-black/60 px-2.5 py-1.5 text-xs text-white backdrop-blur transition-colors hover:bg-black/80 focus-visible:opacity-100"
              >
                <LuTrash2 className="size-3.5" />
                Remove
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          {...dragHandlers}
          className={`flex w-full items-center gap-2 rounded-xl border border-dashed px-4 py-3 text-sm transition-colors ${
            dragging
              ? "border-primary bg-primary-50/40 text-primary"
              : invalid
                ? "border-danger text-danger"
                : "border-default-300 text-default-500 hover:border-default-400 hover:text-foreground"
          }`}
        >
          <LuImagePlus className="size-4 shrink-0" />
          <span>
            Add a cover image
            <span className="hidden text-default-400 sm:inline">
              {" "}
              - or drop one here
            </span>
          </span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          accept(event.target.files?.[0]);
          event.target.value = "";
        }}
      />

      {error && (
        <p className="mt-2 text-sm text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default CoverUpload;
