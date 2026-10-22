"use client";

import { useGetAllSubscriptions } from "@/hooks/subscription.hook";
import { ISubscription } from "@/types";
import {
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/react";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { CgSpinner } from "react-icons/cg";

interface IProps {}

const SubscribersTable = ({}: IProps) => {
  const { data, isLoading } = useGetAllSubscriptions();
  const subscriptions = data?.data as ISubscription[];

  return (
    <Table radius="sm" aria-label="Example table with custom cells">
      <TableHeader>
        <TableColumn>NAME</TableColumn>
        <TableColumn>Transaction Id</TableColumn>
        <TableColumn>Amount</TableColumn>
        <TableColumn>Subscription Type</TableColumn>
        <TableColumn>Start Date</TableColumn>
        <TableColumn>End Date</TableColumn>
        <TableColumn>STATUS</TableColumn>
      </TableHeader>
      <TableBody
        isLoading={isLoading}
        loadingContent={
          <CgSpinner className="animate-spin text-primary text-3xl" />
        }
        emptyContent={"Empty table"}
      >
        {subscriptions?.map((subscription) => (
          <TableRow key={subscription._id}>
            <TableCell>
              <div className="inline-flex space-x-2">
                <Avatar src={subscription?.user?.profilePicture} size="sm" />
                <div>
                  <h3 className="font-medium">{subscription?.user?.fullName}</h3>
                  <span className="text-xs">{subscription?.user?.email}</span>
                </div>
              </div>
            </TableCell>
            <TableCell>
              <div className="lg:w-auto w-40">{subscription?.transactionId}</div>
            </TableCell>
            <TableCell>
              <div className="lg:w-auto w-20"> 
                {subscription?.price} {subscription?.currency}
              </div>
            </TableCell>
            <TableCell>{subscription?.type}</TableCell>
            <TableCell>
              <div className="lg:w-auto w-44">
                {subscription.startDate
                  ? format(
                    toZonedTime(new Date(subscription?.startDate), "Asia/Dhaka"),
                    "dd-MM-yyyy hh:mm:ss a"
                  )
                  : "N/A"}
              </div>
            </TableCell>
            <TableCell>
              <div className="lg:w-auto w-44">
                {subscription?.endDate
                  ? format(
                    toZonedTime(new Date(subscription?.endDate), "Asia/Dhaka"),
                    "dd-MM-yyyy hh:mm:ss a"
                  )
                  : "N/A"}
              </div>
            </TableCell>
            <TableCell>
              {(subscription?.status === "Pending" && (
                <span className="px-3 py-1 bg-blue-500 text-white rounded-full text-xs">
                  Pending
                </span>
              )) ||
                (subscription?.status === "Active" && (
                  <span className="px-3 py-1 bg-green-500 text-white rounded-full text-xs">
                    Active
                  </span>
                )) ||
                (subscription?.status === "Expired" && (
                  <span className="px-3 py-1 bg-red-500 text-white rounded-full text-xs">
                    Expired
                  </span>
                )) ||
                (subscription?.status === "Canceled" && (
                  <span className="px-3 py-1 bg-orange-500 text-white rounded-full text-xs">
                    Canceled
                  </span>
                ))}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default SubscribersTable;
