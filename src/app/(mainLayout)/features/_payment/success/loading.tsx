import Container from "@/components/ui/container";
import { Card, CardBody, CardFooter, CardHeader } from "@heroui/card";
import { Skeleton } from "@heroui/skeleton";

interface IProps {}

const PaymentSuccessLoadingPage = ({}: IProps) => {
  return (
    <section className="py-10 lg:py-20">
      <Container>
        <div className="flex justify-center items-center relative overflow-hidden">
          <Card
            radius="sm"
            className="w-full max-w-md lg:backdrop-blur-lg shadow-sm"
          >
            {/* Card Header */}
            <CardHeader className="flex flex-col items-center gap-3 pt-8 pb-6 bg-gradient-to-r from-default-50 to-default-100">
              <Skeleton className="w-16 h-16 rounded-full" />
              <div className="flex flex-col items-center space-y-2">
                <Skeleton className="w-40 h-6 rounded" />
                <Skeleton className="w-28 h-4 rounded" />
              </div>
            </CardHeader>

            {/* Card Body */}
            <CardBody className="px-6 py-8">
              <div className="space-y-6">
                {/* Amount Section */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Skeleton className="w-6 h-6 rounded-full" />
                    <Skeleton className="w-24 h-6" />
                  </div>
                  <Skeleton className="w-16 h-6 rounded" />
                </div>

                <Skeleton className="h-px w-full rounded" />

                {/* Transaction Details */}
                <div className="space-y-4">
                  <div>
                    <Skeleton className="w-32 h-4 rounded" />
                    <Skeleton className="w-40 h-6 mt-2 rounded" />
                  </div>

                  <div>
                    <Skeleton className="w-32 h-4 rounded" />
                    <Skeleton className="w-24 h-6 mt-2 rounded" />
                  </div>

                  <div>
                    <Skeleton className="w-32 h-4 rounded" />
                    <Skeleton className="w-40 h-6 mt-2 rounded" />
                  </div>
                </div>

                <Skeleton className="h-px w-full rounded" />

                {/* Subscription Details */}
                <div className="space-y-2">
                  <Skeleton className="w-40 h-6" />
                  <div className="flex items-center justify-between">
                    <Skeleton className="w-32 h-4 rounded" />
                    <Skeleton className="w-24 h-4 rounded" />
                  </div>
                </div>
              </div>
            </CardBody>

            {/* Card Footer */}
            <CardFooter className="px-6 pb-8">
              <Skeleton className="w-full h-10 rounded" />
            </CardFooter>
          </Card>
        </div>
      </Container>
    </section>
  );
};

export default PaymentSuccessLoadingPage;
