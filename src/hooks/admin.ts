import { searchAdmin } from "@/services/admin";
import { useQuery } from "@tanstack/react-query";

export const useAdminSearch = (query: string) => {
  return useQuery({
    queryKey: ["ADMIN_SEARCH", query],
    queryFn: async () => await searchAdmin(query),
    enabled: query.trim().length >= 2,
    staleTime: 30_000,
  });
};
