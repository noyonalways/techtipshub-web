"use client";

import { buildReplyLink, safeEmail } from "@/components/admin/utils";
import AdminPagination from "@/components/modules/admin/kit/pagination";
import { focusRing } from "@/components/modules/admin/kit/tau";
import {
  ListSelect,
  PAGE_SIZES,
  useDebouncedTerm,
} from "@/components/admin/list-controls";
import {
  useContactMessage,
  useContactMessages,
  useUpdateContactStatus,
} from "@/hooks/admin-messages";
import type { TContact, TContactStatus } from "@/types/admin.type";
import { Spinner } from "@heroui/react";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FiSearch, FiX } from "react-icons/fi";
import { toast } from "sonner";

import MessageDetail from "./message-detail";
import MessageList, {
  MessageFilters,
  type Filter,
  type InboxActions,
} from "./message-list";

interface IProps {
  /** `?message=<id>` from the page, so a deep link opens the right message. */
  initialMessageId?: string;
  /** `?status=new|read|archived` from the page, so a queue tile opens that tab. */
  initialStatus?: string;
}

const STATUS_TABS = ["all", "new", "read", "archived"] as const;

const isStatus = (value?: string): value is Filter =>
  Boolean(value) &&
  (STATUS_TABS as readonly string[]).includes(value as string);

const isContact = (value: unknown): value is TContact => {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Partial<TContact>;
  return typeof candidate._id === "string" && candidate._id.length > 0;
};

/** The single-message route answers with the record itself; `result` covers older builds. */
const asContact = (value: unknown): TContact | undefined => {
  if (isContact(value)) return value;
  if (!value || typeof value !== "object") return undefined;

  const nested = (value as { result?: unknown }).result;
  return isContact(nested) ? nested : undefined;
};

const MessagesInbox = ({ initialMessageId, initialStatus }: IProps) => {
  const router = useRouter();
  const pathname = usePathname();

  const [selectedId, setSelectedId] = useState<string | undefined>(
    initialMessageId,
  );
  const [filter, setFilter] = useState<Filter>(() =>
    isStatus(initialStatus) ? initialStatus : "all",
  );
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState<number>(PAGE_SIZES[0]);
  const [query, setQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  // The status the reader picked, held until the server answer arrives, so the
  // buttons flip at once and fall back if the request fails. Compared with the
  // record's own status on read, which is why it needs no effect to clear.
  const [picked, setPicked] = useState<{
    id: string;
    status: TContactStatus;
  } | null>(null);

  const rowRefs = useRef(new Map<string, HTMLButtonElement | null>());
  const paneRef = useRef<HTMLDivElement | null>(null);

  const backToFirstPage = useCallback(() => setPage(1), []);
  // The API matches the sender's name and the subject, not the body, so the
  // placeholder says so rather than promising a full-text search.
  const searchTerm = useDebouncedTerm(query, backToFirstPage);

  const listQuery = useContactMessages({
    page,
    limit,
    status: filter,
    searchTerm,
  });
  const detailQuery = useContactMessage(selectedId, Boolean(selectedId));
  const { mutate: updateStatus, isPending: isUpdating } =
    useUpdateContactStatus();

  const messages = listQuery.rows;
  const counts = listQuery.counts;
  const meta = listQuery.meta;
  const pageSize = meta?.limit ?? limit;
  const totalPages = Math.max(meta?.totalPages ?? 1, 1);
  const total = meta?.total ?? 0;

  const failed = listQuery.isError;
  const failedMessage = listQuery.error?.message;

  const fetchedMessage = asContact(detailQuery.data);
  const fromList = selectedId
    ? messages.find((item) => item._id === selectedId)
    : undefined;
  const openMessage = fetchedMessage ?? fromList;

  const detailFailed =
    Boolean(selectedId) &&
    !detailQuery.isLoading &&
    fetchedMessage === undefined;
  const detailFailedMessage = detailQuery.error?.message;

  // The rows that belong to the request on screen. After a filter change the
  // previous page's rows are still held by the query, and an id from that page
  // must not stay selected under a tab it is not part of.
  const visibleIds = useMemo(
    () => new Set(messages.map((item) => item._id)),
    [messages],
  );

  // The list row keeps the pane filled while the single fetch travels, then
  // the fetched copy takes over. A picked status shows until the record itself
  // carries it, then the pick is stale and ignored.
  const displayed = useMemo(() => {
    if (!openMessage) return undefined;

    const held =
      picked &&
      picked.id === openMessage._id &&
      picked.status !== openMessage.status
        ? picked.status
        : null;

    return held ? { ...openMessage, status: held } : openMessage;
  }, [openMessage, picked]);

  const writeQuery = useCallback(
    (id?: string) => {
      router.replace(
        id ? `${pathname}?message=${encodeURIComponent(id)}` : pathname,
        { scroll: false },
      );
    },
    [pathname, router],
  );

  const selectMessage = useCallback(
    (id: string) => {
      setPicked(null);
      setSelectedId(id);
      setMobileOpen(true);
      writeQuery(id);
    },
    [writeQuery],
  );

  const closeDetail = useCallback(() => {
    const row = selectedId ? rowRefs.current.get(selectedId) : null;
    setPicked(null);
    setSelectedId(undefined);
    setMobileOpen(false);
    writeQuery(undefined);
    if (row?.isConnected) row.focus();
  }, [selectedId, writeQuery]);

  // A deep link can point at a message that is not on the current page or in
  // the current tab. The single fetch still resolves it, so the pane opens;
  // the reader is told why no row is highlighted behind it.
  const offPage =
    Boolean(selectedId) &&
    fetchedMessage !== undefined &&
    !visibleIds.has(selectedId!);

  // Escape leaves the phone view the same way Back does.
  useEffect(() => {
    if (!mobileOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeDetail();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen, closeDetail]);

  // Move focus into the pane after opening on a phone, so a screen reader
  // starts at the message instead of the row it came from.
  useEffect(() => {
    if (!mobileOpen) return;
    paneRef.current?.focus({ preventScroll: true });
  }, [mobileOpen, selectedId]);

  const handleFilter = useCallback((next: Filter) => {
    setFilter(next);
    setPage(1);
  }, []);

  const actions: InboxActions = {
    clearSearch: () => setQuery(""),
    showAll: () => handleFilter("all"),
  };

  const handleStatus = (status: TContactStatus) => {
    if (!displayed) return;

    const id = displayed._id;
    setPicked({ id, status });

    updateStatus(
      { id, status },
      {
        // A filtered tab no longer holds the message. Close the pane rather
        // than keep showing a record the list has already dropped.
        onSuccess: () => {
          if (filter !== "all" && status !== filter) closeDetail();
        },
        onError: () => setPicked(null),
      },
    );
  };

  const handleCopy = async () => {
    const address = safeEmail(displayed?.email);

    if (!address) {
      toast.error("This message has no usable email address.", {
        id: "admin-copy-address",
      });
      return;
    }

    try {
      await navigator.clipboard.writeText(address);
      toast.success("Address copied", { id: "admin-copy-address" });
    } catch {
      toast.error("The clipboard is not available in this browser.", {
        id: "admin-copy-address",
      });
    }
  };

  const replyLink = displayed
    ? buildReplyLink(displayed.email, displayed.subject)
    : null;

  const changePage = (next: number) => {
    setPage(Math.max(1, next));
    // With the pane open on a phone, a page change should show the new rows.
    setMobileOpen(false);
  };

  return (
    <div className="overflow-hidden rounded-[10px] border border-default/60 bg-content-1 lg:grid lg:h-[clamp(34rem,calc(100dvh-13rem),56rem)] lg:grid-cols-[minmax(17rem,21rem)_minmax(0,1fr)]">
      {/* Phone: either the list or one message. Wide: both, side by side. */}
      <div
        className={`min-w-0 flex-col border-default/60 lg:flex lg:min-h-0 lg:border-r ${
          mobileOpen ? "hidden" : "flex"
        }`}
      >
        <div className="flex shrink-0 items-center gap-2 border-b border-default/60 px-2">
          <div className="min-w-0 flex-1">
            <MessageFilters
              counts={counts}
              status={filter}
              onChange={handleFilter}
              search={searchTerm || undefined}
            />
          </div>
        </div>

        <div className="shrink-0 border-b border-default/60 p-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex min-w-0 flex-1 items-center">
              <FiSearch
                aria-hidden
                className="pointer-events-none absolute left-2.5 size-4 text-default-600"
              />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search sender or subject"
                aria-label="Search sender or subject"
                className={`h-11 w-full rounded-[6px] border border-default-200 bg-background pl-8 pr-8 text-sm text-foreground transition-colors placeholder:text-default-600 hover:border-default-300 focus:border-default-400 sm:h-9 ${focusRing}`}
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  className={`absolute right-0.5 inline-flex size-9 items-center justify-center rounded-[6px] text-default-600 hover:text-foreground ${focusRing}`}
                >
                  <FiX aria-hidden className="size-4" />
                </button>
              ) : null}
            </div>

            <ListSelect
              label="Per page"
              hideLabel
              value={limit}
              onChange={(value) => {
                setLimit(Number(value) || PAGE_SIZES[0]);
                setPage(1);
              }}
              options={PAGE_SIZES.map((size) => ({
                value: size,
                label: `${size} per page`,
              }))}
            />
            {listQuery.isFetching && !listQuery.isLoading && (
              <Spinner size="sm" color="current" aria-hidden />
            )}
          </div>
        </div>

        <div className="min-h-0 min-w-0 flex-1 overflow-y-auto">
          <MessageList
            messages={messages}
            total={total}
            isLoading={listQuery.isLoading}
            isFetching={listQuery.isFetching}
            failed={failed}
            failedMessage={failedMessage}
            onRetry={() => listQuery.refetch()}
            status={filter}
            searchTerm={searchTerm}
            actions={actions}
            selectedId={selectedId}
            onSelect={selectMessage}
            registerRow={(id, node) => {
              rowRefs.current.set(id, node);
            }}
          />
        </div>

        {!listQuery.isLoading && !failed && messages.length > 0 && (
          <div className="shrink-0 border-t border-default/60">
            {totalPages > 1 ? (
              <AdminPagination
                page={meta?.page ?? page}
                totalPages={totalPages}
                total={total}
                pageSize={pageSize}
                onPageChange={changePage}
              />
            ) : (
              <p className="px-3.5 py-2.5 text-xs tabular-nums text-default-600">
                {total.toLocaleString()} {total === 1 ? "message" : "messages"}
                {filter === "all" && !searchTerm
                  ? " in the inbox"
                  : " in this view"}
              </p>
            )}
          </div>
        )}
      </div>

      <div
        ref={paneRef}
        tabIndex={-1}
        aria-label="Message"
        className={`min-w-0 outline-none lg:block lg:min-h-0 lg:overflow-y-auto ${
          mobileOpen ? "block" : "hidden"
        }`}
      >
        {selectedId ? (
          <div className="flex min-h-full flex-col">
            {offPage && (
              <p
                role="status"
                className="flex flex-wrap items-center justify-between gap-2 border-b border-default/60 bg-default-50 px-4 py-2 text-xs text-default-700"
              >
                <span>
                  This message is not in the list on screen: it belongs to{" "}
                  {fetchedMessage?.status
                    ? `the ${fetchedMessage.status} tab`
                    : "another page"}
                  {searchTerm ? " or does not match the search" : ""}.
                </span>
                <button
                  type="button"
                  onClick={() => {
                    handleFilter("all");
                    setQuery("");
                  }}
                  className={`rounded-[6px] px-2 py-1 font-medium text-primary-accessible underline-offset-4 hover:underline ${focusRing}`}
                >
                  Show it in the list
                </button>
              </p>
            )}
            <MessageDetail
              message={displayed}
              isLoading={detailQuery.isLoading && !openMessage}
              failed={detailFailed && !openMessage}
              failedMessage={detailFailedMessage}
              onRetry={() => detailQuery.refetch()}
              replyLink={replyLink}
              onCopy={handleCopy}
              onStatusChange={handleStatus}
              isUpdating={isUpdating}
              onBack={closeDetail}
              showBack={mobileOpen}
            />
          </div>
        ) : (
          <div className="hidden h-full flex-col items-center justify-center px-6 py-16 text-center lg:flex">
            <p className="font-[family-name:var(--type-editorial)] text-lg font-semibold tracking-[-0.015em]">
              Nothing open
            </p>
            <p className="mt-1 max-w-xs text-sm leading-relaxed text-default-600">
              Pick a message to read it in full, reply by email, or move its
              status without leaving the inbox.
            </p>
            {typeof counts?.new === "number" && counts.new > 0 && (
              <p className="mt-4 text-xs text-default-600">
                {counts.new.toLocaleString()}{" "}
                {counts.new === 1 ? "message is" : "messages are"} still unread,
                across every page and tab.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesInbox;
