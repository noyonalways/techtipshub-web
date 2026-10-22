
import Container from "@/components/ui/container";
import { Card, CardBody, CardFooter, CardHeader } from "@heroui/card";
import { Skeleton } from "@heroui/skeleton";

interface IProps {}

const PaymentCancelLoadingPage = ({}: IProps) => {
  return (
    <section className="py-10 lg:py-20">
      <Container>
        <div className="flex justify-center items-center relative overflow-hidden">

          <Card
            className="w-full max-w-md lg:backdrop-blur-lg shadow-sm"
            radius="sm"
          >
            {/* Card Header */}
            <CardHeader className="flex flex-col items-center gap-3 pt-8 pb-6 bg-gradient-to-r from-default-50 to-default-100">
              <Skeleton className="w-16 h-16 rounded-full" />
              <div className="flex flex-col items-center space-y-2">
                <Skeleton className="w-40 h-6" />
                <Skeleton className="w-28 h-4" />
              </div>
            </CardHeader>

            {/* Card Body */}
            <CardBody className="px-6 py-8">
              <div className="space-y-6">
                {/* Cancelled Message Section */}
                <Skeleton className="h-20 w-full rounded-lg" />

                <Skeleton className="h-px w-full" />

                {/* Transaction Details */}
                <div className="space-y-4">
                  <div>
                    <Skeleton className="w-32 h-4 rounded" />
                    <Skeleton className="w-40 h-6 rounded mt-2" />
                  </div>

                  <div>
                    <Skeleton className="w-32 h-4 rounded" />
                    <Skeleton className="w-40 h-6 rounded mt-2" />
                  </div>

                  <div>
                    <Skeleton className="w-32 h-4 rounded" />
                    <Skeleton className="w-24 h-6 rounded mt-2" />
                  </div>

                  <div>
                    <Skeleton className="w-32 h-4 rounded" />
                    <Skeleton className="w-40 h-6 rounded mt-2" />
                  </div>
                </div>
              </div>
            </CardBody>

            {/* Card Footer */}
            <CardFooter className="flex flex-col px-6 pb-8 space-y-4">
              <Skeleton className="w-full h-10 rounded" />
              <Skeleton className="w-full h-10 rounded" />
            </CardFooter>
          </Card>
        </div>
      </Container>
    </section>
  );
};

export default PaymentCancelLoadingPage;
