"use client";

import { focusRing } from "@/components/modules/admin/kit/tau";
import { Select, SelectItem } from "@heroui/select";
import { useId, useEffect, useState } from "react";
import { RiArrowDownSLine } from "react-icons/ri";

/** How long typing waits before it becomes a request. */
const DEBOUNCE_MS = 350;

/**
 * Search text that only becomes a query after typing stops. The API pages the
 * whole result set, so one settled phrase is one request instead of one per
 * keystroke.
 *
 * `onSettled` fires with the same phrase that `term` changes to, which is
 * where the page counter goes back to 1: a new search never keeps page 4 of
 * the previous one.
 */
export const useDebouncedTerm = (
  value: string,
  onSettled?: (term: string) => void,
) => {
  const [term, setTerm] = useState("");

  useEffect(() => {
    const next = value.trim().slice(0, 120);

    const timer = window.setTimeout(() => {
      setTerm(next);
      onSettled?.(next);
    }, DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [value, onSettled]);

  return term;
};

interface ISelect {
  label: string;
  value: string | number;
  options: { value: string | number; label: string }[];
  onChange: (value: string) => void;
  /** Hidden label kept for screen readers only. */
  hideLabel?: boolean;
}

/** Room for the furled chevron the trigger draws on the right. */
const CHEVRON_ROOM = "pr-8";

/**
 * A labelled select for the admin toolbars.
 *
 * HeroUI's Select, so an admin filter opens the same floating picker, chevron
 * and keyboard handling as every other choice in the app. The toolbar sizes
 * differ from a form field: 44px on phones and 36px from `sm` up, a 6px
 * radius, and a hairline border that darkens on hover.
 *
 * The visible label is drawn beside the control (or kept for screen readers
 * with `hideLabel`), never inside it, so a dense toolbar row does not grow
 * floating-label chrome you only see once a value is chosen.
 */
export const ListSelect = ({
  label,
  value,
  options,
  onChange,
  hideLabel = false,
}: ISelect) => {
  const labelId = useId();

  return (
    <div className="flex min-w-0 items-center gap-1.5">
      <span
        id={labelId}
        className={
          hideLabel
            ? "sr-only"
            : "shrink-0 text-xs font-medium text-default-700"
        }
      >
        {label}
      </span>
      <Select
        aria-labelledby={labelId}
        selectedKeys={[String(value)]}
        onSelectionChange={(keys) => {
          const next = Array.from(keys)[0];
          if (next !== undefined) onChange(String(next));
        }}
        disallowEmptySelection
        variant="bordered"
        size="sm"
        radius="sm"
        className="min-w-0 grow"
        popoverProps={{ placement: "bottom-start", showArrow: false }}
        selectorIcon={<RiArrowDownSLine aria-hidden className="size-4" />}
        classNames={{
          base: "min-w-0 grow",
          mainWrapper: "min-w-0",
          trigger: `h-11 min-h-11 sm:h-9 sm:min-h-9 ${CHEVRON_ROOM} px-2.5 rounded-[6px] border border-default-200 bg-background shadow-none data-[hover=true]:border-default-300 data-[open=true]:border-default-400 ${focusRing}`,
          value: "truncate text-sm text-foreground",
          popoverContent: "min-w-[10rem] border border-default-200",
        }}
      >
        {options.map((option) => (
          <SelectItem key={String(option.value)} textValue={option.label}>
            {option.label}
          </SelectItem>
        ))}
      </Select>
    </div>
  );
};

/** The one quiet button shape used by the list footers and empty states. */
export const quietButton = `inline-flex min-h-11 items-center justify-center rounded-[6px] border border-default-300 px-3.5 text-sm font-medium text-foreground transition-colors hover:bg-default-100 disabled:opacity-60 sm:min-h-9 ${focusRing}`;

/** Shared page-size choices. */
export const PAGE_SIZES = [20, 50] as const;
