import { FeedButtonsForSmallDevice } from "@/components/modules/feed/feed-buttons";
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
      {/* Same width and gutters as the header and the footer, so the rails and
          the reading column sit on the site's one axis. */}
      <div className="mx-auto flex w-full max-w-page items-start px-4 sm:px-6 lg:px-8">
        {/* Left rail: persistent navigation, pinned to the viewport */}
        <LeftSideBar />

        {/* Main content: the reading column */}
        <main className="min-w-0 flex-1 px-0 py-6 lg:px-8">
          <div className="mb-5 flex items-center gap-3 lg:hidden">
            <FeedButtonsForSmallDevice />
          </div>
          <div className="mx-auto w-full max-w-read">{children}</div>
        </main>

        {/* Right rail: categories + site links, pinned to the viewport */}
        <RightSideBar />
      </div>
    </>
  );
};

export default FeedLayout;
