import Container from "@/components/ui/container";
import { getPaymentInfoByTransactionId } from "@/services/payment";
import { IPayment } from "@/types";
import { Button } from "@heroui/button";
import { Card, CardBody, CardFooter, CardHeader } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { BiXCircle } from "react-icons/bi";
import { FiAlertTriangle, FiHelpCircle, FiRefreshCcw } from "react-icons/fi";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Payment Failed",
  description:
    "Unfortunately, we couldn't process your payment. Review your transaction details or contact support to resolve this issue.",
  keywords:
    "Payment Failed, TechTips Hub, transaction error, payment issue, payment declined, try again, contact support",
};

interface IProps {
  searchParams: Promise<{
    transactionId: string;
  }>;
}

const PaymentFailedPage = async ({ searchParams }: IProps) => {
  const { transactionId: txnId } = await searchParams;

  const paymentData = await getPaymentInfoByTransactionId(txnId);

  const {
    amount,
    paymentMethod,
    transactionId,
    currency,
  } = (paymentData?.data as IPayment) ?? {};

  const attemptedAt = format(toZonedTime(new Date(), "Asia/Dhaka"), "M/d/yyyy, h:mm:ss a")

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
            <CardHeader className="flex flex-col items-center gap-3 pt-8 pb-6 bg-gradient-to-r from-red-500 to-orange-500 text-white">
              <BiXCircle className="w-16 h-16" />
              <div className="flex flex-col items-center">
                <h1 className="text-2xl font-bold">Payment Failed</h1>
                <p className="text-sm opacity-80">
                  We couldn&apos;t process your payment
                </p>
              </div>
            </CardHeader>
            <CardBody className="px-6 py-8">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FiAlertTriangle className="w-6 h-6 text-red-500" />
                    <span className="text-lg font-semibold">Payment Issue</span>
                  </div>
                </div>
                <div className="bg-red-50/40 dark:bg-red-50/10 border border-red-200 dark:border-red-200/50 rounded-lg p-4">
                  <p className="text-sm text-red-500">
                    We encountered an issue while processing your payment. This
                    could be due to various reasons. Please try again or use a
                    different payment method.
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
                      Payment Method
                    </p>
                    <p className="text-base">{paymentMethod}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Amount</p>
                    <p className="text-base">
                      {amount} {currency}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Attempted At
                    </p>
                    <p className="text-base">
                      {attemptedAt}
                    </p>
                  </div>
                </div>
              </div>
            </CardBody>
            <CardFooter className="flex flex-col px-6 pb-8 space-y-4">
              <>
                <Button color="primary" className="w-full" radius="sm">
                  <FiRefreshCcw className="w-5 h-5 mr-2" />
                  Try Again
                </Button>
              </>
              <>
                <Button
                  color="secondary"
                  variant="flat"
                  className="w-full"
                  radius="sm"
                >
                  <FiHelpCircle className="w-5 h-5 mr-2" />
                  Contact Support
                </Button>
              </>
            </CardFooter>
          </Card>
        </div>
      </Container>
    </section>
  );
};

export default PaymentFailedPage;
