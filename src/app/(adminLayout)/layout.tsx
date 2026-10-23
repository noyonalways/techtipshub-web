import type { Metadata } from "next";
import Link from "next/link";
import AdminSidebar from "@/components/shared/admin-sidebar";
import { AdminShellProvider } from "@/components/shared/admin-sidebar/admin-shell";
import AdminTopbar from "@/components/shared/admin-sidebar/admin-topbar";

export const metadata: Metadata = {
  title: {
    default: "Admin",
    template: "%s | Admin | TechTipsHub",
  },
  description:
    "Admin panel for TechTipsHub: articles, comments, members, messages and site settings.",
  robots: { index: false, follow: false },
};

/**
 * Admin shell. Rendered on the server; only the rail, the drawer and the top
 * bar hydrate.
 *
 * One column of content beside a fixed rail: content sits on the page surface,
 * panels carry the hairlines. The rail and the top bar own their sticky
 * offsets; putting `sticky` or `overflow-hidden` on this flex row would break
 * both, because an overflowing ancestor kills sticky.
 *
 * The page keeps the site's warm paper; the white belongs to the cards on it.
 * Panels, stat tiles and toolbar fields take `content1`, which is white in the
 * light theme and the raised charcoal step in the dark one, so each one reads
 * as a sheet lying on the page.
 *
 * Pages keep their own spacing between blocks. The frame only sets the
 * width, the top air and the bottom room, so a page can never render wider
 * than `max-w-page` or flush against the bar.
 */
const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <AdminShellProvider>
      <div className="min-h-dvh lg:flex">
        <a
          href="#admin-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[60] focus:rounded-[6px] focus:bg-foreground focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-background"
        >
          Skip to admin content
        </a>

        <AdminSidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          <AdminTopbar />

          <main
            id="admin-content"
            tabIndex={-1}
            className="w-full flex-1 px-4 pb-16 pt-6 focus:outline-none sm:px-5 lg:px-6 lg:pt-8"
          >
            <div className="mx-auto w-full max-w-page">{children}</div>
          </main>

          <footer className="border-t border-default/60 px-4 py-4 sm:px-5 lg:px-6">
            <div className="mx-auto flex max-w-page flex-wrap items-center justify-between gap-x-4 gap-y-1 text-xs text-default-600">
              <span>TechTipsHub admin</span>
              <span>
                Every change is recorded in the{" "}
                <Link
                  href="/admin/activity-log"
                  className="rounded-sm underline decoration-default-300 underline-offset-2 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  activity log
                </Link>
                .
              </span>
            </div>
          </footer>
        </div>
      </div>
    </AdminShellProvider>
  );
};

export default AdminLayout;
