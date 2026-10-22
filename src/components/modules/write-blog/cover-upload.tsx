"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { LuImagePlus, LuTrash2, LuUpload } from "react-icons/lu";

interface IProps {
  file: File | null;
  onChange: (file: File | null) => void;
  invalid?: boolean;
}

const MAX_BYTES = 5 * 1024 * 1024;

/**
 * Cover image band.
 *
 * Empty it is a slim dashed strip rather than a large empty box, so the title
 * stays the first thing on the page. It accepts a click, a drop and a file
 * dialog, and shows the chosen image in the shape the article header uses.
 */
const CoverUpload = ({ file, onChange, invalid }: IProps) => {
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

  return (
    <div>
      {preview ? (
        <div className="group relative overflow-hidden rounded-xl border border-default-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Cover"
            className="h-40 w-full object-cover sm:h-52 md:h-60"
          />
          <div className="absolute inset-0 flex items-end justify-end gap-2 bg-gradient-to-t from-black/60 via-transparent p-3 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex items-center gap-1.5 rounded-md bg-black/60 px-2.5 py-1.5 text-xs text-white backdrop-blur hover:bg-black/80"
            >
              <LuUpload className="size-3.5" />
              Replace
            </button>
            <button
              type="button"
              onClick={() => onChange(null)}
              className="flex items-center gap-1.5 rounded-md bg-black/60 px-2.5 py-1.5 text-xs text-white backdrop-blur hover:bg-black/80"
            >
              <LuTrash2 className="size-3.5" />
              Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            accept(event.dataTransfer.files?.[0]);
          }}
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
              — or drop one here
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
