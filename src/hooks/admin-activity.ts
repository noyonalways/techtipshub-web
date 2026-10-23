import { getAdminLogs } from "@/services/admin/activity";
import { useQuery } from "@tanstack/react-query";

/**
 * The admin log.
 *
 * `GET /admin/logs?limit=` is a flat newest-first list with no page or search
 * on the API, so the screen caps `limit` (at most 200) and narrows what it
 * received. The query key carries `limit`; a failed request leaves the screen
 * free to show `isError` instead of an empty log.
 */
export const useAdminLogs = (limit = 50) => {
  return useQuery({
    queryKey: ["ADMIN_LOGS", limit],
    queryFn: async () => await getAdminLogs(limit),
  });
};
