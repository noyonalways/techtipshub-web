import Container from "@/components/ui/container";
import { Skeleton } from "@heroui/skeleton";

interface IProps {}

const UserLoadingPage: React.FC<IProps> = () => {
  return (
    <section className="py-10">
      <Container>
        <div className="lg:border border-default/50 lg:py-8 lg:px-14 rounded-xl space-y-8 w-full">
          <div className="w-full flex items-start justify-between">
            <div className="flex flex-col space-y-4 lg:space-y-0 lg:flex-row items-start lg:space-x-6">
              <Skeleton className="size-32 lg:size-40 rounded-full" />
              <div className="space-y-4">
                <div className="space-y-2">
                  <Skeleton className="w-[200px] h-[32px] rounded" />
                  <Skeleton className="w-[150px] h-[24px] rounded" />
                </div>

                {/* Verification and Premium Status */}
                <div className="flex items-center space-x-4">
                  <div className="flex space-x-2 items-center">
                    <Skeleton className="w-[100px] h-[24px] rounded" />
                  </div>
                  <div className="flex space-x-2 items-center">
                    <Skeleton className="w-[120px] h-[24px] rounded" />
                  </div>
                </div>

                {/* Following , Followers  total blog posts */}
                <div className="flex items-center space-x-4 ">
                  <Skeleton className="w-[100px] h-[36px] rounded-full" />
                  <Skeleton className="w-[100px] h-[36px] rounded-full" />
                  <Skeleton className="w-[100px] h-[36px] rounded-full" />
                </div>
              </div>
            </div>

            {/* Right Side Action Buttons */}
            <div className="flex items-center space-x-4 absolute right-2 lg:static">
              <Skeleton className="w-[40px] h-[30px] rounded-full" />
              <Skeleton className="w-[60px] h-[30px] rounded-full" />
            </div>
          </div>

          {/* Social Media Links */}
          <div className="border border-default/50 p-4 py-6 lg:p-6 rounded-lg flex flex-col space-y-4 lg:space-y-0 lg:flex-row lg:items-center lg:justify-center lg:space-x-14 w-full">
            <div className="flex space-x-6">
              {Array.from({ length: 6 }).map((_, idx) => (
                <Skeleton
                  key={idx}
                  className="w-[40px] h-[40px] rounded-full"
                />
              ))}
            </div>

            {/* Location */}
            <Skeleton className="w-full h-[20px] rounded" />

            {/* Member Since */}
            <Skeleton className="w-full h-[20px] rounded" />
          </div>

          {/* About Me Section */}
          <div className="border border-default/50 p-4 lg:p-6 rounded-lg space-y-6">
            <Skeleton className="w-[150px] h-[24px] rounded" />
            <Skeleton className="w-full h-[100px] rounded-sm" />
          </div>

          {/* Recent Activity Section */}
          <div className="border border-default/50 p-4 lg:p-6 rounded-lg space-y-6">
            <Skeleton className="w-[200px] h-[24px] rounded" />
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="flex space-x-2 lg:space-x-10">
                <Skeleton className="w-[80px] h-[24px] rounded" />
                <Skeleton className="flex-1 h-[24px] rounded" />
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
};

export default UserLoadingPage;
