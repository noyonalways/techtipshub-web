import AdBanner from "@/components/adsense/ad-banner";
import { FeedButtonsForSideBar } from "../feed-buttons";
import SubscriptionsStatus from "../subscriptions-status";

interface IProps {}

const LeftSideBar = ({}: IProps) => {
  return (
    <div className="hidden lg:flex xl:basis-[22%] 2xl:basis-[18%] space-y-6 sticky top-16 lg:p-4 border-r border-default/50">
      <div className="flex flex-col h-full min-h-[calc(100vh-90px)] w-full items-stretch relative" >
        {/* Feed buttons at top */}
        <div className="space-y-2">
          <div className="flex flex-col space-y-2">
            <FeedButtonsForSideBar />
          </div>
        </div>

        {/* Ad banner at bottom */}
        <div className="mt-4 absolute bottom-0 left-0 right-0">
          <AdBanner />
        </div>
      </div>
    </div>  
  );
};

export default LeftSideBar;
