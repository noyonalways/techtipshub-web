"use client";

import DashboardContent from "@/components/modules/admin/dashboard";
import AdminPageHeader from "@/components/modules/admin/kit/page-header";
import { useAdminTitle } from "@/components/shared/admin-sidebar/use-admin-title";

const AdminDashboard = () => {
  useAdminTitle("Admin");

  return (
    <div>
      <AdminPageHeader
        title="Dashboard"
        description="Traffic, engagement and growth across the whole site. Every figure comes from the admin overview endpoints."
      />
      <DashboardContent />
    </div>
  );
};

export default AdminDashboard;
