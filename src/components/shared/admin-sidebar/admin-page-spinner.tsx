"use client";

import { Spinner } from "@heroui/spinner";

/**
 * Fallback for an admin page's Suspense boundary while it reads the query
 * string. The section frame keeps the width, so the real content does not
 * shift when it replaces this. Screen readers hear the status once.
 */
export default function AdminPageSpinner({
  label = "Loading this page",
}: {
  label?: string;
}) {
  return (
    <div aria-busy="true" className="flex min-h-64 items-center justify-center">
      <Spinner label={label} color="current" size="sm" />
      <p className="sr-only" role="status">
        {label}
      </p>
    </div>
  );
}
