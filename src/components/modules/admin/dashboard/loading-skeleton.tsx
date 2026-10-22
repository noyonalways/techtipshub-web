import { Card, CardBody, CardHeader } from "@heroui/card";
import { Skeleton } from "@heroui/skeleton";

interface IProps {}

const DashboardContentSkeleton = ({}: IProps) => {
  return (
    <div className="flex flex-col">
      <div className="flex-grow space-y-4">
        <div className="space-y-2">
          <h2 className="text-lg font-medium">Current Month</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {/* Skeletons for cards */}
            {Array.from({ length: 8 }).map((_, index) => (
              <Card key={index} shadow="sm" radius="sm">
                <CardBody>
                  <div className="flex items-center gap-2">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div className="space-y-1">
                      <Skeleton className="w-32 h-5 rounded" />
                      <Skeleton className="w-16 h-7 rounded" />
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    <Skeleton className="w-8 h-5 rounded" />
                    <Skeleton className="w-16 h-5 rounded" />
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <h2 className="text-lg font-medium">All Time</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {/* Skeletons for cards */}
            {Array.from({ length: 8 }).map((_, index) => (
              <Card key={index} shadow="sm" radius="sm">
                <CardBody>
                  <div className="flex items-center gap-2">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div className="space-y-1">
                      <Skeleton className="w-32 h-5 rounded" />
                      <Skeleton className="w-16 h-7 rounded" />
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
        <div className="grid gap-4 mt-4 md:grid-cols-2">
          {/* Skeleton for the Overview Chart */}
          <Card shadow="sm" radius="sm" className="col-span-full md:col-span-1">
            <CardHeader>
              <h3 className="text-xl font-semibold">Overview</h3>
            </CardHeader>
            <CardBody>
              <Skeleton className="w-full h-80 rounded" />
            </CardBody>
          </Card>
          {/* Skeleton for Recent Activity Table */}
          <Card shadow="sm" radius="sm" className="col-span-full md:col-span-1">
            <CardHeader>
              <h3 className="text-xl font-semibold">Recent Activity</h3>
            </CardHeader>
            <CardBody>
              {Array.from({ length: 6 }).map((_, index) => (
                <Card key={index} shadow="none" radius="sm">
                  <CardBody>
                    <Skeleton className="w-full h-7 rounded" />
                  </CardBody>
                </Card>
              ))}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardContentSkeleton;
