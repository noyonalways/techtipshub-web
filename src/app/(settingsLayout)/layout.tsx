import { Navbar } from "@/components/shared/navbar";
import UserSidebar from "@/components/shared/user-sidebar";
import type { Metadata } from "next";

interface IProps {
  children: React.ReactNode;
}

/** Every screen under `/settings` belongs to one signed-in member. */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/**
 * Account settings shell: the site header, a sticky settings rail and the
 * content column beside it. Sits on the same page width and gutters as the
 * feed and the editorial pages, so the rail starts where the header does.
 */
const SettingsLayout: React.FC<IProps> = ({ children }) => {
  return (
    <>
      <Navbar />
      <div className="mx-auto flex w-full max-w-page flex-col px-4 sm:px-6 lg:flex-row lg:px-8">
        <UserSidebar />
        <main className="min-w-0 flex-1">
          <div className="w-full py-8 lg:pl-10 lg:py-12">{children}</div>
        </main>
      </div>
    </>
  );
};

export default SettingsLayout;
