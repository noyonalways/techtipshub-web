import AdminSidebar from "@/components/shared/admin-sidebar";
import NavarDropdown from "@/components/ui/navbar-dropdown";
import { adminLinks } from "@/components/shared/admin-sidebar/admin-links";

/**
 * Admin shell.
 *
 * Rendered on the server so the page title and date are stable on reload; the
 * only interactive parts are the sidebar and the account menu in the top bar.
 */
const AdminLayout = async ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="min-h-dvh lg:flex">
      <AdminSidebar />

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-40 hidden h-16 items-center justify-between gap-4 border-b border-default/60 bg-background/90 px-6 backdrop-blur-md lg:flex xl:px-8">
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-2 text-sm">
              <li className="text-default-500">Admin</li>
              {adminLinks.map((link) => (
                <li key={link.id} className="hidden items-center gap-2 xl:flex">
                  <span aria-hidden className="text-default-300">
                    /
                  </span>
                  <span className="text-default-700">{link.label}</span>
                </li>
              ))}
            </ol>
          </nav>

          <div className="flex items-center gap-4">
            <span className="text-xs uppercase tracking-wider text-default-400">
              {today}
            </span>
            <div className="h-5 w-px bg-default/60" aria-hidden />
            <NavarDropdown />
          </div>
        </header>

        <main className="mx-auto w-full max-w-[100rem] px-4 pb-16 pt-6 sm:px-6 lg:px-8 lg:pt-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
