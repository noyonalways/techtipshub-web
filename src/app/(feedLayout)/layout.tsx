import {
  FeedButtonsForSmallDevice,
} from "@/components/modules/feed/feed-buttons";
import LeftSideBar from "@/components/modules/feed/left-sidebar";
import RightSideBar from "@/components/modules/feed/right-sidebar";
import { Navbar } from "@/components/shared/navbar";

interface IProps {
  children: React.ReactNode;
}

const FeedLayout = ({ children }: IProps) => {
  return (
    <>
      <Navbar />
      <section className="w-full">
        <div className="mx-auto flex w-full max-w-[88rem] flex-col items-start lg:flex-row">
          {/* Left rail: persistent navigation */}
          <LeftSideBar />

          {/* Main content: the reading column */}
          <div className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
            <div className="mb-5 flex items-center gap-3 lg:hidden">
              <FeedButtonsForSmallDevice />
            </div>
            <div className="mx-auto w-full max-w-[47.5rem]">{children}</div>
          </div>

          {/* Right rail: categories + site links */}
          <RightSideBar />
        </div>
      </section>
    </>
  );
};

export default FeedLayout;
