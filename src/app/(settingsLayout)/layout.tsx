import { Navbar } from "@/components/shared/navbar";
import UserSidebar from "@/components/shared/user-sidebar";

interface IProps {
  children: React.ReactNode;
}

/**
 * Account settings shell: the site header, a sticky settings rail and a
 * narrower content column than the public pages.
 */
const SettingsLayout: React.FC<IProps> = ({ children }) => {
  return (
    <>
      <Navbar />
      <div className="mx-auto flex w-full max-w-[88rem] flex-col lg:flex-row">
        <UserSidebar />
        <main className="min-w-0 flex-1">
          <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
            {children}
          </div>
        </main>
      </div>
    </>
  );
};

export default SettingsLayout;
