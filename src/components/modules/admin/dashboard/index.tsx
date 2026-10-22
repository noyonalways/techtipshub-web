"use client";

import ActivityChart, {
  activitySeries as series,
  type ActivityPoint,
} from "@/components/modules/admin/dashboard/activity-chart";
import EmptyState from "@/components/modules/admin/empty-state";
import MetricTile from "@/components/modules/admin/metric-tile";
import SectionCard from "@/components/modules/admin/section-card";
import { useDashboardMetrics } from "@/hooks/metrics";
import { Skeleton } from "@heroui/react";
import Link from "next/link";
import {
  RiArrowRightLine,
  RiArticleLine,
  RiChat1Line,
  RiEyeLine,
  RiFileList3Line,
  RiThumbDownLine,
  RiThumbUpLine,
  RiUser3Line,
} from "react-icons/ri";

interface MetricBucket {
  total?: number;
  currentMonth?: number;
  lastMonthDiff?: string;
  type?: string;
}

interface DashboardMetrics {
  users?: MetricBucket;
  views?: MetricBucket;
  upvotes?: MetricBucket;
  downvotes?: MetricBucket;
  comments?: MetricBucket;
  posts?: MetricBucket;
  chartData?: ActivityPoint[];
}

const number = (value?: number) => (value ?? 0).toLocaleString();

/** "N/A" is what the API returns when there is no previous period. */
const deltaOf = (bucket?: MetricBucket) =>
  bucket?.lastMonthDiff && bucket.lastMonthDiff !== "N/A"
    ? bucket.lastMonthDiff
    : undefined;

const QuickLink = ({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) => (
  <Link
    href={href}
    className="group flex items-start justify-between gap-3 rounded-xl border border-default/60 px-4 py-3 transition-colors hover:border-primary/40 hover:bg-primary/5"
  >
    <span>
      <span className="block text-sm font-semibold">{title}</span>
      <span className="mt-0.5 block text-xs text-default-500">
        {description}
      </span>
    </span>
    <RiArrowRightLine
      aria-hidden
      className="mt-0.5 size-4 shrink-0 text-default-300 transition-colors group-hover:text-primary"
    />
  </Link>
);

const DashboardSkeleton = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-default/60 bg-default/60 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="space-y-3 bg-background p-4">
          <Skeleton className="h-3 w-20 rounded" />
          <Skeleton className="h-7 w-16 rounded" />
          <Skeleton className="h-3 w-24 rounded" />
        </div>
      ))}
    </div>
    <section className="rounded-xl border border-default/60">
      <div className="border-b border-default/60 px-5 py-3.5">
        <Skeleton className="h-4 w-28 rounded" />
      </div>
      <div className="p-5">
        <Skeleton className="h-56 w-full rounded-lg" />
      </div>
    </section>
  </div>
);

export default function AdminDashboard() {
  const { data: res, isLoading, isError } = useDashboardMetrics();
  const data = (res?.data ?? {}) as DashboardMetrics;

  if (isLoading) return <DashboardSkeleton />;

  if (isError || !res?.data) {
    return (
      <EmptyState
        title="Metrics are unavailable"
        description={
          res?.message ||
          "The dashboard could not reach the metrics API. Reload the page, or check that the server is running."
        }
      />
    );
  }

  const chartData = Array.isArray(data.chartData) ? data.chartData : [];
  const hasSignal = chartData.some(
    (month) =>
      month.views + month.posts + month.users + month.comments > 0
  );

  const headline = [
    {
      label: "Total views",
      value: number(data.views?.total),
      icon: <RiEyeLine className="size-4" />,
      bucket: data.views,
    },
    {
      label: "Articles",
      value: number(data.posts?.total),
      icon: <RiFileList3Line className="size-4" />,
      bucket: data.posts,
    },
    {
      label: "Members",
      value: number(data.users?.total),
      icon: <RiUser3Line className="size-4" />,
      bucket: data.users,
    },
    {
      label: "Comments",
      value: number(data.comments?.total),
      icon: <RiChat1Line className="size-4" />,
      bucket: data.comments,
    },
  ];

  const engagement = [
    {
      label: "Upvotes",
      value: number(data.upvotes?.total),
      icon: <RiThumbUpLine className="size-4" />,
      bucket: data.upvotes,
    },
    {
      label: "Downvotes",
      value: number(data.downvotes?.total),
      icon: <RiThumbDownLine className="size-4" />,
      bucket: data.downvotes,
    },
    {
      label: "New views this month",
      value: number(data.views?.currentMonth),
      icon: <RiArticleLine className="size-4" />,
      bucket: data.views,
    },
    {
      label: "New articles this month",
      value: number(data.posts?.currentMonth),
      icon: <RiArticleLine className="size-4" />,
      bucket: data.posts,
    },
  ];

  const approvalRate = (() => {
    const up = data.upvotes?.total ?? 0;
    const down = data.downvotes?.total ?? 0;
    const votes = up + down;
    if (votes === 0) return null;
    return Math.round((up / votes) * 100);
  })();

  return (
    <div className="space-y-6">
      {/* Headline metrics — one bordered grid, not eight separate cards */}
      <section aria-label="Site totals">
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-default/60 bg-default/60 lg:grid-cols-4">
          {headline.map((metric) => (
            <div key={metric.label} className="bg-background">
              <MetricTile
                label={metric.label}
                value={metric.value}
                icon={metric.icon}
                delta={deltaOf(metric.bucket)}
                trend={metric.bucket?.type}
                meta={
                  deltaOf(metric.bucket) ? "vs last month" : "all time"
                }
              />
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
        {/* Trend */}
        <SectionCard
          className="self-start"
          title="Activity this year"
          description="Monthly views, publications, new members and comments."
          action={
            <ul className="flex flex-wrap items-center gap-x-3 gap-y-1">
              {series.map((item) => (
                <li
                  key={item.key}
                  className="flex items-center gap-1.5 text-xs text-default-600"
                >
                  <span
                    aria-hidden
                    className="size-2 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  {item.label}
                </li>
              ))}
            </ul>
          }
        >
          {chartData.length === 0 || !hasSignal ? (
            <EmptyState
              variant="inline"
              title="No activity recorded this year"
              description="The chart fills in as people read, comment and publish. It currently has no data points."
            />
          ) : (
            <ActivityChart data={chartData} />
          )}
        </SectionCard>

        {/* Engagement */}
        <div className="space-y-6">
          <SectionCard title="Engagement" description="Reader reactions.">
            <div className="divide-y divide-default/60">
              {engagement.map((metric) => (
                <div
                  key={metric.label}
                  className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
                >
                  <span className="flex items-center gap-2 text-sm text-default-600">
                    <span aria-hidden className="text-default-400">
                      {metric.icon}
                    </span>
                    {metric.label}
                  </span>
                  <span className="text-sm font-semibold tabular-nums">
                    {metric.value}
                  </span>
                </div>
              ))}

              <div className="flex items-center justify-between gap-3 py-2.5">
                <span className="text-sm text-default-600">
                  Upvote share
                </span>
                <span className="text-sm font-semibold tabular-nums">
                  {approvalRate === null ? "—" : `${approvalRate}%`}
                </span>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Manage" description="Jump to a screen.">
            <div className="space-y-2">
              <QuickLink
                href="/admin/manage-blogs"
                title="Articles"
                description="Review, edit or remove posts"
              />
              <QuickLink
                href="/admin/manage-users"
                title="Members"
                description="Roles, status and blocking"
              />
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
