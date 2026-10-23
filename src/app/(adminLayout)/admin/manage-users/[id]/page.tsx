"use client";

import MemberDetail from "@/components/admin/member-detail";
import AdminPageHeader from "@/components/modules/admin/kit/page-header";
import AdminPageSpinner from "@/components/shared/admin-sidebar/admin-page-spinner";
import { useAdminTitle } from "@/components/shared/admin-sidebar/use-admin-title";
import { useParams } from "next/navigation";
import { Suspense } from "react";

/** The route segment is read on the client now, so the body waits for it. */
function MemberDetailBody() {
  const params = useParams<{ id: string }>();

  return <MemberDetail memberId={params.id} />;
}

const MemberDetailPage = () => {
  useAdminTitle("Member");

  return (
    <div>
      <AdminPageHeader
        title="Member"
        description="What this member has published and who they follow, before you change their account."
      />
      <Suspense fallback={<AdminPageSpinner label="Loading this member" />}>
        <MemberDetailBody />
      </Suspense>
    </div>
  );
};

export default MemberDetailPage;
