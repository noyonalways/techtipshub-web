import { getAdminActivity, getAdminOverview } from "@/services/admin/overview";
import { useQuery } from "@tanstack/react-query";

/**
 * Dashboard queries. `useAdminActivity(days)` refetches per range because
 * `days` is the query key; both throw on failure so the card can say so.
 */
export const useAdminOverview = () => {
  return useQuery({
    queryKey: ["ADMIN_OVERVIEW"],
    queryFn: async () => await getAdminOverview(),
  });
};

export const useAdminActivity = (days: number) => {
  return useQuery({
    queryKey: ["ADMIN_ACTIVITY", days],
    queryFn: async () => await getAdminActivity(days),
  });
};
