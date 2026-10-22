"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { adminLinks } from "@/components/shared/admin-sidebar/admin-links";

interface IProps {
  title: string;
  /** One-line explanation of what this screen is for. */
  description?: string;
  /** Buttons or links aligned to the right of the heading. */
  action?: ReactNode;
}

/**
 * Heading block for admin screens. Compact, with the section name as the
 * eyebrow so the current location is obvious inside the shell.
 */
const DashboardTitle = ({ title, description, action }: IProps) => {
  const pathname = usePathname();
  const section =
    adminLinks.find((link) => pathname?.startsWith(link.href))?.label ??
    "Admin";

  return (
    <div className="mb-6 flex flex-col gap-4 border-b border-default/60 pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <p className="text-[0.6875rem] font-semibold uppercase tracking-wider text-primary">
          {section}
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="mt-1 max-w-2xl text-sm text-default-500">
            {description}
          </p>
        )}
      </div>
      {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
    </div>
  );
};

export default DashboardTitle;
