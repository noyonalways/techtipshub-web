"use client";

import BlogsTable from "@/components/blogs-table";
import AdminPageHeader from "@/components/modules/admin/kit/page-header";
import AdminPageSpinner from "@/components/shared/admin-sidebar/admin-page-spinner";
import { useAdminTitle } from "@/components/shared/admin-sidebar/use-admin-title";
import ButtonLink from "@/components/ui/button-link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { FiPlus } from "react-icons/fi";

/** `?sort=` seeds the table's starting tab, read verbatim. */
function ManageBlogsTable() {
  const searchParams = useSearchParams();
  const initialSort = searchParams.get("sort") ?? undefined;

  return <BlogsTable initialSort={initialSort} />;
}

const ManageBlogsPage = () => {
  useAdminTitle("Articles");

  return (
    <div>
      <AdminPageHeader
        section="Articles"
        title="Articles"
        description="Every published piece, newest first. Open one to read it, jump to the editor, or remove it with a reason."
        actions={
          <ButtonLink
            href="/me/blogs/new"
            size="sm"
            startContent={<FiPlus aria-hidden />}
          >
            Write an article
          </ButtonLink>
        }
      />
      <Suspense fallback={<AdminPageSpinner label="Loading articles" />}>
        <ManageBlogsTable />
      </Suspense>
    </div>
  );
};

export default ManageBlogsPage;
