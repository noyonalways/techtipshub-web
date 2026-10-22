import DashboardTitle from "@/components/dashboard-title";
import DashboardContent from "@/components/modules/admin/dashboard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description:
    "Manage your administrative tasks and insights on TechTips Hub from the dashboard.",
  keywords: "Admin Dashboard, TechTips Hub, admin panel, management, insights",
};

const AdminDashboard = () => {
  return (
    <div>
      <DashboardTitle
        title="Dashboard"
        description="Traffic, engagement and growth across the whole site."
      />
      <DashboardContent />
    </div>
  );
};

export default AdminDashboard;
