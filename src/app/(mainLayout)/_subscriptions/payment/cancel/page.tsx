import Container from "@/components/ui/container";
import { getPaymentInfoByTransactionId } from "@/services/payment";
import { IPayment } from "@/types";
import { Card, CardBody, CardFooter, CardHeader } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { button as buttonStyles } from "@heroui/theme";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { Metadata } from "next";
import Link from "next/link";
import { BsArrowLeft, BsXOctagon } from "react-icons/bs";
import { FaShoppingCart } from "react-icons/fa";

export const metadata: Metadata = {
  title: "Payment Cancelled",
  description:
    "Your payment process was cancelled. Return to checkout or explore other options on TechTips Hub.",
  keywords:
    "Payment Cancelled, TechTips Hub, transaction cancelled, checkout, payment error",
};

interface IProps {
  searchParams: Promise<{
    transactionId: string;
  }>;
}
const PaymentCancelPage = async ({ searchParams }: IProps) => {
  const { transactionId: queriedTransactionId } = await searchParams;

  const paymentData = await getPaymentInfoByTransactionId(
    queriedTransactionId
  );

  const { amount, transactionId, subscription, currency } =
    (paymentData?.data as IPayment) ?? {};

  const cancelledAt = format(toZonedTime(new Date(), "Asia/Dhaka"), "M/d/yyyy, h:mm:ss a")

  return (
    <section className="py-10 lg:py-20">
      <Container>
        <div className="flex justify-center items-center relative overflow-hidden">
          <img
            className="absolute -right-40 -top-56 w-full max-w-5xl z-0 opacity-80 select-none"
            src="/gradient-color.png"
          />
          <Card
            className="w-full max-w-md bg-transparent lg:backdrop-blur-lg shadow-sm"
            radius="sm"
          >
            <CardHeader className="flex flex-col items-center gap-3 pt-8 pb-6 bg-gradient-to-r from-gray-400 dark:from-gray-500 to-blue-500 dark:to-blue-500 text-white">
              <BsXOctagon className="w-16 h-16" />
              <div className="flex flex-col items-center">
                <h1 className="text-2xl font-bold">Payment Cancelled</h1>
                <p className="text-sm opacity-80">
                  Your payment process has been cancelled
                </p>
              </div>
            </CardHeader>
            <CardBody className="px-6 py-8">
              <div className="space-y-6">
                <div className="bg-blue-50/60 dark:bg-black/10 border border-blue-200 dark:border-blue-400/20 rounded-lg p-4">
                  <p className="text-sm text-blue-500">
                    Your payment has been cancelled. No charges have been made
                    to your account.
                  </p>
                </div>
                <Divider className="bg-default/50" />
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Transaction ID
                    </p>
                    <p className="text-base">{transactionId}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Cancelled At
                    </p>
                    <p className="text-base">{cancelledAt}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Subscription Type
                    </p>
                    <p className="text-base">{subscription.type}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Amount</p>
                    <p className="text-base">
                      {amount} {currency}
                    </p>
                  </div>
                </div>
              </div>
            </CardBody>
            <CardFooter className="flex flex-col px-6 pb-8 space-y-4">
              <Link
                href="/checkout"
                passHref
                className={`${buttonStyles({
                  color: "primary",
                  radius: "sm",
                  size: "md",
                  ...buttonStyles,
                })} w-full`}
              >
                <FaShoppingCart className="w-5 h-5 mr-2" />
                Return to Checkout
              </Link>
              <Link
                href="/"
                passHref
                className={`${buttonStyles({
                  color: "secondary",
                  radius: "sm",
                  size: "md",
                  ...buttonStyles,
                })} w-full`}
              >
                <BsArrowLeft className="w-5 h-5 mr-2" />
                Back to Home
              </Link>
            </CardFooter>
          </Card>
        </div>
      </Container>
    </section>
  );
};

export default PaymentCancelPage;
