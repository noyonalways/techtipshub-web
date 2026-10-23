"use client";

import ModerationQueue from "@/components/admin/moderation-queue";
import AdminPageHeader from "@/components/modules/admin/kit/page-header";
import { useAdminTitle } from "@/components/shared/admin-sidebar/use-admin-title";

const ModerationPage = () => {
  useAdminTitle("Moderation");

  return (
    <div>
      <AdminPageHeader
        title="Moderation"
        description="The counts that need a decision, then the three lists behind them. Open an item, keep it or remove it, and the counts follow."
      />
      <ModerationQueue />
    </div>
  );
};

export default ModerationPage;
