"use client";

import { useFormContext } from "react-hook-form";
import { useEffect, useMemo, useRef, useState } from "react";
import { LuImagePlus, LuTrash2 } from "react-icons/lu";

const MAX_BYTES = 5 * 1024 * 1024;

/**
 * Profile-photo picker for the sign-up form.
 *
 * The form submits a `FileList` under `image` (read from react-hook-form), so
 * the real input stays registered and hidden; this only paints a styled
 * button around it. A raw `<input type="file">` next to HeroUI fields renders
 * the browser's own grey "Choose File" control, which reads as broken.
 */
const SignupAvatarPicker = () => {
  const { register, setValue, formState } = useFormContext();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { ref, onChange, ...rest } = register("image");

  const preview = useMemo(
    () => (file ? URL.createObjectURL(file) : null),
    [file]
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
    setFile(candidate);
    // Feed the picker back into react-hook-form so the submit handler still
    // receives a FileList under `image`.
    const transfer = new DataTransfer();
    transfer.items.add(candidate);
    setValue("image", transfer.files, { shouldValidate: true });
  };

  const clear = () => {
    setFile(null);
    setError(null);
    setValue("image", undefined);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div>
      <span className="mb-1 block tth-label-sm text-default-600">
        Profile photo <span className="font-normal">(optional)</span>
      </span>

      <div className="flex items-center gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-default/60 bg-default-50">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="" className="size-full object-cover" />
          ) : (
            <LuImagePlus className="size-4 text-default-600" aria-hidden />
          )}
        </span>

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="rounded-lg border border-default/60 px-3 py-2 text-sm font-medium text-default-700 transition-colors hover:border-primary-600/50 hover:bg-primary/5 hover:text-primary-accessible"
        >
          {file ? "Replace photo" : "Choose a photo"}
        </button>

        {file && (
          <button
            type="button"
            onClick={clear}
            className="inline-flex items-center gap-1 rounded-lg px-2 py-2 text-sm text-default-600 transition-colors hover:text-danger"
          >
            <LuTrash2 className="size-3.5" aria-hidden />
            Remove
          </button>
        )}
      </div>

      <input
        {...rest}
        ref={(element) => {
          ref(element);
          inputRef.current = element;
        }}
        type="file"
        id="image"
        accept="image/jpeg, image/png, image/jpg"
        className="hidden"
        onChange={(event) => {
          onChange(event);
          accept(event.target.files?.[0]);
        }}
      />

      {(error || formState.errors.image) && (
        <p className="mt-2 text-sm text-danger" role="alert">
          {error ?? (formState.errors.image?.message as string)}
        </p>
      )}
    </div>
  );
};

export default SignupAvatarPicker;
