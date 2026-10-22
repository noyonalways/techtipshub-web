"use client"

import { useGetAllPayments } from "@/hooks/payment.hook";
import { IPayment } from "@/types";
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

const PaymentsTable = ({}: IProps) => {
  const { data, isLoading } = useGetAllPayments();
  const payments = data?.data as IPayment[];

  return (
    <Table radius="sm" aria-label="Example table with custom cells">
      <TableHeader>
        <TableColumn>NAME</TableColumn>
        <TableColumn>Transaction Id</TableColumn>
        <TableColumn>Amount</TableColumn>
        <TableColumn>Subscription Type</TableColumn>
        <TableColumn>STATUS</TableColumn>
        <TableColumn>Paid At</TableColumn>
        <TableColumn>Payment Method</TableColumn>
      </TableHeader>
      <TableBody
        isLoading={isLoading}
        loadingContent={
          <CgSpinner className="animate-spin text-primary text-3xl" />
        }
        emptyContent={"Empty table"}
      >
        {payments?.map((payment) => (
          <TableRow key={payment?._id}>
            <TableCell>
              <div className="inline-flex space-x-2">
                <Avatar src={payment?.user?.profilePicture} size="sm" />
                <div>
                  <h3 className="font-medium">{payment?.user?.fullName}</h3>
                  <span className="text-xs">{payment?.user?.email}</span>
                </div>
              </div>
            </TableCell>
            <TableCell>
              <div className="lg:w-auto w-40">{payment?.transactionId}</div>
              </TableCell>
            <TableCell>
              <div className="lg:w-auto w-20"> 
                {payment?.amount} {payment?.currency}
              </div>
            </TableCell>
            <TableCell>{payment?.subscription?.type}</TableCell>
            <TableCell>
              {(payment.status === "Pending" && (
                <span className="px-3 py-1 bg-blue-500 text-white rounded-full text-xs">
                  Pending
                </span>
              )) ||
                (payment.status === "Paid" && (
                  <span className="px-3 py-1 bg-green-500 text-white rounded-full text-xs">
                    Paid
                  </span>
                )) ||
                (payment.status === "Failed" && (
                  <span className="px-3 py-1 bg-red-500 text-white rounded-full text-xs">
                    Failed
                  </span>
                )) ||
                (payment.status === "Canceled" && (
                  <span className="px-3 py-1 bg-orange-500 text-white rounded-full text-xs">
                    Canceled
                  </span>
                ))}
            </TableCell>
            <TableCell>
              <div className="lg:w-auto w-44">
                {payment?.paidAt
                  ? format(
                    toZonedTime(new Date(payment?.paidAt), "Asia/Dhaka"),
                    "dd-MM-yyyy hh:mm:ss a"
                  )
                  : "N/A"}
                </div>
            </TableCell>

            <TableCell>{payment?.paymentMethod}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default PaymentsTable;