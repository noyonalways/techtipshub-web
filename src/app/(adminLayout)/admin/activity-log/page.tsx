"use client";

import ActivityLog from "@/components/admin/activity-log";
import AdminPageHeader from "@/components/modules/admin/kit/page-header";
import { useAdminTitle } from "@/components/shared/admin-sidebar/use-admin-title";

const ActivityLogPage = () => {
  useAdminTitle("Activity Log");

  return (
    <div>
      <AdminPageHeader
        title="Activity log"
        description="Who did what, newest first, as the API recorded it. Entries are grouped by day, and each one links back to the screen it came from where that route exists."
      />
      <ActivityLog />
    </div>
  );
};

export default ActivityLogPage;
