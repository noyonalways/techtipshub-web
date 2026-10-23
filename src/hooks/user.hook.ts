import { readMemberPage } from "@/services/admin/members";
import {
  blockUser,
  deleteUserAccount,
  followUser,
  getAllUsers,
  makeAdmin,
  unblockUser,
  unfollowUser,
  updateProfile,
  updateSocialLinks,
} from "@/services/user";
import { TSocialLink } from "@/types";
import type { IAdminMembersParams } from "@/types/admin.type";
import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

// follow a user
export const useFollowUser = () => {
  return useMutation<any, Error, string>({
    mutationKey: ["FOLLOW_USER"],
    mutationFn: async (payload) => await followUser(payload),
    onSuccess: () => {
      toast.success("User following successfully", {
        id: "user-following",
      });
    },
    onError: (error) => {
      toast.error(error?.message || "Something went wrong!", {
        id: "user-following-error",
      });
    },
  });
};

// unfollow a user
export const useUnfollowUser = () => {
  return useMutation<any, Error, string>({
    mutationKey: ["UNFOLLOW_USER"],
    mutationFn: async (payload) => await unfollowUser(payload),
    onSuccess: () => {
      toast.success("User Unfollowing successfully", {
        id: "user-unfollowing",
      });
    },
    onError: (error) => {
      toast.error(error?.message || "Something went wrong!", {
        id: "user-unfollowing-error",
      });
    },
  });
};

// get all users
// Params are part of the cache key: each page, search and filter combination
// keeps its own entry. Callers that pass nothing still get the "first
// response" shape other screens read (`["GET_ALL_USERS"]`).
// `rows` and `meta` are the same answer already unpacked, so a table can page.
export const useGetAllUsers = (params?: Record<string, unknown>) => {
  const query = useQuery({
    queryKey: params ? ["GET_ALL_USERS", params] : ["GET_ALL_USERS"],
    queryFn: async () => await getAllUsers(params),
    placeholderData: keepPreviousData,
  });

  const { rows, meta } = readMemberPage(
    query.data,
    params as IAdminMembersParams | undefined,
  );

  return { ...query, rows, meta };
};

// block user
export const useBlockUser = () => {
  return useMutation<any, Error, string>({
    mutationKey: ["BLOCK_USER"],
    mutationFn: async (payload) => await blockUser(payload),
    onSuccess: () => {
      toast.success("User blocked successfully", {
        id: "user-blocked",
      });
    },
    onError: (error) => {
      toast.error(error?.message || "Something went wrong!", {
        id: "user-blocked-error",
      });
    },
  });
};

// unblock user
export const useUnblockUser = () => {
  return useMutation<any, Error, string>({
    mutationKey: ["UNBLOCK_USER"],
    mutationFn: async (payload) => await unblockUser(payload),
    onSuccess: () => {
      toast.success("User unblocked successfully", {
        id: "user-unblocked",
      });
    },
    onError: (error) => {
      toast.error(error?.message || "Something went wrong!", {
        id: "user-unblocked-error",
      });
    },
  });
};

// make user to admin (admin only)
export const useMakeAdmin = () => {
  return useMutation<any, Error, string>({
    mutationKey: ["USER_MAKE_ADMIN"],
    mutationFn: async (userId) => await makeAdmin(userId),
    onSuccess: (data) => {
      if (!data?.success) {
        toast.error(data?.message, {
          id: "user-make-admin",
        });
      }

      if (data?.success) {
        toast.success(data?.message, {
          id: "user-make-admin",
        });
      }
    },
  });
};

// delete an user account (admin only)

export const useDeleteUserAccount = () => {
  return useMutation<any, Error, string>({
    mutationKey: ["DELETE_USER_ACCOUNT"],
    mutationFn: async (userId) => await deleteUserAccount(userId),
    onSuccess: (data) => {
      if (!data?.success) {
        toast.error(data?.message, {
          id: "delete-user-account",
        });
      }

      if (data?.success) {
        toast.success(data?.message, {
          id: "delete-user-account",
        });
      }
    },
  });
};

// update logged in user profile details
export const useUpdateProfile = () => {
  return useMutation<any, Error, FormData>({
    mutationKey: ["UPDATE_PROFILE"],
    mutationFn: async (payload) => await updateProfile(payload),
    onSuccess: (data) => {
      if (data?.success) {
        toast.success(data?.message, {
          id: "user-profile-updated",
        });
      }
    },
  });
};

// update logged in user profile social links
export const useUpdateSocialLinks = () => {
  return useMutation<any, Error, { socialLinks: TSocialLink[] }>({
    mutationKey: ["UPDATE_SOCIAL_LINKS"],
    mutationFn: async (payload) => await updateSocialLinks(payload),
    onSuccess: (data) => {
      if (!data?.success) {
        toast.error(data?.message, {
          id: "user-social-links-updated",
        });
      }

      if (data?.success) {
        toast.success(data?.message, {
          id: "user-social-links-updated",
        });
      }
    },
  });
};
