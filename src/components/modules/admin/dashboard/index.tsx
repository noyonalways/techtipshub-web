"use client";

import AdminActivityChart, {
  adminChartColours,
} from "@/components/modules/admin/kit/activity-chart";
import {
  dayRange,
  longDay,
  shortDay,
} from "@/components/modules/admin/kit/chart-format";
import EmptyState from "@/components/modules/admin/kit/empty-state";
import StatTile, {
  type StatDelta,
} from "@/components/modules/admin/kit/stat-tile";
import { focusRing } from "@/components/modules/admin/kit/tau";
import { useAdminActivity, useAdminOverview } from "@/hooks/admin-overview";
import type {
  IAdminActivityPoint,
  IAdminChange,
  IAdminOverview,
  IAdminRecentItem,
} from "@/types";
import { Avatar, Skeleton } from "@heroui/react";
import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import { FiChevronRight } from "react-icons/fi";
import {
  RiArrowRightLine,
  RiExternalLinkLine,
  RiRefreshLine,
} from "react-icons/ri";

/**
 * Screen job: answer "is the site healthy this week, and what does it need from
 * me before I leave?" That decision owns the hierarchy. The headline row gives
 * the week its scale, the activity chart is the one focal point, and the rail
 * holds the two lists an admin acts from: which articles are working, and who
 * is writing them.
 */

const RANGES = [
  { days: 14, label: "14 days" },
  { days: 30, label: "30 days" },
  { days: 90, label: "90 days" },
] as const;

type RangeDays = (typeof RANGES)[number]["days"];

const SOURCE_NOTE = "From the admin overview, computed at request time (UTC).";

const isNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const format = (value?: number) =>
  isNumber(value) ? value.toLocaleString() : "Not reported";

const formatExact = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * A panel on the admin page. `content1` is the theme's surface token: white in
 * the light theme, the raised charcoal step in the dark one. The page behind
 * it keeps the site's warm paper, so the panel reads as a sheet on it.
 */
const Panel = ({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) => (
  <section
    className={`rounded-[10px] border border-default/70 bg-content-1 ${className}`}
  >
    {children}
  </section>
);

const formatRelative = (value?: string) => {
  if (!value) return "";
  const time = new Date(value).getTime();
  if (Number.isNaN(time)) return "";

  const minutes = Math.round((Date.now() - time) / 60_000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;

  const days = Math.round(hours / 24);
  if (days < 7) return `${days} d ago`;

  const date = new Date(time);

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
  });
};

const todayLabel = () =>
  new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

/**
 * The API's `weekStat` already decides the trend type, so the tile keeps its
 * arrow instead of guessing from the sign (a zero-base week can report
 * "100.00%" after a dip).
 */
const deltaOf = (change?: IAdminChange): StatDelta | undefined => {
  if (!change || typeof change.change !== "string") return undefined;

  const label = change.change.trim();
  if (!label) return undefined;

  const trend =
    change.type === "increase"
      ? "up"
      : change.type === "decrease"
        ? "down"
        : "flat";

  // `weekStat` formats an increase as a bare number ("25.00%"), so the plus
  // sign is added here; it also keeps the arrow and the number agreeing.
  const signed = trend === "up" && !label.startsWith("+") ? `+${label}` : label;

  return { value: signed, trend };
};

const weekHint = (change?: IAdminChange) => {
  if (!change || !isNumber(change.value)) return "last 7 days not reported";
  return `${change.value.toLocaleString()} in the last 7 days`;
};

const count = (value: unknown) => {
  const raw = typeof value === "number" ? value : Number(value);
  return Number.isFinite(raw) ? raw : undefined;
};

/* ------------------------------------------------------------------ pieces */

const SectionHeading = ({
  title,
  description,
  aside,
}: {
  title: string;
  description?: string;
  aside?: ReactNode;
}) => (
  <div className="mb-3 flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
    <div className="min-w-0">
      <h2 className="font-[family-name:var(--type-editorial)] text-[1.0625rem] font-semibold tracking-[-0.01em]">
        {title}
      </h2>
      {description && (
        <p className="mt-0.5 max-w-prose text-xs leading-relaxed text-default-600">
          {description}
        </p>
      )}
    </div>
    {aside && <div className="shrink-0">{aside}</div>}
  </div>
);

const QuietLink = ({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) => (
  <Link
    href={href}
    className={`inline-flex min-h-11 items-center gap-1 rounded-md text-xs font-medium text-default-700 transition-colors hover:text-primary-accessible sm:min-h-8 ${focusRing}`}
  >
    {children}
    <FiChevronRight aria-hidden className="size-3.5" />
  </Link>
);

const RetryButton = ({
  onRetry,
  label = "Try again",
}: {
  onRetry: () => void;
  label?: string;
}) => (
  <button
    type="button"
    onClick={onRetry}
    className={`inline-flex min-h-11 items-center gap-1.5 rounded-md border border-default-300 px-3.5 text-sm font-medium text-foreground transition-colors hover:bg-default-100 sm:min-h-9 ${focusRing}`}
  >
    <RiRefreshLine aria-hidden className="size-4" />
    {label}
  </button>
);

const PanelSkeleton = ({ rows = 4 }: { rows?: number }) => (
  <div className="space-y-3 px-4 py-4" aria-hidden>
    {Array.from({ length: rows }).map((_, index) => (
      <div key={index} className="flex items-center gap-3">
        <Skeleton className="size-8 shrink-0 rounded-md" />
        <div className="min-w-0 flex-1 space-y-1.5">
          <Skeleton className="h-3 w-4/5 rounded" />
          <Skeleton className="h-2.5 w-2/5 rounded" />
        </div>
      </div>
    ))}
  </div>
);

const DashboardSkeleton = () => (
  <div className="space-y-8" role="status">
    <span className="sr-only">Loading the dashboard</span>

    <div className="overflow-hidden rounded-[10px] border border-default/70">
      <div className="grid grid-cols-2 divide-x divide-y divide-default/70 sm:grid-cols-4 sm:divide-y-0">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="space-y-3 p-4">
            <Skeleton className="h-3 w-24 rounded" />
            <Skeleton className="h-7 w-16 rounded" />
            <Skeleton className="h-3 w-28 rounded" />
          </div>
        ))}
      </div>
    </div>

    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="space-y-6">
        <div className="rounded-[10px] border border-default/70 p-4 sm:p-5">
          <Skeleton className="h-4 w-48 rounded" />
          <Skeleton className="mt-2 h-3 w-64 rounded" />
          <Skeleton className="mt-5 h-60 w-full rounded-md" />
        </div>
        <PanelSkeleton rows={5} />
      </div>
      <div className="space-y-6">
        <PanelSkeleton />
        <PanelSkeleton />
      </div>
    </div>
  </div>
);

/* ------------------------------------------------------------------ blocks */

const TrendSpark = ({ points }: { points: number[] }) => {
  const values = points.length > 1 ? points : [0, 0];
  const [min, max] = [Math.min(...values), Math.max(...values)];
  const steps = values.length - 1;
  const path = values
    .map((value, index) => {
      const x = (index / steps) * 100;
      const y =
        20 - (max === min ? 10 : ((value - min) / (max - min)) * 18) - 1;
      return `${index === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg
      viewBox="0 0 100 20"
      preserveAspectRatio="none"
      aria-hidden
      className="h-5 w-16 text-primary-accessible"
    >
      <path
        d={path}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
};

const ActivityBlock = ({
  points,
  days,
  loading,
  failed,
  onRetry,
}: {
  points: IAdminActivityPoint[];
  days: RangeDays;
  loading: boolean;
  failed: boolean;
  onRetry: () => void;
}) => {
  // Every row the API sends becomes one point. Labels are human ("3 Oct"),
  // and the tooltip title is the full date.
  const chartData = points.map((point) => ({
    key: point.date,
    label: shortDay(point.date),
    title: longDay(point.date),
    views: point.views ?? 0,
    comments: point.comments ?? 0,
  }));

  const totals = points.reduce(
    (sum, point) => ({
      views: sum.views + (point.views ?? 0),
      comments: sum.comments + (point.comments ?? 0),
    }),
    { views: 0, comments: 0 },
  );

  const hasSignal = totals.views + totals.comments > 0;
  const rangeText = dayRange(points[0]?.date, points.at(-1)?.date);

  return (
    <Panel className="min-w-0 p-4 sm:p-5">
      <SectionHeading
        title="Reading and discussion, by day"
        description={`Views and comments recorded in the last ${days} days, day by day.`}
        aside={
          !failed && !loading && points.length > 0 ? (
            <dl className="flex items-center gap-4 text-xs">
              <div className="text-right">
                <dt className="text-default-600">Views</dt>
                <dd className="font-medium tabular-nums">
                  {totals.views.toLocaleString("en-GB")}
                </dd>
              </div>
              <div className="text-right">
                <dt className="text-default-600">Comments</dt>
                <dd className="font-medium tabular-nums">
                  {totals.comments.toLocaleString("en-GB")}
                </dd>
              </div>
            </dl>
          ) : null
        }
      />

      {failed ? (
        <EmptyState
          variant="inline"
          title="Activity could not be loaded"
          description="The activity endpoint did not answer. The rest of the dashboard is still usable; retry just this chart."
          action={<RetryButton onRetry={onRetry} label="Retry chart" />}
        />
      ) : loading ? (
        <>
          <span className="sr-only">Loading daily activity</span>
          <Skeleton className="h-64 w-full rounded-md" />
        </>
      ) : points.length === 0 ? (
        <EmptyState
          variant="inline"
          title="No activity recorded yet"
          description="Views and comments appear here as readers arrive. Publish or share an article to start the series."
          action={
            <Link
              href="/admin/manage-blogs"
              className={`inline-flex min-h-11 items-center rounded-md border border-default-300 px-3.5 text-sm font-medium hover:bg-default-100 sm:min-h-9 ${focusRing}`}
            >
              Open articles
            </Link>
          }
        />
      ) : (
        <>
          <AdminActivityChart
            data={chartData}
            height={256}
            summary="Views and comments per day"
            showLegend
            series={[
              {
                key: "views",
                label: "Views",
                color: adminChartColours.primary,
              },
              {
                key: "comments",
                label: "Comments",
                color: adminChartColours.foreground,
              },
            ]}
          />
          <p className="mt-2 text-xs tabular-nums text-default-600">
            {rangeText}
            {hasSignal
              ? ""
              : ". No views or comments were recorded in this range, so the lines stay at zero."}
          </p>
        </>
      )}
    </Panel>
  );
};

const TYPE_LABEL: Record<IAdminRecentItem["type"], string> = {
  blog: "Article published",
  member: "Member joined",
  comment: "Comment",
};

const TYPE_TINT: Record<IAdminRecentItem["type"], string> = {
  blog: "bg-primary/15 text-primary-accessible",
  member: "bg-success/15 text-success-700 dark:text-success",
  comment: "bg-default-200 text-default-700",
};

const RecentBlock = ({
  items,
  loading,
  failed,
  onRetry,
}: {
  items: IAdminRecentItem[];
  loading: boolean;
  failed: boolean;
  onRetry: () => void;
}) => {
  const shown = items.slice(0, 6);

  return (
    <Panel>
      <div className="px-4 pt-4 sm:px-5">
        <SectionHeading
          title="Latest activity"
          description="The most recent articles, joins and comments, mixed."
          aside={<QuietLink href="/admin/activity-log">Full log</QuietLink>}
        />
      </div>

      {failed ? (
        <EmptyState
          variant="inline"
          title="Activity could not be loaded"
          description="The dashboard data did not arrive. Try the request once more."
          action={<RetryButton onRetry={onRetry} />}
        />
      ) : loading ? (
        <PanelSkeleton rows={4} />
      ) : shown.length === 0 ? (
        <EmptyState
          variant="inline"
          title="Nothing has happened yet"
          description="Publishing an article or welcoming a member will show up here."
          action={
            <Link
              href="/admin/moderation"
              className={`inline-flex min-h-11 items-center rounded-md border border-default-300 px-3.5 text-sm font-medium hover:bg-default-100 sm:min-h-9 ${focusRing}`}
            >
              Open moderation
            </Link>
          }
        />
      ) : (
        <ul className="divide-y divide-default/60 border-t border-default/60">
          {shown.map((item) => {
            const actor = item.actor?.fullName || item.actor?.username;
            const label = TYPE_LABEL[item.type] ?? "Activity";

            return (
              <li
                key={`${item.type}-${item.id}`}
                className="flex items-start gap-3 px-4 py-2.5 transition-colors hover:bg-default-50/70 sm:px-5"
              >
                <span
                  aria-hidden
                  className={`mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-md text-[0.625rem] font-semibold ${
                    TYPE_TINT[item.type] ?? TYPE_TINT.comment
                  }`}
                >
                  {item.type === "blog"
                    ? "AR"
                    : item.type === "member"
                      ? "MB"
                      : "CO"}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-baseline gap-x-2 text-sm">
                    <span className="text-xs font-medium text-default-600">
                      {label}
                    </span>
                    {item.href ? (
                      <Link
                        href={item.href}
                        className={`min-w-0 truncate rounded-sm font-medium hover:text-primary-accessible ${focusRing}`}
                      >
                        {item.title || "Untitled"}
                      </Link>
                    ) : (
                      <span className="min-w-0 truncate font-medium">
                        {item.title || "Untitled"}
                      </span>
                    )}
                  </p>
                  {item.excerpt && (
                    <p className="mt-0.5 line-clamp-1 text-xs text-default-600">
                      {item.excerpt}
                    </p>
                  )}
                  <p className="mt-0.5 text-xs text-default-600">
                    {actor ? `${actor} · ` : ""}
                    <time
                      dateTime={item.createdAt}
                      title={formatExact(item.createdAt)}
                    >
                      {formatRelative(item.createdAt)}
                    </time>
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
};

const TopArticlesList = ({
  articles,
  loading,
}: {
  articles: IAdminOverview["topArticles"];
  loading: boolean;
}) => {
  const rows = Array.isArray(articles) ? articles.slice(0, 5) : [];

  return (
    <Panel className="overflow-hidden">
      <div className="border-b border-default/60 px-4 py-3">
        <SectionHeading title="Most read articles" />
      </div>

      {loading ? (
        <PanelSkeleton rows={4} />
      ) : rows.length === 0 ? (
        <EmptyState
          variant="inline"
          title="No article has a read yet"
          description="The five most read pieces appear here once readers open them."
        />
      ) : (
        <ol className="divide-y divide-default/60">
          {rows.map((article, index) => (
            <li key={article._id}>
              <Link
                href={`/blogs/${article.slug}`}
                className={`group flex items-start gap-3 px-4 py-2.5 transition-colors hover:bg-default-50 ${focusRing}`}
              >
                <span
                  aria-hidden
                  className="w-4 shrink-0 pt-0.5 text-xs font-semibold tabular-nums text-default-600"
                >
                  {index + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="line-clamp-2 text-sm font-medium leading-snug group-hover:text-primary-accessible">
                    {article.title}
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-default-600">
                    {article.author?.fullName?.trim()
                      ? article.author.fullName
                      : "Author not recorded"}
                  </span>
                </span>
                <span className="shrink-0 text-right text-xs tabular-nums text-default-700">
                  {format(article.totalViews)}
                  <span className="block text-default-600">views</span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      )}

      <div className="border-t border-default/60 px-2 py-1">
        <QuietLink href="/admin/analytics">All articles in analytics</QuietLink>
      </div>
    </Panel>
  );
};

const ContributorsList = ({
  contributors,
  loading,
}: {
  contributors: IAdminOverview["topContributors"];
  loading: boolean;
}) => {
  const rows = Array.isArray(contributors) ? contributors.slice(0, 5) : [];

  return (
    <Panel className="overflow-hidden">
      <div className="border-b border-default/60 px-4 py-3">
        <SectionHeading title="Top contributors, last 30 days" />
      </div>

      {loading ? (
        <PanelSkeleton rows={4} />
      ) : rows.length === 0 ? (
        <EmptyState
          variant="inline"
          title="No articles in the last 30 days"
          description="Writers appear here ranked by how many pieces they published this month."
        />
      ) : (
        <ol className="divide-y divide-default/60">
          {rows.map((person, index) => {
            const name =
              person.fullName?.trim() ||
              (person.username ? `@${person.username}` : "Unknown member");

            return (
              <li key={person._id}>
                <Link
                  href={`/admin/manage-users/${person._id}`}
                  className={`flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-default-50 ${focusRing}`}
                >
                  <span
                    aria-hidden
                    className="w-4 shrink-0 text-xs font-semibold tabular-nums text-default-600"
                  >
                    {index + 1}
                  </span>
                  <Avatar
                    src={person.profilePicture || undefined}
                    name={name.charAt(0).toUpperCase()}
                    className="size-7 shrink-0"
                    classNames={{ name: "text-xs" }}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">
                      {name}
                    </span>
                    <span className="block truncate text-xs text-default-600">
                      {format(person.totalViews)} views
                    </span>
                  </span>
                  <span className="shrink-0 text-right text-xs tabular-nums text-default-700">
                    {format(person.published)}
                    <span className="block text-default-600">
                      {person.published === 1 ? "article" : "articles"}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      )}

      <div className="border-t border-default/60 px-2 py-1">
        <QuietLink href="/admin/manage-users">All members</QuietLink>
      </div>
    </Panel>
  );
};

const HealthRow = ({
  href,
  label,
  value,
  question,
}: {
  href: string;
  label: string;
  value?: number;
  question: string;
}) => (
  <li>
    <Link
      href={href}
      className={`flex min-h-11 items-center justify-between gap-3 rounded-md px-2 py-2 transition-colors hover:bg-default-50 ${focusRing}`}
    >
      <span className="min-w-0">
        <span className="block text-sm font-medium">{label}</span>
        <span className="mt-0.5 block text-xs text-default-600">
          {question}
        </span>
      </span>
      <span className="flex shrink-0 items-center gap-1 text-sm font-medium tabular-nums">
        {format(value)}
        <RiArrowRightLine aria-hidden className="size-3.5 text-default-400" />
      </span>
    </Link>
  </li>
);

const HealthBlock = ({
  pending,
  health,
  loading,
}: {
  pending: IAdminOverview["pending"];
  health: IAdminOverview["health"];
  loading: boolean;
}) => {
  const emptyCategories = count(health?.emptyCategories);
  const zeroViewArticles = count(health?.zeroViewArticles);

  const rows = [
    {
      key: "comments",
      href: "/admin/manage-comments",
      label: "New comments, last 7 days",
      question: "Read the discussion and remove what breaks the rules.",
      value: count(pending?.commentsLast7Days),
    },
    {
      key: "articles",
      href: "/admin/moderation",
      label: "Articles published, last 7 days",
      question: "Check the newest pieces while they are still fresh.",
      value: count(pending?.articlesLast7Days),
    },
    {
      key: "members",
      href: "/admin/manage-users",
      label: "Members joined, last 7 days",
      question: "Confirm the new accounts look real before they post.",
      value: count(pending?.newMembersLast7Days),
    },
    {
      key: "empty-categories",
      href: "/admin/categories",
      label: "Categories with no articles",
      question: "Merge or remove topics that have nothing in them.",
      value: emptyCategories,
    },
    {
      key: "zero-views",
      // The articles table cannot sort ascending, so the honest destination is
      // the whole list, where its "No reads" tab opens the zero-read rows.
      href: "/admin/manage-blogs",
      label: "Articles with no reads",
      question: "Older pieces nobody opened. Fix titles or retire them.",
      value: zeroViewArticles,
    },
  ];

  return (
    <Panel>
      <div className="px-3 pt-4 sm:px-4">
        <SectionHeading
          title="Worth a look"
          description="Counts the API reports on this screen, each linking to where you act on it."
        />
      </div>

      {loading ? (
        <PanelSkeleton rows={4} />
      ) : (
        <ul className="space-y-0.5 border-t border-default/60 px-1 py-1.5 sm:px-2">
          {rows.map((row) => (
            <HealthRow
              key={row.key}
              href={row.href}
              label={row.label}
              question={row.question}
              value={row.value}
            />
          ))}
        </ul>
      )}
    </Panel>
  );
};

/* ------------------------------------------------------------------ screen */

export default function AdminDashboard() {
  const [days, setDays] = useState<RangeDays>(30);

  const overviewQuery = useAdminOverview();
  const activityQuery = useAdminActivity(days);

  const overview = useMemo(() => {
    const payload = overviewQuery.data as
      { success?: boolean; data?: IAdminOverview } | undefined;
    if (!payload || payload.success === false) return undefined;
    return payload.data;
  }, [overviewQuery.data]);

  const activity = useMemo(() => {
    const payload = activityQuery.data as
      { success?: boolean; data?: IAdminActivityPoint[] } | undefined;
    if (!payload || payload.success === false) return undefined;
    return Array.isArray(payload.data) ? payload.data : undefined;
  }, [activityQuery.data]);

  const overviewFailed =
    overviewQuery.isError ||
    (overviewQuery.data !== undefined && overview === undefined);
  const overviewLoading = overviewQuery.isLoading && overview === undefined;

  if (overviewLoading) return <DashboardSkeleton />;

  if (overviewFailed || !overview) {
    const message = (overviewQuery.data as { message?: string } | undefined)
      ?.message;

    return (
      <EmptyState
        title="The dashboard could not load"
        description={
          message ||
          "The admin overview did not answer. Check that the API is running, then load it again."
        }
        action={
          <div className="flex flex-wrap items-center justify-center gap-2">
            <RetryButton
              onRetry={() => {
                void overviewQuery.refetch();
                void activityQuery.refetch();
              }}
              label="Load the dashboard"
            />
            <Link
              href="/admin/manage-blogs"
              className={`inline-flex min-h-11 items-center rounded-md px-3.5 text-sm font-medium text-default-700 transition-colors hover:bg-default-100 sm:min-h-9 ${focusRing}`}
            >
              Go to articles instead
            </Link>
          </div>
        }
      />
    );
  }

  const today = overview.today;
  const week = overview.week;

  const headline = [
    {
      key: "views",
      label: "Views this week",
      value: format(week?.views?.value),
      hint: weekHint(week?.views),
      delta: deltaOf(week?.views),
      href: "/admin/analytics",
    },
    {
      key: "comments",
      label: "Comments this week",
      value: format(week?.comments?.value),
      hint: weekHint(week?.comments),
      delta: deltaOf(week?.comments),
      href: "/admin/manage-comments",
    },
    {
      key: "members",
      label: "Members joined this week",
      value: format(week?.newMembers?.value),
      hint: weekHint(week?.newMembers),
      delta: deltaOf(week?.newMembers),
      href: "/admin/manage-users",
    },
    {
      key: "upvotes",
      label: "Upvotes today",
      value: format(today?.upvotes),
      hint: isNumber(today?.views)
        ? `${format(today?.views)} views today`
        : "views today not reported",
      href: "/admin/analytics",
    },
  ];

  const points = activity ?? [];

  const readingTotals = points.map((point) => point.views);

  return (
    <div className="space-y-8">
      <section aria-labelledby="week-heading">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
          <div>
            <h2
              id="week-heading"
              className="font-[family-name:var(--type-editorial)] text-[1.0625rem] font-semibold tracking-[-0.01em]"
            >
              This week
            </h2>
            <p className="mt-0.5 text-xs text-default-600">
              {todayLabel()}. Each figure compares the seven days to Monday with
              the week before.
            </p>
          </div>

          {readingTotals.length > 1 ? (
            <TrendSpark points={readingTotals} />
          ) : null}
        </div>

        <div className="grid grid-cols-2 divide-x divide-y divide-default/70 overflow-hidden rounded-[10px] border border-default/70 sm:grid-cols-4 sm:divide-y-0">
          {headline.map((metric, index) => (
            <div
              key={metric.key}
              className={`min-w-0 ${
                index >= 2 ? "border-t border-default/70 sm:border-t-0" : ""
              }`}
            >
              <StatTile
                label={metric.label}
                value={metric.value}
                hint={metric.hint}
                delta={metric.delta}
                href={metric.href}
              />
            </div>
          ))}
        </div>

        <p className="mt-2 text-xs text-default-600">{SOURCE_NOTE}</p>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0 space-y-6">
          <div className="min-w-0">
            <div
              role="group"
              aria-label="Activity range"
              className="mb-3 inline-flex items-center gap-0.5 rounded-md border border-default/70 p-0.5"
            >
              {RANGES.map((option) => {
                const selected = option.days === days;
                return (
                  <button
                    key={option.days}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setDays(option.days)}
                    className={`inline-flex min-h-11 items-center rounded-[5px] px-2.5 text-xs font-medium transition-colors sm:min-h-7 ${focusRing} ${
                      selected
                        ? "bg-primary/10 text-primary-accessible"
                        : "text-default-600 hover:bg-default-100 hover:text-foreground"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>

            <ActivityBlock
              points={points}
              days={days}
              loading={activityQuery.isLoading}
              failed={activityQuery.isError}
              onRetry={() => void activityQuery.refetch()}
            />
          </div>

          <RecentBlock
            items={Array.isArray(overview.recent) ? overview.recent : []}
            loading={false}
            failed={false}
            onRetry={() => void overviewQuery.refetch()}
          />
        </div>

        <aside
          className="min-w-0 space-y-6"
          aria-label="Articles, members and things worth a look"
        >
          <TopArticlesList articles={overview.topArticles} loading={false} />
          <ContributorsList
            contributors={overview.topContributors}
            loading={false}
          />
          <HealthBlock
            pending={overview.pending}
            health={overview.health}
            loading={false}
          />

          <p>
            <Link
              href="/admin/activity-log"
              className={`inline-flex min-h-11 items-center gap-1.5 rounded-md text-xs font-medium text-default-700 hover:text-primary-accessible sm:min-h-8 ${focusRing}`}
            >
              Open the activity log
              <RiExternalLinkLine aria-hidden className="size-3.5" />
            </Link>
          </p>
        </aside>
      </div>
    </div>
  );
}
