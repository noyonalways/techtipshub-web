"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export interface ActivityPoint {
  name: string;
  views: number;
  posts: number;
  comments: number;
  users: number;
}

export const activitySeries = [
  { key: "views", label: "Views", color: "hsl(var(--heroui-primary))" },
  { key: "posts", label: "Posts", color: "hsl(var(--heroui-secondary))" },
  { key: "users", label: "New members", color: "hsl(var(--heroui-success))" },
  { key: "comments", label: "Comments", color: "hsl(var(--heroui-warning))" },
] as const;

/**
 * Kept in its own client component: `recharts` calls `createContext` at module
 * scope, so it cannot be pulled into a server-rendered tree.
 */
export default function ActivityChart({ data }: { data: ActivityPoint[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ left: -16, right: 8 }}>
          <CartesianGrid
            strokeDasharray="2 4"
            stroke="hsl(var(--heroui-default-200))"
            vertical={false}
          />
          <XAxis
            dataKey="name"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11 }}
            stroke="hsl(var(--heroui-default-400))"
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
            tick={{ fontSize: 11 }}
            stroke="hsl(var(--heroui-default-400))"
          />
          <Tooltip
            contentStyle={{
              background: "hsl(var(--heroui-content1))",
              border: "1px solid hsl(var(--heroui-default-200))",
              borderRadius: 10,
              fontSize: 12,
            }}
          />
          {activitySeries.map((item) => (
            <Line
              key={item.key}
              type="monotone"
              dataKey={item.key}
              name={item.label}
              stroke={item.color}
              strokeWidth={1.75}
              dot={false}
              activeDot={{ r: 3 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
