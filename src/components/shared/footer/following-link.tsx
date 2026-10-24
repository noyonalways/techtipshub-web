"use client";

import { useUser } from "@/context/user.provider";
import Link from "next/link";

/**
 * "Following" in the footer, for a signed-in reader only.
 *
 * The session lives in the browser already (`UserProvider` loads it for the
 * navigation bar), so the footer reads it from there instead of asking the
 * server. A signed-out reader - and every crawler - gets exactly the static
 * footer, and no page has to render per request just to hide one link.
 */
const linkClass =
  "inline-flex min-h-8 items-center text-sm text-default-600 underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus/70";

const FollowingLink = () => {
  const { user, isLoading } = useUser();

  if (!user || isLoading) return null;

  return (
    <li>
      <Link className={linkClass} href="/following">
        Following
      </Link>
    </li>
  );
};

export default FollowingLink;
