import DashboardTitle from "@/components/dashboard-title";
import UsersTable from "@/components/users-table";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manage Users | Admin Dashboard",
  description:
    "Admin panel for managing user accounts, permissions, and access controls.",
  keywords: "admin, manage users, user management, access control, dashboard",
};

const ManageUsersPage = () => {
  return (
    <div>
      <DashboardTitle
        title="Manage Users"
        description="Search members, change roles and moderate accounts."
      />
      <UsersTable />
    </div>
  );
};

export default ManageUsersPage;
