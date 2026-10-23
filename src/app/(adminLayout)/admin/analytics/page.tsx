"use client";

import AdminAnalytics from "@/components/admin/analytics";
import AdminPageHeader from "@/components/modules/admin/kit/page-header";
import { useAdminTitle } from "@/components/shared/admin-sidebar/use-admin-title";

const AnalyticsPage = () => {
  useAdminTitle("Analytics");

  return (
    <div>
      <AdminPageHeader
        title="Analytics"
        description="Where readers go and who writes what they read. Every figure comes from the admin overview and activity endpoints."
      />
      <AdminAnalytics />
    </div>
  );
};

export default AnalyticsPage;
