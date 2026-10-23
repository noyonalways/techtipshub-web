"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import AdminPageHeader from "@/components/modules/admin/kit/page-header";
import { findAdminLink } from "@/components/shared/admin-sidebar/admin-links";

interface IProps {
  title: string;
  /** One-line explanation of what this screen is for. */
  description?: string;
  /** Buttons or links aligned to the right of the heading. */
  action?: ReactNode;
  /** Same as `action`, for callers that pass several controls. */
  actions?: ReactNode;
  /** Small inline facts under the title, e.g. counts. */
  meta?: ReactNode;
}

/**
 * Heading block for admin screens. The breadcrumb carries the section, so the
 * eyebrow above the title is gone: it repeated the breadcrumb in larger type.
 */
const DashboardTitle = ({
  title,
  description,
  action,
  actions,
  meta,
}: IProps) => {
  const pathname = usePathname();
  const section = findAdminLink(pathname)?.label;

  return (
    <AdminPageHeader
      title={title}
      description={description}
      actions={actions ?? action}
      meta={meta}
      section={section}
    />
  );
};

export default DashboardTitle;
