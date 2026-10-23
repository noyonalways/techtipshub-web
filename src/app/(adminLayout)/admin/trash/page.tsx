"use client";

import TrashManager from "@/components/admin/trash-manager";
import AdminPageHeader from "@/components/modules/admin/kit/page-header";
import { useAdminTitle } from "@/components/shared/admin-sidebar/use-admin-title";
import ButtonLink from "@/components/ui/button-link";
import { RiArrowLeftLine } from "react-icons/ri";

const TrashPage = () => {
  useAdminTitle("Trash");

  return (
    <div>
      <AdminPageHeader
        title="Trash"
        description="Articles and accounts that were removed but can still come back. A restore does not bring back the comments, views and votes that went with the item."
        actions={
          <ButtonLink
            href="/admin/manage-blogs"
            variant="bordered"
            size="sm"
            startContent={<RiArrowLeftLine aria-hidden />}
          >
            Articles
          </ButtonLink>
        }
      />
      <TrashManager />
    </div>
  );
};

export default TrashPage;
