"use client";

import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { focusRing } from "./tau";

interface IProps {
  page: number;
  totalPages: number;
  total?: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
}

const buttonClass = `inline-flex min-h-11 min-w-11 items-center justify-center rounded-[6px] text-default-700 transition-colors hover:bg-default-100 hover:text-foreground disabled:pointer-events-none disabled:text-default-400 sm:min-h-8 sm:min-w-8 ${focusRing}`;

/**
 * Page controls for a server-paged list. Renders nothing for a single page,
 * because a disabled pair of arrows says "dead control" for no reason.
 *
 * The left side states the window and the page size the API actually used, so
 * "10 per page" is never a guess; the right side is the two-step control with
 * the current position between the arrows.
 */
export default function AdminPagination({
  page,
  totalPages,
  total,
  pageSize,
  onPageChange,
}: IProps) {
  if (totalPages <= 1) return null;

  const first = pageSize ? (page - 1) * pageSize + 1 : undefined;
  const last = pageSize
    ? Math.min(page * pageSize, total ?? page * pageSize)
    : undefined;

  return (
    <nav
      aria-label="Pagination"
      className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-t border-default/60 bg-default-50/40 px-3 py-2"
    >
      <p className="text-xs tabular-nums text-default-600">
        {first !== undefined && last !== undefined ? (
          <>
            <span className="font-medium text-foreground">
              {first.toLocaleString()}–{last.toLocaleString()}
            </span>
            {total !== undefined ? ` of ${total.toLocaleString()}` : ""}
            {pageSize ? `, ${pageSize.toLocaleString()} per page` : ""}
          </>
        ) : (
          <>
            Page {page} of {totalPages}
          </>
        )}
      </p>

      <div className="flex items-center gap-0.5">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
          className={buttonClass}
        >
          <FiChevronLeft aria-hidden className="size-4" />
        </button>
        <p
          className="min-w-[5.5rem] px-1 text-center text-xs tabular-nums text-default-700"
          aria-live="polite"
          aria-atomic="true"
        >
          Page {page} of {totalPages}
        </p>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Next page"
          className={buttonClass}
        >
          <FiChevronRight aria-hidden className="size-4" />
        </button>
      </div>
    </nav>
  );
}
