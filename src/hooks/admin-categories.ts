"use client";

/**
 * Category hooks.
 *
 * useAdminCategories({ searchTerm? })
 *   -> { data: <API envelope>, rows: IAdminCategory[], total, isLoading,
 *        isFetching, isError, refetch }
 *      reads `GET /admin/categories` (`{ success, data: { result, total } }`).
 *      `searchTerm` is sent to the API; when the API ignores it the screen can
 *      still filter `rows` on the client, which is what it did before.
 *
 * Mutations: useCreateCategory(), useUpdateCategory(), useDeleteCategory().
 * A duplicate name (409) resolves with the API body instead of throwing, so the
 * form can read `message`/`errorSources`; each one refreshes the list.
 */
import {
  createCategory,
  deleteCategory,
  getAdminCategories,
  readCategoryList,
  updateCategory,
  type ICategoryPayload,
} from "@/services/admin/categories";
import type {
  IAdminCategoriesParams,
  IAdminCategory,
} from "@/types/admin.type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  keepPreviousData,
  toAdminList,
  type IAdminList,
  type IAdminListResult,
} from "./admin-list";

export const CATEGORIES_KEY = ["ADMIN_CATEGORIES"] as const;

export type TAdminCategoriesParams = IAdminCategoriesParams;

type TCategoryListResult = IAdminListResult<IAdminCategory> & { total: number };

/**
 * Every category, filtered by `searchTerm` when one is given. The list is
 * small enough that the panel asks for all of it in one request.
 */
export const useAdminCategories = (
  params: TAdminCategoriesParams = {},
): IAdminList<IAdminCategory, TCategoryListResult> & { total: number } => {
  const query = useQuery({
    queryKey: [...CATEGORIES_KEY, params.searchTerm ?? ""],
    queryFn: async () => {
      const payload = await getAdminCategories({
        searchTerm: params.searchTerm || undefined,
      });
      const { rows, total } = readCategoryList(payload);

      return {
        rows,
        total,
        meta: { page: 1, limit: total, total, totalPages: total > 0 ? 1 : 0 },
        raw: payload,
      };
    },
    placeholderData: keepPreviousData,
  });

  const list = toAdminList<IAdminCategory, TCategoryListResult>(query);

  return { ...list, total: query.data?.total ?? 0 };
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, ICategoryPayload>({
    mutationKey: ["CREATE_CATEGORY"],
    mutationFn: async (payload) => await createCategory(payload),
    onSuccess: (data) => {
      // A duplicate name comes back as `{ success: false }` with a 409; the
      // form puts that message on the name field, so no toast here.
      if (data?.success) {
        toast.success(data?.message || "Category created", {
          id: "create-category",
        });
        queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY });
      }
    },
    onError: (error) => {
      toast.error(error?.message || "The category could not be created", {
        id: "create-category-error",
      });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, { id: string; payload: ICategoryPayload }>({
    mutationKey: ["UPDATE_CATEGORY"],
    mutationFn: async (payload) => await updateCategory(payload),
    onSuccess: (data) => {
      if (data?.success) {
        toast.success(data?.message || "Category updated", {
          id: "update-category",
        });
        queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY });
      }
    },
    onError: (error) => {
      toast.error(error?.message || "The category could not be updated", {
        id: "update-category-error",
      });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, string>({
    mutationKey: ["DELETE_CATEGORY"],
    mutationFn: async (id) => await deleteCategory(id),
    onSuccess: (data) => {
      if (data?.success) {
        toast.success(data?.message || "Category deleted", {
          id: "delete-category",
        });
        queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY });
      } else if (data?.message) {
        // 409: the category still has articles.
        toast.error(data.message, { id: "delete-category" });
      }
    },
    onError: (error) => {
      toast.error(error?.message || "The category could not be deleted", {
        id: "delete-category-error",
      });
    },
  });
};
