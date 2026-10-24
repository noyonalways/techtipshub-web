"use server";

import envConfig from "@/config/env.config";
import axiosInstance from "@/lib/AxiosInstance";
import { TSocialLink } from "@/types";
import { updateTag } from "next/cache";

/**
 * A member's public profile.
 *
 * Cached, because it is the same answer for every visitor: this is what lets
 * `/users/<username>` and the follower lists be prerendered instead of
 * rendered per request. Tagged `singleUser` so a profile edit expires it.
 */
export const getUserByUsername = async (username: string) => {
  try {
    const res = await fetch(`${envConfig.baseApi}/users/${username}`, {
      next: {
        tags: ["singleUser"],
        revalidate: 43200,
      },
    });

    return await res?.json();
  } catch (err: any) {
    throw new Error(err?.message);
  }
};

// get user following status
export const getUserFollowingStatus = async (userId: string) => {
  try {
    const res = await axiosInstance.get(`/users/${userId}/follow-status`);

    return res?.data;
  } catch (err: any) {
    return err?.response?.data;
  }
};

// follow a user
export const followUser = async (userId: string) => {
  try {
    const res = await axiosInstance.put(`/users/${userId}/follow`);

    updateTag("singleUser");

    return res.data;
  } catch (err: any) {
    throw new Error(err.message);
  }
};

// unfollow a user
export const unfollowUser = async (userId: string) => {
  try {
    const res = await axiosInstance.delete(`/users/${userId}/unfollow`);

    updateTag("singleUser");

    return res.data;
  } catch (err: any) {
    throw new Error(err.message);
  }
};

/**
 * A member's follower list.
 *
 * Public (the API answers without a session), so it is cached and tagged: the
 * follower pages can then be prerendered instead of rendering per visitor.
 */
export const getFollowersByUserId = async (userId: string) => {
  try {
    const res = await fetch(`${envConfig.baseApi}/users/${userId}/followers`, {
      next: { tags: ["followers"], revalidate: 43200 },
    });

    return await res?.json();
  } catch (error: any) {
    throw new Error(error?.message);
  }
};

/**
 * A member's following list. Public and cached for the same reason as the
 * follower list above.
 */
export const getFollowingByUserId = async (userId: string) => {
  try {
    const res = await fetch(`${envConfig.baseApi}/users/${userId}/following`, {
      next: { tags: ["following"], revalidate: 43200 },
    });

    return await res?.json();
  } catch (error: any) {
    throw new Error(error?.message);
  }
};

// get all users (admin only)
// `GET /admin/users` is built on QueryBuilder, so it already understands `page`,
// `limit`, `searchTerm`, `sort`, `role` and `status`. Forwarding them is what
// lets the members table page through more than its first page.
// Throws with the API's own message on failure so the table shows an error.
export const getAllUsers = async (params?: Record<string, unknown>) => {
  try {
    const res = await axiosInstance.get("/admin/users", { params });

    return res.data;
  } catch (err: any) {
    throw new Error(
      err?.response?.data?.message || err?.message || "Members did not load.",
    );
  }
};

// block a user by user id (admin only)
export const blockUser = async (userId: string) => {
  try {
    const res = await axiosInstance.patch(`/admin/users/${userId}/block`);

    return res.data;
  } catch (err: any) {
    throw new Error(err.message);
  }
};

// unblock a user by user id (admin only)
export const unblockUser = async (userId: string) => {
  try {
    const res = await axiosInstance.patch(`/admin/users/${userId}/unblock`);

    return res.data;
  } catch (err: any) {
    throw new Error(err.message);
  }
};

// update logged in user profile
export const updateProfile = async (payload: FormData) => {
  try {
    const res = await axiosInstance.patch(`/users/update-profile`, payload);

    updateTag("loggedInUserProfile");

    return res.data;
  } catch (err: any) {
    return err.response.data;
  }
};

// update logged in user profile social links
export const updateSocialLinks = async (payload: {
  socialLinks: TSocialLink[];
}) => {
  try {
    const res = await axiosInstance.put(
      `/users/profile/update-social-links`,
      payload,
    );

    updateTag("loggedInUserProfile");

    return res?.data;
  } catch (err: any) {
    return err?.response?.data;
  }
};

// make user to admin (admin only)
export const makeAdmin = async (id: string) => {
  try {
    const res = await axiosInstance.patch(`/admin/users/${id}/make-admin`);

    return res?.data;
  } catch (err: any) {
    return err?.response?.data;
  }
};

// delete an user account (admin only)
export const deleteUserAccount = async (id: string) => {
  try {
    const res = await axiosInstance.delete(`/admin/users/${id}`);

    return res?.data;
  } catch (err: any) {
    return err?.response?.data;
  }
};
