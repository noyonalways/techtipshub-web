import Container from "@/components/ui/container";
import { getPaymentInfoByTransactionId } from "@/services/payment";
import { IPayment } from "@/types";
import { Card, CardBody, CardFooter, CardHeader } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { button as buttonStyles } from "@heroui/theme";
import Link from "next/link";
import { BiCalendar, BiCreditCard } from "react-icons/bi";
import { BsCheckCircle } from "react-icons/bs";
import { FaDollarSign } from "react-icons/fa";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Payment Successful",
  description:
    "Thank you for your purchase! Your payment has been processed successfully. View transaction details and subscription information on TechTips Hub.",
  keywords:
    "Payment Success, TechTips Hub, successful transaction, subscription details, payment processed",
};


interface IProps {
  searchParams: Promise<{
    transactionId: string;
  }>;
}

const PaymentSuccessPage = async ({ searchParams }: IProps) => {
  const { transactionId: txnId } = await searchParams;

  const paymentData = await getPaymentInfoByTransactionId(txnId);

  const {
    amount,
    status,
    subscription,
    paidAt,
    paymentMethod,
    transactionId,
    currency,
  } = (paymentData?.data as IPayment) ?? {};

  return (
    <section className="py-10 lg:py-20">
      <Container>
        <div className="flex justify-center items-center relative overflow-hidden">
          <img
            className="absolute -right-40 -top-56 w-full max-w-5xl z-0 opacity-80 select-none"
            src="/gradient-color.png"
          />
          <Card
            radius="sm"
            className="w-full max-w-md bg-transparent lg:backdrop-blur-lg shadow-sm"
            shadow="none"
          >
            <CardHeader className="flex flex-col items-center gap-3 pt-8 pb-6 bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
              <BsCheckCircle className="w-16 h-16" />
              <div className="flex flex-col items-center">
                <h1 className="text-2xl font-bold">Payment Successful</h1>
                <p className="text-sm opacity-80">
                  Thank you for your purchase!
                </p>
              </div>
            </CardHeader>
            <CardBody className="px-6 py-8">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FaDollarSign className="w-6 h-6 text-green-500" />
                    <span className="text-lg font-semibold">
                      Amount {status}
                    </span>
                  </div>
                  <span className="text-xl font-bold">
                    {amount} {currency}
                  </span>
                </div>
                <Divider />
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Transaction ID
                    </p>
                    <p className="text-base">{transactionId}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Payment Method
                    </p>
                    <div className="flex items-center space-x-2">
                      <BiCreditCard className="w-5 h-5 text-blue-500" />
                      <p className="text-base">{paymentMethod}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Paid At</p>
                    <p className="text-base">
                      {format(toZonedTime(new Date(paidAt), "Asia/Dhaka"), "M/d/yyyy, h:mm:ss a")}
                    </p>
                  </div>
                </div>
                <Divider />
                <div className="space-y-2">
                  <p className="text-lg font-semibold">Subscription Details</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <BiCalendar className="w-5 h-5 text-indigo-500" />
                      <span className="text-sm">{subscription?.type} Plan</span>
                    </div>
                    <span className="text-sm font-medium">
                      {new Date(subscription?.startDate).toLocaleDateString()} -{" "}
                      {new Date(subscription?.endDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </CardBody>
            <CardFooter className="px-6 pb-8">
              <Link
                href="/"
                className={`${buttonStyles({
                  color: "primary",
                  radius: "sm",
                  size: "md",
                })} w-full`}
              >
                Go to Dashboard
              </Link>
            </CardFooter>
          </Card>
        </div>
      </Container>
    </section>
  );
};

export default PaymentSuccessPage;
