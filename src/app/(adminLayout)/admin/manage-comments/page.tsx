"use client";

import CommentsTable from "@/components/admin/comments-table";
import AdminPageHeader from "@/components/modules/admin/kit/page-header";
import AdminPageSpinner from "@/components/shared/admin-sidebar/admin-page-spinner";
import { useAdminTitle } from "@/components/shared/admin-sidebar/use-admin-title";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

/** `?within=24h|7d` seeds the window, so a link from the queue opens on it. */
function CommentsBody() {
  const searchParams = useSearchParams();
  const initialWithin = searchParams.get("within") ?? undefined;

  return <CommentsTable initialWithin={initialWithin} />;
}

const ManageCommentsPage = () => {
  useAdminTitle("Comments");

  return (
    <div>
      <AdminPageHeader
        title="Comments"
        description="Every comment across the site, newest first. Read one in full before you decide, and remember that a deletion cannot be undone."
        actions={
          <Link
            href="/admin/moderation"
            className="inline-flex min-h-11 items-center rounded-[6px] border border-default-300 px-3.5 text-sm font-medium text-foreground transition-colors hover:bg-default-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:min-h-9"
          >
            Back to moderation
          </Link>
        }
      />
      <Suspense fallback={<AdminPageSpinner label="Loading comments" />}>
        <CommentsBody />
      </Suspense>
    </div>
  );
};

export default ManageCommentsPage;
