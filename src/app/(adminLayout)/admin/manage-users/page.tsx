"use client";

import AdminPageHeader from "@/components/modules/admin/kit/page-header";
import AdminPageSpinner from "@/components/shared/admin-sidebar/admin-page-spinner";
import { useAdminTitle } from "@/components/shared/admin-sidebar/use-admin-title";
import ButtonLink from "@/components/ui/button-link";
import UsersTable from "@/components/users-table";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { RiDeleteBinLine } from "react-icons/ri";

/**
 * `?filter=blocked` opens the table on its blocked list, which is how the
 * dashboard's blocked-accounts link lands. Read verbatim; the table decides
 * whether the value names one of its filters.
 */
function ManageUsersTable() {
  const searchParams = useSearchParams();
  const initialFilter = searchParams.get("filter") ?? undefined;

  return <UsersTable initialFilter={initialFilter} />;
}

const ManageUsersPage = () => {
  useAdminTitle("Members");

  return (
    <div>
      <AdminPageHeader
        title="Members"
        description="Search by name, username or email, filter by role and status, then open a member before changing their account."
        actions={
          <ButtonLink
            href="/admin/trash"
            variant="bordered"
            size="sm"
            startContent={<RiDeleteBinLine aria-hidden />}
          >
            Deleted accounts
          </ButtonLink>
        }
      />
      <Suspense fallback={<AdminPageSpinner label="Loading members" />}>
        <ManageUsersTable />
      </Suspense>
    </div>
  );
};

export default ManageUsersPage;
