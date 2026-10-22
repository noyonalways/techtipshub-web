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
      <div className="mx-auto flex w-full max-w-[88rem] items-start">
        {/* Left rail: persistent navigation, pinned to the viewport */}
        <LeftSideBar />

        {/* Main content: the reading column */}
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mb-5 flex items-center gap-3 lg:hidden">
            <FeedButtonsForSmallDevice />
          </div>
          <div className="mx-auto w-full max-w-[47.5rem]">{children}</div>
        </main>

        {/* Right rail: categories + site links, pinned to the viewport */}
        <RightSideBar />
      </div>
    </>
  );
};

export default FeedLayout;
