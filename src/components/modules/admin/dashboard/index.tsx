"use client";

import { useDashboardMetrics } from "@/hooks/metrics";
import {
  Avatar,
  Card,
  CardBody,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/react";
import React from "react";
import {
  RiArrowUpLine,
  RiChat1Line,
  RiEyeLine,
  RiThumbUpLine,
  RiThumbDownLine,
  RiMoneyDollarCircleLine,
  RiFileList3Line,
  RiUser3Line,
  RiArrowDownLine,
} from "react-icons/ri";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import DashboardContentSkeleton from "./loading-skeleton";

export default function AdminDashboard() {
  const recentActivity = [
    {
      id: 1,
      type: "Comment",
      content: "Great article!",
      user: "John Doe",
      avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
      timestamp: "2 mins ago",
    },
    {
      id: 2,
      type: "Upvote",
      content: "How to optimize React apps",
      user: "Jane Smith",
      avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
      timestamp: "5 mins ago",
    },
    {
      id: 3,
      type: "Blog Post",
      content: "10 Tips for Better Code",
      user: "Alice Johnson",
      avatar: "https://i.pravatar.cc/150?u=a04258114e29026702d",
      timestamp: "10 mins ago",
    },
    {
      id: 4,
      type: "Review",
      content: "5 stars - Excellent tutorial",
      user: "Bob Wilson",
      avatar: "https://i.pravatar.cc/150?u=a048581f4e29026701d",
      timestamp: "15 mins ago",
    },
    {
      id: 5,
      type: "Downvote",
      content: "Common coding mistakes",
      user: "Charlie Brown",
      avatar: "https://i.pravatar.cc/150?u=a092581f4e29026700d",
      timestamp: "20 mins ago",
    },
  ];

  const { data: metricsData, isLoading } = useDashboardMetrics();

  return (
    <>
      {isLoading ? (
        <DashboardContentSkeleton />
      ) : (
        <div className="flex flex-col">
          <div className="flex-grow space-y-4">
            <div className="space-y-2">
              <h2 className="text-lg font-medium">Current Month</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                <Card shadow="sm" radius="sm">
                  <CardBody>
                    <div className="flex items-center gap-2">
                      <RiUser3Line className="text-2xl text-primary" />
                      <div>
                        <p className="text-small text-default-500">
                          Total Users
                        </p>
                        <p className="text-2xl font-bold">
                          {metricsData?.data?.users?.currentMonth}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 mt-2">
                      {(metricsData?.data?.users?.type === "increase" && (
                        <RiArrowUpLine className="text-success" />
                      )) ||
                        (metricsData?.data?.users.type === "decrease" && (
                          <RiArrowDownLine className="text-danger" />
                        ))}
                      <p
                        className={`text-small ${
                          (metricsData?.data?.users?.type === "increase" &&
                            "text-success") ||
                          (metricsData?.data?.users?.type === "decrease" &&
                            "text-danger") ||
                          (metricsData?.data?.users?.type === "no change" &&
                            "text-primary")
                        }`}
                      >
                        {metricsData?.data?.users?.lastMonthDiff}
                      </p>
                      <p className="text-small text-default-500">
                        from last month
                      </p>
                    </div>
                  </CardBody>
                </Card>
                <Card shadow="sm" radius="sm">
                  <CardBody>
                    <div className="flex items-center gap-2">
                      <RiEyeLine className="text-2xl text-primary" />
                      <div>
                        <p className="text-small text-default-500">
                          Total Views
                        </p>
                        <p className="text-2xl font-bold">
                          {metricsData?.data?.views?.currentMonth}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 mt-2">
                      {(metricsData?.data?.views?.type === "increase" && (
                        <RiArrowUpLine className="text-success" />
                      )) ||
                        (metricsData?.data?.views.type === "decrease" && (
                          <RiArrowDownLine className="text-danger" />
                        ))}
                      <p
                        className={`text-small ${
                          (metricsData?.data?.views?.type === "increase" &&
                            "text-success") ||
                          (metricsData?.data?.views?.type === "decrease" &&
                            "text-danger") ||
                          (metricsData?.data?.views?.type === "no change" &&
                            "text-primary")
                        }`}
                      >
                        {metricsData?.data?.views?.lastMonthDiff}
                      </p>
                      <p className="text-small text-default-500">
                        from last month
                      </p>
                    </div>
                  </CardBody>
                </Card>
                <Card shadow="sm" radius="sm">
                  <CardBody>
                    <div className="flex items-center gap-2">
                      <RiThumbUpLine className="text-2xl text-primary" />
                      <div>
                        <p className="text-small text-default-500">
                          Total Upvotes
                        </p>
                        <p className="text-2xl font-bold">
                          {metricsData?.data?.upvotes?.currentMonth}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 mt-2">
                      {(metricsData?.data?.upvotes?.type === "increase" && (
                        <RiArrowUpLine className="text-success" />
                      )) ||
                        (metricsData?.data?.upvotes.type === "decrease" && (
                          <RiArrowDownLine className="text-danger" />
                        ))}
                      <p
                        className={`text-small ${
                          (metricsData?.data?.upvotes?.type === "increase" &&
                            "text-success") ||
                          (metricsData?.data?.upvotes?.type === "decrease" &&
                            "text-danger") ||
                          (metricsData?.data?.upvotes?.type === "no change" &&
                            "text-primary")
                        }`}
                      >
                        {metricsData?.data?.upvotes?.lastMonthDiff}
                      </p>
                      <p className="text-small text-default-500">
                        from last month
                      </p>
                    </div>
                  </CardBody>
                </Card>
                <Card shadow="sm" radius="sm">
                  <CardBody>
                    <div className="flex items-center gap-2">
                      <RiThumbDownLine className="text-2xl text-primary" />
                      <div>
                        <p className="text-small text-default-500">
                          Total Downvotes
                        </p>
                        <p className="text-2xl font-bold">
                          {metricsData?.data?.downvotes?.currentMonth}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 mt-2">
                      {(metricsData?.data?.downvotes?.type === "increase" && (
                        <RiArrowUpLine className="text-success" />
                      )) ||
                        (metricsData?.data?.downvotes?.type === "decrease" && (
                          <RiArrowDownLine className="text-danger" />
                        ))}
                      <p
                        className={`text-small ${
                          (metricsData?.data?.downvotes?.type === "increase" &&
                            "text-success") ||
                          (metricsData?.data?.downvotes?.type === "decrease" &&
                            "text-danger") ||
                          (metricsData?.data?.downvotes?.type === "no change" &&
                            "text-primary")
                        }`}
                      >
                        {metricsData?.data?.downvotes?.lastMonthDiff}
                      </p>
                      <p className="text-small text-default-500">
                        from last month
                      </p>
                    </div>
                  </CardBody>
                </Card>
                <Card shadow="sm" radius="sm">
                  <CardBody>
                    <div className="flex items-center gap-2">
                      <RiChat1Line className="text-2xl text-primary" />
                      <div>
                        <p className="text-small text-default-500">
                          Total Comments
                        </p>
                        <p className="text-2xl font-bold">
                          {metricsData?.data?.comments?.currentMonth}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 mt-2">
                      {(metricsData?.data?.comments?.type === "increase" && (
                        <RiArrowUpLine className="text-success" />
                      )) ||
                        (metricsData?.data?.comments?.type === "decrease" && (
                          <RiArrowDownLine className="text-danger" />
                        ))}
                      <p
                        className={`text-small ${
                          (metricsData?.data?.comments?.type === "increase" &&
                            "text-success") ||
                          (metricsData?.data?.comments?.type === "decrease" &&
                            "text-danger") ||
                          (metricsData?.data?.comments?.type === "no change" &&
                            "text-primary")
                        }`}
                      >
                        {metricsData?.data?.comments?.lastMonthDiff}
                      </p>
                      <p className="text-small text-default-500">
                        from last month
                      </p>
                    </div>
                  </CardBody>
                </Card>
                <Card shadow="sm" radius="sm">
                  <CardBody>
                    <div className="flex items-center gap-2">
                      <RiFileList3Line className="text-2xl text-primary" />
                      <div>
                        <p className="text-small text-default-500">
                          Total Blogs
                        </p>
                        <p className="text-2xl font-bold">
                          {metricsData?.data?.posts?.currentMonth}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 mt-2">
                      {(metricsData?.data?.posts?.type === "increase" && (
                        <RiArrowUpLine className="text-success" />
                      )) ||
                        (metricsData?.data?.posts?.type === "decrease" && (
                          <RiArrowDownLine className="text-danger" />
                        ))}
                      <p
                        className={`text-small ${
                          (metricsData?.data?.posts?.type === "increase" &&
                            "text-success") ||
                          (metricsData?.data?.posts?.type === "decrease" &&
                            "text-danger") ||
                          (metricsData?.data?.posts?.type === "no change" &&
                            "text-primary")
                        }`}
                      >
                        {metricsData?.data?.posts?.lastMonthDiff}
                      </p>
                      <p className="text-small text-default-500">
                        from last month
                      </p>
                    </div>
                  </CardBody>
                </Card>
                <Card shadow="sm" radius="sm">
                  <CardBody>
                    <div className="flex items-center gap-2">
                      <RiMoneyDollarCircleLine className="text-2xl text-primary" />
                      <div>
                        <p className="text-small text-default-500">
                          Total Revenue
                        </p>
                        <p className="text-2xl font-bold">
                          {metricsData?.data?.revenue?.currentMonth}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 mt-2">
                      {(metricsData?.data?.revenue?.type === "increase" && (
                        <RiArrowUpLine className="text-success" />
                      )) ||
                        (metricsData?.data?.revenue?.type === "decrease" && (
                          <RiArrowDownLine className="text-danger" />
                        ))}
                      <p
                        className={`text-small ${
                          (metricsData?.data?.revenue?.type === "increase" &&
                            "text-success") ||
                          (metricsData?.data?.revenue?.type === "decrease" &&
                            "text-danger") ||
                          (metricsData?.data?.revenue?.type === "no change" &&
                            "text-primary")
                        }`}
                      >
                        {metricsData?.data?.revenue?.lastMonthDiff}
                      </p>
                      <p className="text-small text-default-500">
                        from last month
                      </p>
                    </div>
                  </CardBody>
                </Card>
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-lg font-medium">All Time</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                <Card shadow="sm" radius="sm">
                  <CardBody>
                    <div className="flex items-center gap-2">
                      <RiUser3Line className="text-2xl text-primary" />
                      <div>
                        <p className="text-small text-default-500">
                          Total Users
                        </p>
                        <p className="text-2xl font-bold">
                          {metricsData?.data?.users?.total}
                        </p>
                      </div>
                    </div>
                  </CardBody>
                </Card>
                <Card shadow="sm" radius="sm">
                  <CardBody>
                    <div className="flex items-center gap-2">
                      <RiEyeLine className="text-2xl text-primary" />
                      <div>
                        <p className="text-small text-default-500">
                          Total Views
                        </p>
                        <p className="text-2xl font-bold">
                          {metricsData?.data?.views?.total}
                        </p>
                      </div>
                    </div>
                  </CardBody>
                </Card>
                <Card shadow="sm" radius="sm">
                  <CardBody>
                    <div className="flex items-center gap-2">
                      <RiThumbUpLine className="text-2xl text-primary" />
                      <div>
                        <p className="text-small text-default-500">
                          Total Upvotes
                        </p>
                        <p className="text-2xl font-bold">
                          {metricsData?.data?.upvotes?.total}
                        </p>
                      </div>
                    </div>
                  </CardBody>
                </Card>
                <Card shadow="sm" radius="sm">
                  <CardBody>
                    <div className="flex items-center gap-2">
                      <RiThumbDownLine className="text-2xl text-primary" />
                      <div>
                        <p className="text-small text-default-500">
                          Total Downvotes
                        </p>
                        <p className="text-2xl font-bold">
                          {metricsData?.data?.downvotes?.total}
                        </p>
                      </div>
                    </div>
                  </CardBody>
                </Card>
                <Card shadow="sm" radius="sm">
                  <CardBody>
                    <div className="flex items-center gap-2">
                      <RiChat1Line className="text-2xl text-primary" />
                      <div>
                        <p className="text-small text-default-500">
                          Total Comments
                        </p>
                        <p className="text-2xl font-bold">
                          {metricsData?.data?.comments?.total}
                        </p>
                      </div>
                    </div>
                  </CardBody>
                </Card>
                <Card shadow="sm" radius="sm">
                  <CardBody>
                    <div className="flex items-center gap-2">
                      <RiFileList3Line className="text-2xl text-primary" />
                      <div>
                        <p className="text-small text-default-500">
                          Total Blogs
                        </p>
                        <p className="text-2xl font-bold">
                          {metricsData?.data?.posts?.total}
                        </p>
                      </div>
                    </div>
                  </CardBody>
                </Card>
                <Card shadow="sm" radius="sm">
                  <CardBody>
                    <div className="flex items-center gap-2">
                      <RiMoneyDollarCircleLine className="text-2xl text-primary" />
                      <div>
                        <p className="text-small text-default-500">
                          Total Revenue
                        </p>
                        <p className="text-2xl font-bold">
                          {metricsData?.data?.revenue?.total}
                        </p>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </div>
            </div>
            <div className="grid gap-4 mt-4 md:grid-cols-2">
              <Card
                shadow="sm"
                radius="sm"
                className="col-span-full md:col-span-1"
              >
                <CardHeader>
                  <h3 className="text-xl font-semibold">Overview</h3>
                </CardHeader>
                <CardBody>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={metricsData?.data?.chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="views" stroke="#8884d8" />
                      <Line
                        type="monotone"
                        dataKey="comments"
                        stroke="#82ca9d"
                      />
                      <Line
                        type="monotone"
                        dataKey="upvotes"
                        stroke="#ffc658"
                      />
                      <Line
                        type="monotone"
                        dataKey="downvotes"
                        stroke="#ff5858"
                      />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#ff58f1"
                      />
                      <Line type="monotone" dataKey="users" stroke="#589bff" />
                      <Line type="monotone" dataKey="posts" stroke="#92c700" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardBody>
              </Card>
              <Card
                shadow="sm"
                radius="sm"
                className="col-span-full md:col-span-1"
              >
                <CardHeader>
                  <h3 className="text-xl font-semibold">Recent Activity</h3>
                </CardHeader>
                <CardBody>
                  <Table
                    aria-label="Recent activity table"
                    radius="sm"
                    shadow="none"
                  >
                    <TableHeader>
                      <TableColumn>TYPE</TableColumn>
                      <TableColumn>CONTENT</TableColumn>
                      <TableColumn>USER</TableColumn>
                      <TableColumn>TIME</TableColumn>
                    </TableHeader>
                    <TableBody>
                      {recentActivity.map((activity) => (
                        <TableRow key={activity.id}>
                          <TableCell>
                            <div className="lg:w-auto w-20">
                              {activity.type}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="lg:w-auto w-44">
                              {activity.content}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Avatar name={activity.user} />
                          </TableCell>
                          <TableCell>
                            <div className="lg:w-auto w-28">
                              {activity.timestamp}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardBody>
              </Card>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
