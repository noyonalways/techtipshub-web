"use client";

import { useId, useRef } from "react";
import { FiSearch, FiX } from "react-icons/fi";
import { focusRing } from "./tau";

export interface DataToolbarFilter {
  key: string;
  label: string;
  count?: number;
}

interface IProps {
  filters?: DataToolbarFilter[];
  activeFilter?: string;
  onFilterChange?: (key: string) => void;
  query?: string;
  onQueryChange?: (value: string) => void;
  searchPlaceholder?: string;
  /** Extra controls on the right, on their own row on phones. */
  right?: React.ReactNode;
  /**
   * A primary action pinned to the right of the search field, sharing its row
   * (filter tabs stay on the left). Use when the search belongs to that
   * action, e.g. "search these categories" then "New category".
   */
  trailing?: React.ReactNode;
}

/**
 * Filter tabs plus search above a table. The tabs are a real tablist: one tab
 * stop, arrow keys walk the options, so a row of counts does not cost eight
 * stops on the way to the table.
 *
 * Two layouts, not one squeezed one: below sm the tabs are a chip row that
 * scrolls sideways and the search sits on its own line, so nothing wraps into
 * three cramped rows at 360px. From sm up the search moves to the right on the
 * same row as the tabs.
 */
export default function DataToolbar({
  filters,
  activeFilter,
  onFilterChange,
  query,
  onQueryChange,
  searchPlaceholder = "Search",
  right,
  trailing,
}: IProps) {
  const tablistRef = useRef<HTMLDivElement>(null);
  const baseId = useId();

  if (!filters && onQueryChange === undefined && !right && !trailing)
    return null;

  const onTabKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!filters?.length || !onFilterChange) return;

    const currentIndex = Math.max(
      0,
      filters.findIndex((filter) => filter.key === activeFilter),
    );
    let nextIndex: number | undefined;

    if (event.key === "ArrowRight") {
      nextIndex = (currentIndex + 1) % filters.length;
    } else if (event.key === "ArrowLeft") {
      nextIndex = (currentIndex - 1 + filters.length) % filters.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = filters.length - 1;
    }

    if (nextIndex === undefined) return;
    event.preventDefault();
    onFilterChange(filters[nextIndex].key);
    tablistRef.current
      ?.querySelectorAll<HTMLElement>('[role="tab"]')
      [nextIndex]?.focus();
  };

  const search = (uid: string) => (
    <div className="relative flex min-w-0 items-center sm:w-64 sm:flex-none">
      <FiSearch
        aria-hidden
        className="pointer-events-none absolute left-2.5 size-4 text-default-600"
      />
      <input
        id={uid}
        type="search"
        value={query ?? ""}
        onChange={(event) => onQueryChange!(event.target.value)}
        placeholder={searchPlaceholder}
        aria-label={searchPlaceholder}
        className={`h-9 w-full rounded-[6px] border border-default-200 bg-background pl-8 pr-8 text-sm text-foreground transition-colors placeholder:text-default-600 hover:border-default-300 focus:border-default-400 ${focusRing}`}
      />
      {query ? (
        <button
          type="button"
          onClick={() => onQueryChange!("")}
          aria-label="Clear search"
          className={`absolute right-0.5 inline-flex size-8 items-center justify-center rounded-[6px] text-default-600 transition-colors hover:text-foreground ${focusRing}`}
        >
          <FiX aria-hidden className="size-4" />
        </button>
      ) : null}
    </div>
  );

  return (
    <div className="flex flex-col gap-2 border-b border-default/60 p-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-3 sm:px-3 sm:py-2">
      {filters && onFilterChange ? (
        <div
          ref={tablistRef}
          role="tablist"
          aria-label="Filter rows"
          onKeyDown={onTabKeyDown}
          className="-mx-2.5 flex snap-x items-center gap-1 overflow-x-auto px-2.5 pb-0.5 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {filters.map((filter) => {
            const selected = filter.key === activeFilter;
            return (
              <button
                key={filter.key}
                id={`${baseId}-tab-${filter.key}`}
                role="tab"
                type="button"
                aria-selected={selected}
                tabIndex={selected ? 0 : -1}
                onClick={() => onFilterChange(filter.key)}
                className={`inline-flex min-h-11 shrink-0 snap-start items-center gap-1.5 rounded-[6px] border px-2.5 text-[0.8125rem] font-medium transition-colors sm:min-h-9 ${focusRing} ${
                  selected
                    ? "border-primary/40 bg-primary/10 text-primary-accessible"
                    : "border-transparent text-default-600 hover:bg-default-100 hover:text-foreground"
                }`}
              >
                {filter.label}
                {filter.count !== undefined && (
                  <span
                    className={`tabular-nums ${
                      selected ? "" : "text-default-600"
                    }`}
                  >
                    {filter.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      ) : (
        <span className="hidden sm:block" />
      )}

      <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          {onQueryChange !== undefined && search(`${baseId}-search`)}
          {right}
        </div>
        {trailing}
      </div>
    </div>
  );
}
