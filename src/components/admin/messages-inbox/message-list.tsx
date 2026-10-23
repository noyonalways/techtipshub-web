"use client";

import { formatExact, formatRelative, isoDate } from "@/components/admin/utils";
import EmptyState from "@/components/modules/admin/kit/empty-state";
import { focusRing } from "@/components/modules/admin/kit/tau";
import type {
  TContact,
  TContactCounts,
  TContactStatus,
} from "@/types/admin.type";
import { Skeleton } from "@heroui/skeleton";
import { useCallback, useId, useRef, type KeyboardEvent } from "react";
import { FiInbox } from "react-icons/fi";

export const STATUS_LABEL: Record<TContactStatus, string> = {
  new: "New",
  read: "Read",
  archived: "Archived",
};

/*
 * The status dot marks a real state and is always paired with its word, so the
 * meaning survives a colour-blind read. Amber for a message nobody has opened,
 * green once read, quiet neutral once archived.
 */
export const STATUS_DOT: Record<TContactStatus, string> = {
  new: "bg-primary",
  read: "bg-success",
  archived: "bg-default-400",
};

export const senderName = (contact: TContact) =>
  [contact.firstName, contact.lastName].filter(Boolean).join(" ") ||
  "Unknown sender";

/** One line of the body, collapsed. The full text lives in the detail pane. */
export const oneLine = (value: string, max = 120) => {
  const flat = (value || "").replace(/\s+/g, " ").trim();
  return flat.length > max ? `${flat.slice(0, max - 1)}…` : flat;
};

export type Filter = TContactStatus | "all";

/** Erased when the reader asks to start over. */
export type InboxActions = {
  clearSearch: () => void;
  showAll: () => void;
};

const TABS: Filter[] = ["all", "new", "read", "archived"];

interface IFilters {
  counts?: TContactCounts;
  status: Filter;
  onChange: (status: Filter) => void;
  search?: string;
}

/**
 * Status tabs with the counts the API returned. A tab without a count shows
 * no number rather than a made-up zero. The tabs are one tab stop: arrow keys
 * walk them, the same model the admin tables use. Below lg the row scrolls on
 * its own so the inbox frame never widens the page.
 */
const MessageFilters = ({ counts, status, onChange, search }: IFilters) => {
  const tablistRef = useRef<HTMLDivElement>(null);
  const baseId = useId();

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const index = Math.max(0, TABS.indexOf(status));
    let next: number | undefined;

    if (event.key === "ArrowRight") next = (index + 1) % TABS.length;
    else if (event.key === "ArrowLeft")
      next = (index - 1 + TABS.length) % TABS.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = TABS.length - 1;

    if (next === undefined) return;
    event.preventDefault();
    onChange(TABS[next]);
    tablistRef.current
      ?.querySelectorAll<HTMLElement>('[role="tab"]')
      [next]?.focus();
  };

  return (
    <div
      ref={tablistRef}
      role="tablist"
      aria-label="Filter messages by status"
      onKeyDown={onKeyDown}
      className="-mx-1 flex items-center gap-0.5 overflow-x-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {TABS.map((key) => {
        const selected = key === status;
        const count =
          key === "all" || !counts ? undefined : counts[key as TContactStatus];

        return (
          <button
            key={key}
            id={`${baseId}-tab-${key}`}
            type="button"
            role="tab"
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(key)}
            className={`inline-flex min-h-11 shrink-0 items-center gap-1.5 border-b-2 px-2.5 text-[0.8125rem] font-medium transition-colors lg:min-h-10 ${focusRing} ${
              selected
                ? "border-primary text-foreground"
                : "border-transparent text-default-600 hover:text-foreground"
            }`}
          >
            {key === "all" ? "All" : STATUS_LABEL[key]}
            {typeof count === "number" && (
              <span
                className={`tabular-nums ${
                  selected ? "text-primary-accessible" : "text-default-600"
                }`}
              >
                {count.toLocaleString()}
              </span>
            )}
          </button>
        );
      })}
      {search && (
        <span className="ml-auto shrink-0 truncate pl-2 text-xs text-default-600">
          searching “{search}”
        </span>
      )}
    </div>
  );
};

interface IList {
  messages: TContact[];
  /** Every message in the current filter, as the API counted it. */
  total?: number;
  isLoading: boolean;
  isFetching: boolean;
  failed: boolean;
  failedMessage?: string;
  onRetry: () => void;
  status: Filter;
  searchTerm: string;
  actions: InboxActions;
  /** The message open in the detail pane, if any. */
  selectedId?: string;
  onSelect: (id: string) => void;
  /** Lets the inbox send focus back to a row when the phone view closes. */
  registerRow: (id: string, node: HTMLButtonElement | null) => void;
}

const ROW =
  "flex w-full min-w-0 flex-col gap-1 border-l-2 px-3.5 py-3 text-left transition-colors";

/**
 * The inbox list. A real list with a roving tabindex: one tab stop on the
 * rows, then Up/Down walk the messages and Enter or Space opens one. On a
 * phone that means reaching the tenth message without ten tab presses.
 */
const MessageList = ({
  messages,
  total,
  isLoading,
  isFetching,
  failed,
  failedMessage,
  onRetry,
  status,
  searchTerm,
  actions,
  selectedId,
  onSelect,
  registerRow,
}: IList) => {
  const listRef = useRef<HTMLUListElement>(null);

  const move = useCallback(
    (event: KeyboardEvent<HTMLElement>, index: number) => {
      let next: number | undefined;

      if (event.key === "ArrowDown")
        next = Math.min(messages.length - 1, index + 1);
      else if (event.key === "ArrowUp") next = Math.max(0, index - 1);
      else if (event.key === "Home") next = 0;
      else if (event.key === "End") next = messages.length - 1;

      if (next === undefined) return;
      event.preventDefault();

      const id = messages[next]?._id;
      if (!id) return;

      onSelect(id);
      listRef.current
        ?.querySelectorAll<HTMLButtonElement>('[data-message-row="true"]')
        [next]?.focus();
    },
    [messages, onSelect],
  );

  if (isLoading) {
    return (
      <div aria-busy="true">
        <ul className="divide-y divide-default/60" aria-hidden>
          {Array.from({ length: 6 }).map((_, index) => (
            <li key={index} className="space-y-2 px-3.5 py-3.5">
              <Skeleton className="h-3 w-28 rounded" />
              <Skeleton className="h-4 w-44 rounded" />
              <Skeleton className="h-3 w-full rounded" />
            </li>
          ))}
        </ul>
        <p className="sr-only" role="status">
          Loading messages
        </p>
      </div>
    );
  }

  if (failed) {
    return (
      <EmptyState
        variant="inline"
        icon={<FiInbox className="size-5" />}
        title="Messages could not be loaded"
        description={
          failedMessage ||
          "The request to the API failed. Try again, and if it keeps failing check that the API is reachable."
        }
        action={
          <button
            type="button"
            onClick={onRetry}
            className={`inline-flex min-h-11 items-center rounded-[6px] border border-default-300 px-3.5 text-sm font-medium hover:bg-default-100 ${focusRing}`}
          >
            Try again
          </button>
        }
      />
    );
  }

  if (messages.length === 0) {
    if (searchTerm) {
      return (
        <EmptyState
          variant="inline"
          icon={<FiInbox className="size-5" />}
          title="No messages match this search"
          description={`Nothing in ${status === "all" ? "the inbox" : `the ${STATUS_LABEL[status].toLowerCase()} tab`} contains "${searchTerm}". The API matches the sender's name and the subject.`}
          action={
            <button
              type="button"
              onClick={actions.clearSearch}
              className={`inline-flex min-h-11 items-center rounded-[6px] border border-default-300 px-3.5 text-sm font-medium hover:bg-default-100 ${focusRing}`}
            >
              Clear search
            </button>
          }
        />
      );
    }

    return status === "all" ? (
      <EmptyState
        variant="inline"
        icon={<FiInbox className="size-5" />}
        title="No messages yet"
        description="Everything sent through the contact form lands here, so the inbox fills as visitors write in."
      />
    ) : (
      <EmptyState
        variant="inline"
        icon={<FiInbox className="size-5" />}
        title={`Nothing marked ${STATUS_LABEL[status].toLowerCase()}`}
        description="A message moves into this tab when its status changes. All still holds the rest."
        action={
          <button
            type="button"
            onClick={actions.showAll}
            className={`inline-flex min-h-11 items-center rounded-[6px] border border-default-300 px-3.5 text-sm font-medium hover:bg-default-100 ${focusRing}`}
          >
            Show all messages
          </button>
        }
      />
    );
  }

  return (
    <>
      <ul
        ref={listRef}
        aria-label={`Messages${typeof total === "number" ? `, ${total} in total` : ""}, newest first`}
        aria-busy={isFetching || undefined}
        className="divide-y divide-default/60"
      >
        {messages.map((message, index) => {
          const unread = message.status === "new";

          return (
            <li key={message._id}>
              <button
                ref={(node) => registerRow(message._id, node)}
                type="button"
                data-message-row="true"
                onClick={() => onSelect(message._id)}
                onKeyDown={(event) => {
                  if (
                    event.key === "ArrowDown" ||
                    event.key === "ArrowUp" ||
                    event.key === "Home" ||
                    event.key === "End"
                  ) {
                    move(event, index);
                  }
                }}
                // One tab stop for the whole list: the first row, or the open
                // one when the reader comes back from the pane.
                tabIndex={
                  (selectedId ? message._id === selectedId : index === 0)
                    ? 0
                    : -1
                }
                aria-current={message._id === selectedId ? "true" : undefined}
                aria-label={`${senderName(message)}${unread ? ", new" : ""}, ${
                  message.subject || "no subject"
                }`}
                className={`${ROW} ${focusRing} ${
                  unread ? "border-l-primary" : "border-l-transparent"
                } ${
                  message._id === selectedId
                    ? "bg-default-100"
                    : "hover:bg-default-50"
                }`}
              >
                <span className="flex min-w-0 items-baseline justify-between gap-2">
                  <span
                    className={`min-w-0 truncate text-sm ${
                      unread ? "font-semibold" : "font-medium text-default-800"
                    }`}
                  >
                    {senderName(message)}
                  </span>
                  <time
                    dateTime={isoDate(message.createdAt) ?? undefined}
                    title={formatExact(message.createdAt)}
                    className="shrink-0 text-xs tabular-nums text-default-600"
                  >
                    {formatRelative(message.createdAt)}
                  </time>
                </span>

                <span
                  className={`block min-w-0 truncate text-[0.8125rem] ${
                    unread ? "font-medium text-foreground" : "text-default-700"
                  }`}
                >
                  {message.subject || "(no subject)"}
                </span>

                <span className="flex min-w-0 items-center gap-2">
                  <span className="min-w-0 flex-1 truncate text-xs text-default-600">
                    {oneLine(message.message)}
                  </span>
                  <span className="flex shrink-0 items-center gap-1 text-[0.6875rem] font-medium text-default-700">
                    <span
                      aria-hidden
                      className={`size-1.5 rounded-full ${STATUS_DOT[message.status]}`}
                    />
                    {STATUS_LABEL[message.status]}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {isFetching && (
        <p className="sr-only" role="status">
          Refreshing messages
        </p>
      )}
    </>
  );
};

export { MessageFilters };
export default MessageList;
