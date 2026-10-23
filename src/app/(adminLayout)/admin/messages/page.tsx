"use client";

import MessagesInbox from "@/components/admin/messages-inbox";
import AdminPageHeader from "@/components/modules/admin/kit/page-header";
import AdminPageSpinner from "@/components/shared/admin-sidebar/admin-page-spinner";
import { useAdminTitle } from "@/components/shared/admin-sidebar/use-admin-title";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

/** The inbox id arrives from mail notifications, so a stray long or empty
 * value is treated as no deep link rather than fetched. */
function MessagesBody() {
  const searchParams = useSearchParams();
  const raw = searchParams.get("message") ?? "";
  const initialMessageId = raw.length > 0 && raw.length <= 64 ? raw : undefined;
  const initialStatus = searchParams.get("status") ?? undefined;

  return (
    <MessagesInbox
      initialMessageId={initialMessageId}
      initialStatus={initialStatus}
    />
  );
}

const MessagesPage = () => {
  useAdminTitle("Messages");

  return (
    <div>
      <AdminPageHeader
        title="Messages"
        description="Everything visitors send through the contact form. Read a message, reply to it from your own mail app, then move it out of the unread pile."
        actions={
          <Link
            href="/admin/activity-log"
            className="inline-flex min-h-11 items-center rounded-[6px] border border-default-300 px-3.5 text-sm font-medium text-foreground transition-colors hover:bg-default-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:min-h-9"
          >
            Activity log
          </Link>
        }
      />
      <Suspense fallback={<AdminPageSpinner label="Loading the inbox" />}>
        <MessagesBody />
      </Suspense>
    </div>
  );
};

export default MessagesPage;
