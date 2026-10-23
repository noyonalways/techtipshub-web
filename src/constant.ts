import { PROTECTED_AREAS, requiresSession } from "@/lib/blog-routes";

/**
 * Routes that need a session. The entries are regular expressions matched
 * against the pathname (see `navbar-dropdown`), so the account area is listed
 * once with a prefix match instead of one line per page.
 */
export const protectedRoutes = [
  "^/profile",
  "^/admin",
  "^/login",
  "^/signup",
  "^/forget-password",
  "^/settings",
  "^/me",
  ...PROTECTED_AREAS.map((area) => `^${area}`),
];

export { requiresSession };
