"use client";

import { Button } from "@heroui/react";
import { useFormContext } from "react-hook-form";

interface IProps {
  isPending: boolean;
  /** A file is staged but the form fields themselves are untouched. */
  filePending?: boolean;
  /** Shown on wide screens: what saving does. */
  hint?: string;
  children: React.ReactNode;
}

/**
 * The save action for a settings form.
 *
 * It sits in a footer at the end of the form, on a tinted strip so it reads as
 * the end of the job rather than another field. It is deliberately not pinned
 * to the viewport: on a narrow screen a pinned bar sits over the very fields it
 * saves. The forms here are short enough that one scroll reaches it, and the
 * "Unsaved changes" note keeps the pending edit visible while reading.
 */
const SettingsSaveBar = ({
  isPending,
  filePending = false,
  hint,
  children,
}: IProps) => {
  const {
    formState: { isDirty },
  } = useFormContext();
  const dirty = isDirty || filePending;

  return (
    <div className="flex flex-wrap items-center justify-end gap-x-4 gap-y-2 rounded-xl border border-default/60 bg-default-50/60 px-4 py-3 dark:bg-default-100/5">
      {dirty && !isPending && (
        <span className="mr-auto flex items-center gap-1.5 text-xs font-medium text-warning">
          <span aria-hidden className="size-1.5 rounded-full bg-current" />
          Unsaved changes
        </span>
      )}
      {!dirty && !isPending && hint && (
        <span className="mr-auto text-xs text-default-500">{hint}</span>
      )}
      <Button
        radius="lg"
        color="primary"
        className="font-semibold"
        type="submit"
        isLoading={isPending}
        isDisabled={!dirty}
      >
        {children}
      </Button>
    </div>
  );
};

export default SettingsSaveBar;
