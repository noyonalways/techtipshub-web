"use client";

import BlockError, { RetryButton } from "@/components/admin/block-error";
import { formatCount, initialsOf, plural } from "@/components/admin/format";
import {
  AdminActivityChart,
  adminChartColours,
  EmptyState,
  StatTile,
  type AdminChartSeries,
  type StatDelta,
} from "@/components/modules/admin/kit";
import { focusRing } from "@/components/modules/admin/kit/tau";
import SectionCard from "@/components/modules/admin/section-card";
import { useAdminActivity, useAdminOverview } from "@/hooks/admin-overview";
import type {
  IAdminActivityPoint,
  IAdminChange,
  IAdminOverview,
  IAdminTopArticle,
  IAdminTopContributor,
} from "@/types";
import { Avatar, Skeleton } from "@heroui/react";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { RiBarChartLine } from "react-icons/ri";

/**
 * `/admin/overview` answers `{ success, data: overview }` and `/admin/activity`
 * answers one point per day for the days asked for. Both endpoints resolve, so
 * a failure arrives here as `success: false` and every read goes through
 * `unwrapData`.
 */
const unwrapData = <T,>(response: unknown): T | undefined => {
  const payload = response as { success?: boolean; data?: T } | undefined;
  if (!payload || payload.success === false) return undefined;
  return payload.data;
};

const messageOf = (response: unknown, fallback: string) => {
  const payload = response as { message?: string } | undefined;
  return payload?.message || fallback;
};

const RANGES = [
  { days: 14, label: "14 days" },
  { days: 30, label: "30 days" },
  { days: 90, label: "90 days" },
] as const;

type Range = (typeof RANGES)[number]["days"];

/** Views carry the accent; comments stay neutral, so the comparison reads second. */
const SERIES: AdminChartSeries[] = [
  { key: "views", label: "Views", color: adminChartColours.primary },
  { key: "comments", label: "Comments", color: adminChartColours.foreground },
];

/** `YYYY-MM-DD` from the API is a UTC day, so it is formatted in UTC. */
const dayOf = (value: string) => {
  const date = new Date(`${value.slice(0, 10)}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? undefined : date;
};

const shortDate = (value: string) => {
  const date = dayOf(value);
  if (!date) return value;

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    timeZone: "UTC",
  });
};

const longDate = (value?: string) => {
  const date = value ? dayOf(value) : undefined;
  if (!date) return "";

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
};

const shareOfVotes = (up?: number, down?: number) => {
  const total = (up ?? 0) + (down ?? 0);
  if (total === 0) return undefined;
  return Math.round(((up ?? 0) / total) * 100);
};

const HEALTH_LABELS: Record<string, string> = {
  emptyCategories: "Categories with no published articles",
  zeroViewArticles: "Published articles with no views yet",
};

const prettifyKey = (key: string) =>
  key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .toLowerCase()
    .replace(/^./, (char) => char.toUpperCase());

const countLabel = (value?: number, singular = "article") =>
  typeof value === "number" && Number.isFinite(value)
    ? `${formatCount(value)} ${value === 1 ? singular : `${singular}s`}`
    : undefined;

/**
 * The overview's `weekStat` already decides the trend type, so the tile keeps
 * its arrow instead of guessing from the sign (a zero-base week can report
 * "100.00%" after a dip).
 */
const deltaOf = (change?: IAdminChange): StatDelta | undefined => {
  if (!change) return undefined;

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
  if (!change || typeof change.value !== "number") {
    return "the last 7 days not reported";
  }
  return `${formatCount(change.value)} in the last 7 days`;
};

const todayLabel = () =>
  new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

/** Where every figure on this page comes from, stated once under the tiles. */
const SOURCE_NOTE = "From the admin overview, computed at request time (UTC).";

const NotReported = () => (
  <span className="text-lg text-default-600">Not reported</span>
);

/** A rounded bar that shows a figure as a share of the top row. The number is
 * always printed beside it, so the bar is not the only signal. */
const RankBar = ({ share }: { share: number }) => (
  <span
    aria-hidden
    className="mt-1.5 block h-1 w-full rounded-full bg-default-100"
  >
    <span
      className="block h-1 rounded-full bg-primary"
      style={{ width: `${Math.max(2, Math.round(share * 100))}%` }}
    />
  </span>
);

const BlockSkeleton = ({ rows = 3 }: { rows?: number }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, index) => (
      <div key={index} className="flex items-center gap-3">
        <Skeleton className="size-7 shrink-0 rounded-full" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-3.5 w-2/3 rounded" />
          <Skeleton className="h-3 w-1/3 rounded" />
        </div>
      </div>
    ))}
  </div>
);

const TopArticles = ({
  articles,
  isLoading,
  isError,
  onRetry,
}: {
  articles: IAdminTopArticle[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}) => {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-9 w-full rounded-md" />
        ))}
        <p className="sr-only" role="status">
          Loading the article ranking
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <BlockError
        title="Top articles could not be loaded"
        description="The overview request failed, so the ranking has no data."
        action={<RetryButton onClick={onRetry} />}
      />
    );
  }

  if (articles.length === 0) {
    return (
      <EmptyState
        variant="inline"
        title="No ranked articles yet"
        description="This list ranks published articles by all-time reads. It fills in once readers arrive."
        action={
          <Link
            href="/admin/manage-blogs"
            className={`rounded text-sm font-medium text-primary-accessible underline-offset-4 hover:underline ${focusRing}`}
          >
            Open article management
          </Link>
        }
      />
    );
  }

  const top = Math.max(
    ...articles.map((article) => article.totalViews ?? 0),
    1,
  );

  return (
    <ol className="divide-y divide-default/60">
      {articles.map((article, index) => {
        const share = shareOfVotes(article.upVotes, article.downVotes);
        const views = article.totalViews ?? 0;

        return (
          <li
            key={article._id}
            className="flex items-start gap-3 py-3 first:pt-1 last:pb-1"
          >
            <span
              aria-hidden
              className="w-5 shrink-0 pt-0.5 text-right text-xs font-semibold tabular-nums text-default-600"
            >
              {index + 1}
            </span>

            <div className="min-w-0 flex-1">
              {article.slug ? (
                <Link
                  href={`/blogs/${article.slug}`}
                  className={`line-clamp-2 rounded font-medium leading-snug underline-offset-4 hover:underline ${focusRing}`}
                >
                  {article.title || "Untitled article"}
                </Link>
              ) : (
                <span className="line-clamp-2 font-medium leading-snug">
                  {article.title || "Untitled article"}
                </span>
              )}

              <RankBar share={views / top} />

              <p className="mt-1.5 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-xs tabular-nums text-default-600">
                <span>
                  <span className="font-semibold text-foreground">
                    {formatCount(views)}
                  </span>{" "}
                  views
                </span>
                <span>
                  <span className="font-semibold text-foreground">
                    {formatCount(article.totalComments ?? 0)}
                  </span>{" "}
                  comments
                </span>
                <span>
                  {share === undefined ? "No votes" : `${share}% upvote share`}
                </span>
                {article.author?.fullName && (
                  <span className="truncate">
                    {article.author.username ? (
                      <Link
                        href={`/users/@${article.author.username}`}
                        className="underline-offset-4 hover:underline"
                      >
                        {article.author.fullName}
                      </Link>
                    ) : (
                      article.author.fullName
                    )}
                  </span>
                )}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
};

const TopContributors = ({
  contributors,
  isLoading,
  isError,
  onRetry,
}: {
  contributors: IAdminTopContributor[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}) => {
  if (isLoading) {
    return <BlockSkeleton rows={4} />;
  }

  if (isError) {
    return (
      <BlockError
        title="Contributors could not be loaded"
        description="The overview request failed, so this list has no data."
        action={<RetryButton onClick={onRetry} />}
      />
    );
  }

  if (contributors.length === 0) {
    return (
      <EmptyState
        variant="inline"
        title="No articles published in the last 30 days"
        description="This list ranks members by articles published in the last 30 days. It stays empty until someone publishes."
      />
    );
  }

  return (
    <ol className="divide-y divide-default/60">
      {contributors.map((person, index) => (
        <li
          key={person._id}
          className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0"
        >
          <span
            aria-hidden
            className="w-4 shrink-0 text-right text-xs font-semibold tabular-nums text-default-600"
          >
            {index + 1}
          </span>
          <Avatar
            src={person.profilePicture || undefined}
            name={initialsOf(person.fullName)}
            className="size-8 shrink-0"
            classNames={{ name: "text-xs" }}
          />
          <div className="min-w-0 flex-1">
            <Link
              href={`/admin/manage-users/${person._id}`}
              className={`block truncate rounded text-sm font-medium underline-offset-4 hover:underline ${focusRing}`}
            >
              {person.fullName || "Unnamed member"}
            </Link>
            <p className="truncate text-xs tabular-nums text-default-600">
              {[
                countLabel(person.published),
                typeof person.totalViews === "number"
                  ? `${formatCount(person.totalViews)} views`
                  : undefined,
              ]
                .filter(Boolean)
                .join(", ") || "Nothing recorded"}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
};

const Analytics = () => {
  const [range, setRange] = useState<Range>(30);
  const rangeRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const overviewQuery = useAdminOverview();
  const activityQuery = useAdminActivity(range);

  const overview = unwrapData<IAdminOverview>(overviewQuery.data);
  const week = overview?.week;

  const points = useMemo(() => {
    const list = unwrapData<IAdminActivityPoint[]>(activityQuery.data);
    return Array.isArray(list) ? list : [];
  }, [activityQuery.data]);

  const chartData = useMemo(
    () =>
      points.map((point) => ({
        // The real day key, so the chart can name the range and the tooltip
        // without reading it back out of a formatted label.
        key: point.date,
        label: shortDate(point.date),
        title: longDate(point.date),
        views: Number(point.views) || 0,
        comments: Number(point.comments) || 0,
      })),
    [points],
  );

  const totals = useMemo(
    () =>
      points.reduce(
        (sum, point) => ({
          views: sum.views + (Number(point.views) || 0),
          comments: sum.comments + (Number(point.comments) || 0),
        }),
        { views: 0, comments: 0 },
      ),
    [points],
  );

  const hasActivity = totals.views > 0 || totals.comments > 0;

  const topArticles = Array.isArray(overview?.topArticles)
    ? overview.topArticles
    : [];

  const topContributors = Array.isArray(overview?.topContributors)
    ? overview.topContributors
    : [];

  const health =
    overview?.health && typeof overview.health === "object"
      ? Object.entries(overview.health)
      : [];

  const onRangeKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    const current = RANGES.findIndex((option) => option.days === range);
    const step = event.key === "ArrowRight" ? 1 : -1;
    const next = (current + step + RANGES.length) % RANGES.length;
    setRange(RANGES[next].days);
    rangeRefs.current[next]?.focus();
  };

  const rangeLabel =
    points.length > 1
      ? `${longDate(points[0]?.date)} to ${longDate(points.at(-1)?.date)}`
      : `The last ${range} days`;

  const overviewReady = !overviewQuery.isLoading && !overviewQuery.isError;
  const overviewFailed = overviewQuery.isError || (overviewReady && !overview);

  const today = overview?.today;

  // Same four figures, labels and order as the dashboard, so the two "This
  // week" blocks read as one thing in two places.
  const headline = [
    {
      key: "views",
      label: "Views this week",
      value: week?.views?.value,
      hint: weekHint(week?.views),
      delta: deltaOf(week?.views),
      href: "/admin/manage-blogs",
    },
    {
      key: "comments",
      label: "Comments this week",
      value: week?.comments?.value,
      hint: weekHint(week?.comments),
      delta: deltaOf(week?.comments),
      href: "/admin/manage-comments",
    },
    {
      key: "members",
      label: "Members joined this week",
      value: week?.newMembers?.value,
      hint: weekHint(week?.newMembers),
      delta: deltaOf(week?.newMembers),
      href: "/admin/manage-users",
    },
    {
      key: "upvotes",
      label: "Upvotes today",
      value: today?.upvotes,
      hint:
        typeof today?.views === "number"
          ? `${formatCount(today.views)} views today`
          : "views today not reported",
      href: "/admin/moderation",
    },
  ];

  // Every figure the API sends is a count, so "0" is a real answer and reads
  // as one; a missing figure says so instead of printing a blank.
  const tileValue = (value: unknown) =>
    typeof value === "number" && Number.isFinite(value) ? (
      formatCount(value)
    ) : (
      <NotReported />
    );

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
        </div>

        {overviewQuery.isLoading && (
          <>
            <span className="sr-only" role="status">
              Loading this week&apos;s figures
            </span>
            <div className="grid grid-cols-2 divide-x divide-y divide-default/70 overflow-hidden rounded-[10px] border border-default/70 sm:grid-cols-4 sm:divide-y-0">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className={`min-w-0 p-4 ${
                    index >= 2 ? "border-t border-default/70 sm:border-t-0" : ""
                  }`}
                >
                  <Skeleton className="h-3 w-24 rounded" />
                  <Skeleton className="mt-2 h-7 w-20 rounded" />
                  <Skeleton className="mt-3 h-3 w-28 rounded" />
                </div>
              ))}
            </div>
          </>
        )}

        {overviewFailed && (
          <div className="rounded-[10px] border border-default/70">
            <BlockError
              title="This week's figures could not be loaded"
              description={messageOf(
                overviewQuery.data,
                "The overview request failed. The rest of this page still works.",
              )}
              action={<RetryButton onClick={() => overviewQuery.refetch()} />}
            />
          </div>
        )}

        {overviewReady && overview && (
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
                  value={tileValue(metric.value)}
                  hint={metric.hint}
                  delta={metric.delta}
                  href={metric.href}
                />
              </div>
            ))}
          </div>
        )}

        {!overviewQuery.isLoading && !overviewFailed && (
          <p className="mt-2 text-xs text-default-600">{SOURCE_NOTE}</p>
        )}
      </section>

      <SectionCard
        title="Views and comments per day"
        description="How many times articles were read and how many comments readers left, one point per day."
        action={
          <div
            role="group"
            aria-label="Chart range"
            onKeyDown={onRangeKeyDown}
            className="flex items-center gap-1 rounded-md border border-default-200 p-0.5"
          >
            {RANGES.map((option, index) => {
              const selected = option.days === range;
              return (
                <button
                  key={option.days}
                  ref={(node) => {
                    rangeRefs.current[index] = node;
                  }}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setRange(option.days)}
                  className={`inline-flex min-h-11 items-center rounded px-3 text-xs font-medium tabular-nums transition-colors sm:min-h-8 ${focusRing} ${
                    selected
                      ? "bg-primary text-primary-foreground"
                      : "text-default-600 hover:bg-default-100 hover:text-foreground"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        }
        footer={
          points.length > 0 ? (
            <span className="tabular-nums">{rangeLabel}</span>
          ) : undefined
        }
      >
        {activityQuery.isLoading && (
          <div className="space-y-3">
            <Skeleton className="h-64 w-full rounded-lg" />
            <p className="sr-only" role="status">
              Loading daily activity
            </p>
          </div>
        )}

        {!activityQuery.isLoading &&
          (activityQuery.isError ||
            unwrapData(activityQuery.data) === undefined) && (
            <BlockError
              title="Daily activity could not be loaded"
              description={messageOf(
                activityQuery.data,
                "The activity request failed, so the chart has no points to draw.",
              )}
              action={<RetryButton onClick={() => activityQuery.refetch()} />}
            />
          )}

        {!activityQuery.isLoading &&
          !activityQuery.isError &&
          unwrapData(activityQuery.data) !== undefined && (
            <>
              {hasActivity ? (
                <>
                  <AdminActivityChart
                    data={chartData}
                    series={SERIES}
                    height={260}
                    type="line"
                    showLegend
                    summary="Views and comments per day"
                  />

                  <dl className="mt-4 grid grid-cols-2 gap-4 border-t border-default/60 pt-4">
                    <div>
                      <dt className="tth-label-sm">Views in this range</dt>
                      <dd className="mt-1 text-lg font-semibold tabular-nums">
                        {formatCount(totals.views)}
                      </dd>
                      <p className="mt-0.5 text-xs text-default-600">
                        Sum of {plural(points.length, "daily point")}
                      </p>
                    </div>
                    <div>
                      <dt className="tth-label-sm">Comments in this range</dt>
                      <dd className="mt-1 text-lg font-semibold tabular-nums">
                        {formatCount(totals.comments)}
                      </dd>
                      <p className="mt-0.5 text-xs text-default-600">
                        Sum of {plural(points.length, "daily point")}
                      </p>
                    </div>
                  </dl>
                </>
              ) : (
                <EmptyState
                  variant="inline"
                  icon={<RiBarChartLine className="size-5" />}
                  title="No views or comments in this range"
                  description={`Every day in these ${plural(points.length, "day")} has zero views and zero comments. A longer range may show earlier activity.`}
                  action={
                    range !== 90 ? (
                      <button
                        type="button"
                        onClick={() => setRange(90)}
                        className={`inline-flex min-h-11 items-center rounded-md border border-default-300 px-3 text-sm font-medium hover:bg-default-100 ${focusRing}`}
                      >
                        Show the last 90 days
                      </button>
                    ) : undefined
                  }
                />
              )}
            </>
          )}
      </SectionCard>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <SectionCard
          title="Most read articles"
          description="The overview ranks published articles by all-time views and sends the top few."
        >
          <TopArticles
            articles={topArticles}
            isLoading={overviewQuery.isLoading}
            isError={overviewFailed}
            onRetry={() => overviewQuery.refetch()}
          />
        </SectionCard>

        <SectionCard
          title="Most active authors, last 30 days"
          description="Ranked by articles published in the last 30 days, then by the views those articles hold."
        >
          <TopContributors
            contributors={topContributors}
            isLoading={overviewQuery.isLoading}
            isError={overviewFailed}
            onRetry={() => overviewQuery.refetch()}
          />
        </SectionCard>
      </div>

      <SectionCard
        title="Today"
        description="Counters since midnight, as the overview reports them."
        dense
      >
        {overviewQuery.isLoading && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-12 rounded-md" />
            ))}
          </div>
        )}

        {overviewReady && overview?.today && (
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
            {[
              { key: "views", label: "Views" },
              { key: "comments", label: "Comments" },
              { key: "upvotes", label: "Upvotes" },
              { key: "newMembers", label: "New members" },
            ].map((item) => {
              const raw =
                overview.today?.[
                  item.key as keyof NonNullable<IAdminOverview["today"]>
                ];
              return (
                <div key={item.key}>
                  <dt className="text-xs text-default-600">{item.label}</dt>
                  <dd className="mt-0.5 text-base font-semibold tabular-nums">
                    {typeof raw === "number" ? (
                      formatCount(raw)
                    ) : (
                      <span className="text-sm font-normal text-default-600">
                        Not reported
                      </span>
                    )}
                  </dd>
                </div>
              );
            })}
          </dl>
        )}

        {overviewReady && !overview?.today && (
          <p className="text-sm text-default-600">
            The overview returned no counter for today.
          </p>
        )}

        {overviewFailed && (
          <p className="text-sm text-default-600">
            The overview request failed, so today&apos;s counters are missing.
          </p>
        )}
      </SectionCard>

      <SectionCard
        title="Gaps the overview counts"
        description="Current counts of content that is missing something readers expect."
        dense
      >
        {overviewQuery.isLoading && (
          <div className="grid gap-2 sm:grid-cols-2">
            <Skeleton className="h-12 rounded-md" />
            <Skeleton className="h-12 rounded-md" />
          </div>
        )}

        {overviewFailed && (
          <p className="text-sm text-default-600">
            The overview request failed, so the checks have no data.
          </p>
        )}

        {overviewReady && health.length === 0 && (
          <p className="text-sm text-default-600">
            The overview returned no checks.
          </p>
        )}

        {health.length > 0 && (
          <>
            <dl className="grid gap-2 sm:grid-cols-2">
              {health.map(([key, raw]) => (
                <div
                  key={key}
                  className="flex items-baseline justify-between gap-3 border-b border-default/60 pb-2 last:border-b-0"
                >
                  <dt
                    className="min-w-0 text-sm text-default-700"
                    title={HEALTH_LABELS[key] ? undefined : key}
                  >
                    {HEALTH_LABELS[key] ?? prettifyKey(key)}
                  </dt>
                  <dd className="shrink-0 text-sm font-semibold tabular-nums">
                    {typeof raw === "number" || typeof raw === "string" ? (
                      String(raw)
                    ) : (
                      <span className="text-xs font-normal text-default-600">
                        Not reported
                      </span>
                    )}
                  </dd>
                </div>
              ))}
            </dl>

            <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs">
              <Link
                href="/admin/categories"
                className={`rounded text-primary-accessible underline-offset-4 hover:underline ${focusRing}`}
              >
                Review categories
              </Link>
              <Link
                href="/admin/manage-blogs"
                className={`rounded text-primary-accessible underline-offset-4 hover:underline ${focusRing}`}
              >
                Review articles
              </Link>
            </p>
          </>
        )}
      </SectionCard>
    </div>
  );
};

export default Analytics;
