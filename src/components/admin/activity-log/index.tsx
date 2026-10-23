"use client";

import {
  formatExact,
  formatRelative,
  isoDate,
  numberOr,
} from "@/components/admin/utils";
import { ListSelect, quietButton } from "@/components/admin/list-controls";
import EmptyState from "@/components/modules/admin/kit/empty-state";
import { focusRing } from "@/components/modules/admin/kit/tau";
import { useAdminLogs } from "@/hooks/admin-activity";
import type { TAdminLog, TAdminMeta } from "@/types/admin.type";
import { Avatar } from "@heroui/react";
import Link from "next/link";
import { useCallback, useId, useMemo, useRef, useState } from "react";
import { FiRefreshCw } from "react-icons/fi";
import { PiNotePencil } from "react-icons/pi";

/**
 * Plain words for the actions the API records. A key that is not here still
 * appears, written as "article delete" from the dotted name, so a new action
 * never silently disappears from the log.
 */
const ACTION_LABEL: Record<string, string> = {
  "article.delete": "Deleted an article",
  "article.restore": "Restored an article",
  "blog.delete": "Deleted an article",
  "blog.restore": "Restored an article",
  "comment.delete": "Deleted a comment",
  "comment.restore": "Restored a comment",
  "category.create": "Created a category",
  "category.update": "Renamed a category",
  "category.delete": "Deleted a category",
  "user.block": "Blocked a member",
  "user.unblock": "Unblocked a member",
  "user.make_admin": "Made a member an admin",
  "user.demote": "Removed admin access",
  "user.delete": "Deleted a member",
  "user.restore": "Restored a member",
  "contact.status": "Changed a message status",
  "contact.archive": "Archived a message",
};

type Family = "all" | "content" | "members" | "messages";

const FAMILIES: { key: Family; label: string }[] = [
  { key: "all", label: "Everything" },
  { key: "content", label: "Articles and comments" },
  { key: "members", label: "Members" },
  { key: "messages", label: "Messages" },
];

const familyOf = (action: string): Family => {
  const prefix = action.split(".")[0];

  if (["article", "blog", "comment", "category"].includes(prefix)) {
    return "content";
  }
  if (prefix === "user") return "members";
  if (prefix === "contact") return "messages";

  return "all";
};

const actionLabel = (action?: string) => {
  if (!action) return "Recorded an action";

  const known = ACTION_LABEL[action];
  if (known) return known;

  // "post.pin" reads as "post pin", sentence case, no invented verb.
  const plain = action.replace(/[._]/g, " ").trim();
  return plain.charAt(0).toUpperCase() + plain.slice(1);
};

/**
 * Only destinations that exist. An article log carries an id but no slug, and
 * there is no route by id, so the article link goes to the article list.
 */
const targetHref = (log: TAdminLog): string | null => {
  const type = (log.targetType || "").toLowerCase();

  if (!log.targetId) {
    if (type === "comment") return "/admin/manage-comments";
    if (type === "category") return "/admin/categories";
    return null;
  }

  if (type === "user" || type === "member") {
    return `/admin/manage-users/${encodeURIComponent(log.targetId)}`;
  }
  if (type === "article" || type === "blog") return "/admin/manage-blogs";
  if (type === "comment") return "/admin/manage-comments";
  if (type === "category") return "/admin/categories";
  if (type === "contact" || type === "message") {
    return `/admin/messages?message=${encodeURIComponent(log.targetId)}`;
  }

  return null;
};

const isMessage = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const dayKey = (date: Date) =>
  `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

const dayLabel = (value: string, now: Date) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Undated";

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const then = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const days = Math.round((today.getTime() - then.getTime()) / 86_400_000);

  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) {
    return date.toLocaleDateString("en-GB", { weekday: "long" });
  }

  const sameYear = date.getFullYear() === now.getFullYear();

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    ...(sameYear ? {} : { year: "numeric" }),
  });
};

const timeLabel = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * `GET /admin/logs` takes `limit` only. There is no page parameter, and page 2
 * of a request that cannot ask for it would be a fiction, so the screen tells
 * the reader exactly which slice of the log it is showing and how much older
 * material sits outside it.
 */
const LIMITS = [50, 100, 200] as const;

const ActivityLog = () => {
  const [limit, setLimit] = useState<number>(50);
  const [family, setFamily] = useState<Family>("all");
  const [refreshing, setRefreshing] = useState(false);

  const query = useAdminLogs(limit);
  const tablistRef = useRef<HTMLDivElement>(null);
  const baseId = useId();

  const response = query.data as
    | {
        success?: boolean;
        data?: TAdminLog[];
        meta?: TAdminMeta;
        message?: unknown;
      }
    | undefined;

  // Memoised so the three memos below have one stable dependency instead of a
  // fresh array each render.
  const rows = response?.data;
  const logs = useMemo<TAdminLog[]>(
    () => (Array.isArray(rows) ? rows : []),
    [rows],
  );

  const failed = !query.isLoading && !Array.isArray(response?.data);
  const meta = response?.meta;
  const total = meta?.total;
  const requested = numberOr(meta?.limit, limit);
  // The API serves `limit` at a time from a fixed offset of zero, so the
  // window is always the newest `requested` entries.
  const shown = Math.min(requested, logs.length);

  const visible = useMemo(
    () =>
      family === "all"
        ? logs
        : logs.filter((log) => familyOf(log.action || "") === family),
    [logs, family],
  );

  const counts = useMemo(() => {
    const tally: Record<Family, number> = {
      all: logs.length,
      content: 0,
      members: 0,
      messages: 0,
    };

    logs.forEach((log) => {
      const key = familyOf(log.action || "");
      if (key !== "all") tally[key] += 1;
    });

    return tally;
  }, [logs]);

  // "Today" and "Yesterday" are measured from the moment the list arrived, so
  // a re-render does not reshuffle the day headings, and the render stays pure.
  const loadedAt = query.dataUpdatedAt;
  const groups = useMemo(() => {
    const now = new Date(loadedAt);
    const buckets = new Map<string, { label: string; items: TAdminLog[] }>();

    visible.forEach((log) => {
      const date = new Date(log.createdAt);
      const key = Number.isNaN(date.getTime()) ? "unknown" : dayKey(date);
      const bucket = buckets.get(key);

      if (bucket) bucket.items.push(log);
      else {
        buckets.set(key, {
          label: dayLabel(log.createdAt, now),
          items: [log],
        });
      }
    });

    return Array.from(buckets.entries());
  }, [visible, loadedAt]);

  const onTabKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const index = Math.max(
      0,
      FAMILIES.findIndex((item) => item.key === family),
    );
    let next: number | undefined;

    if (event.key === "ArrowRight") next = (index + 1) % FAMILIES.length;
    else if (event.key === "ArrowLeft") {
      next = (index - 1 + FAMILIES.length) % FAMILIES.length;
    } else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = FAMILIES.length - 1;

    if (next === undefined) return;
    event.preventDefault();
    setFamily(FAMILIES[next].key);
    tablistRef.current
      ?.querySelectorAll<HTMLElement>('[role="tab"]')
      [next]?.focus();
  };

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await query.refetch();
    } finally {
      setRefreshing(false);
    }
  }, [query]);

  const familyLabel =
    FAMILIES.find((item) => item.key === family)?.label.toLowerCase() ?? "";

  const totalOfLog = typeof total === "number" ? total : undefined;
  const hidden = totalOfLog !== undefined ? Math.max(0, totalOfLog - shown) : 0;

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 border-b border-default/60 pb-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <div
            ref={tablistRef}
            role="tablist"
            aria-label="Filter the loaded log by kind"
            onKeyDown={onTabKeyDown}
            className="-mx-2 flex items-center gap-0.5 overflow-x-auto px-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {FAMILIES.map((item) => {
              const selected = family === item.key;
              const count = counts[item.key];

              return (
                <button
                  key={item.key}
                  id={`${baseId}-tab-${item.key}`}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setFamily(item.key)}
                  className={`inline-flex min-h-11 shrink-0 items-center gap-1.5 border-b-2 px-2.5 text-[0.8125rem] font-medium transition-colors sm:min-h-10 ${focusRing} ${
                    selected
                      ? "border-primary text-foreground"
                      : "border-transparent text-default-600 hover:text-foreground"
                  }`}
                >
                  {item.label}
                  {!query.isLoading && (
                    <span
                      className={`tabular-nums ${
                        selected
                          ? "text-primary-accessible"
                          : "text-default-600"
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <p className="mt-2 max-w-[70ch] text-xs leading-relaxed text-default-600">
            {query.isLoading
              ? "Loading recorded actions."
              : failed
                ? "The log did not load."
                : family === "all"
                  ? `Showing the newest ${shown.toLocaleString()} entries${
                      totalOfLog !== undefined
                        ? ` of ${totalOfLog.toLocaleString()} recorded`
                        : ""
                    }. The API serves this log as a single newest-first window, so there are no pages.`
                  : `${visible.length.toLocaleString()} of the newest ${logs.length.toLocaleString()} entries are ${familyLabel}. The kind filter runs in this browser and covers only the loaded window, not the whole log.`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <ListSelect
            label="Show"
            value={limit}
            onChange={(value) => {
              setLimit(Number(value) || LIMITS[0]);
              setFamily("all");
            }}
            options={LIMITS.map((value) => ({
              value,
              label: `${value} entries`,
            }))}
          />

          <button
            type="button"
            onClick={refresh}
            disabled={refreshing}
            aria-busy={refreshing || undefined}
            className={`${quietButton} gap-1.5`}
          >
            <FiRefreshCw
              aria-hidden
              className={`size-4 ${refreshing ? "animate-spin" : ""}`}
            />
            {refreshing ? "Refreshing" : "Refresh"}
          </button>
        </div>
      </div>

      {query.isLoading && (
        <div className="space-y-6" aria-busy="true">
          {Array.from({ length: 2 }).map((_, group) => (
            <div key={group} className="space-y-3">
              <div className="mb-2 h-3 w-24 animate-pulse rounded bg-default-100" />
              <div className="divide-y divide-default/60">
                {Array.from({ length: 3 }).map((_, row) => (
                  <div key={row} className="flex items-start gap-3 py-3.5">
                    <div className="size-8 shrink-0 animate-pulse rounded-full bg-default-100" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-2/3 animate-pulse rounded bg-default-100" />
                      <div className="h-3 w-40 animate-pulse rounded bg-default-100" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <p className="sr-only" role="status">
            Loading the activity log
          </p>
        </div>
      )}

      {failed && (
        <EmptyState
          icon={<PiNotePencil className="size-5" />}
          title="The activity log did not load"
          description={
            (isMessage(response?.message) && response.message) ||
            "The request to the API failed. Try again, and if it keeps failing check that the API is reachable."
          }
          action={
            <button type="button" onClick={refresh} className={quietButton}>
              Try again
            </button>
          }
        />
      )}

      {!query.isLoading && !failed && logs.length === 0 && (
        <EmptyState
          icon={<PiNotePencil className="size-5" />}
          title="No admin actions recorded yet"
          description="Deleting an article, moderating a comment or changing a member writes the first entry here. The API records it as it happens."
        />
      )}

      {!query.isLoading &&
        !failed &&
        logs.length > 0 &&
        visible.length === 0 && (
          <EmptyState
            icon={<PiNotePencil className="size-5" />}
            title="Nothing of that kind in the loaded entries"
            description={`The newest ${logs.length.toLocaleString()} entries hold no ${familyLabel}. Raise the limit or switch back to everything.`}
            action={
              <button
                type="button"
                onClick={() => setFamily("all")}
                className={quietButton}
              >
                Show everything
              </button>
            }
          />
        )}

      {groups.map(([key, group]) => (
        <section key={key} className="mt-6 first:mt-0" aria-label={group.label}>
          <h2 className="sticky top-0 z-10 -mx-1 flex items-baseline justify-between gap-3 border-b border-default/60 bg-background px-1 py-2">
            <span className="tth-label">{group.label}</span>
            <span className="text-[0.6875rem] tabular-nums text-default-600">
              {group.items.length}{" "}
              {group.items.length === 1 ? "action" : "actions"}
            </span>
          </h2>

          <ol>
            {group.items.map((log) => {
              const href = targetHref(log);
              const actor = log.admin;
              const name = actor?.fullName || "Unknown admin";

              return (
                <li
                  key={log._id}
                  className="flex items-start gap-3 border-b border-default/60 py-3.5 last:border-b-0"
                >
                  <Avatar
                    src={actor?.profilePicture}
                    size="sm"
                    className="mt-0.5 size-8 shrink-0"
                    name={name.charAt(0).toUpperCase()}
                    aria-hidden
                  />

                  <div className="min-w-0 flex-1">
                    <p className="break-words text-sm leading-relaxed">
                      <span className="font-medium">{name}</span>
                      {actor?.username && (
                        <span className="text-default-600">
                          {" "}
                          @{actor.username}
                        </span>
                      )}
                      <span className="text-default-600"> </span>
                      <span className="font-medium">
                        {actionLabel(log.action).toLowerCase()}
                      </span>
                      {log.summary && (
                        <span className="text-default-600">
                          {" "}
                          {log.summary.charAt(0).toLowerCase() +
                            log.summary.slice(1)}
                        </span>
                      )}
                    </p>

                    <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-default-600">
                      <time
                        dateTime={isoDate(log.createdAt) ?? undefined}
                        title={formatExact(log.createdAt)}
                        className="tabular-nums"
                      >
                        {formatRelative(log.createdAt) || "Time unknown"}
                      </time>
                      <span aria-hidden>·</span>
                      <span>{log.action || "action"}</span>
                      {href && (
                        <>
                          <span aria-hidden>·</span>
                          <Link
                            href={href}
                            className={`inline-flex min-h-11 items-center rounded-sm font-medium text-primary-accessible underline-offset-4 hover:underline sm:min-h-0 ${focusRing}`}
                          >
                            Open
                            {log.targetType
                              ? ` ${log.targetType.toLowerCase()}`
                              : ""}
                          </Link>
                        </>
                      )}
                    </p>
                  </div>

                  <time
                    dateTime={isoDate(log.createdAt) ?? undefined}
                    title={formatExact(log.createdAt)}
                    className="hidden shrink-0 text-xs tabular-nums text-default-700 sm:block"
                  >
                    {timeLabel(log.createdAt)}
                  </time>
                </li>
              );
            })}
          </ol>
        </section>
      ))}

      {!query.isLoading && !failed && logs.length > 0 && (
        <p className="mt-6 border-t border-default/60 pt-3 text-xs leading-relaxed text-default-600">
          {hidden > 0
            ? `${hidden.toLocaleString()} older ${hidden === 1 ? "entry is" : "entries are"} outside this window. The API does not page this log, so raise the limit to see more of it.`
            : `This is the whole log: all ${shown.toLocaleString()} recorded ${shown === 1 ? "entry" : "entries"}. The API serves it as one newest-first window with no pages.`}
        </p>
      )}

      {query.isFetching && !query.isLoading && (
        <p className="sr-only" role="status">
          Refreshing the activity log
        </p>
      )}
    </div>
  );
};

export { actionLabel, targetHref };
export default ActivityLog;
