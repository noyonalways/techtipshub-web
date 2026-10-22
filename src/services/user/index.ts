"use server";

import envConfig from "@/config/env.config";
import axiosInstance from "@/lib/AxiosInstance";
import { TSocialLink } from "@/types";
import { updateTag } from "next/cache";

// get user by username
export const getUserByUsername = async (username: string) => {
  try {
    const res = await fetch(`${envConfig.baseApi}/users/${username}`, {
      cache: "no-store",
      next: {
        tags: ["singleUser"],
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

// get all followers by user id
export const getFollowersByUserId = async (userId: string) => {
  try {
    const res = await fetch(`${envConfig.baseApi}/users/${userId}/followers`, {
      cache: "no-store"
    });

    return await res?.json();
  } catch (error: any) {
    throw new Error(error?.message);
  }
};

// get all following by user id
export const getFollowingByUserId = async (userId: string) => {
  try {
    const res = await fetch(`${envConfig.baseApi}/users/${userId}/following`, {
      cache: "no-store",
    });

    return await res?.json();
  } catch (error: any) {
    throw new Error(error?.message);
  }
};

// get all users (admin only)
export const getAllUsers = async () => {
  try {
    const res = await axiosInstance.get("/users");

    return res.data;
  } catch (err: any) {
    throw new Error(err.message);
  }
};

// block a user by user id
export const blockUser = async (userId: string) => {
  try {
    const res = await axiosInstance.patch(`/users/${userId}/block`);

    return res.data;
  } catch (err: any) {
    throw new Error(err.message);
  }
};

// unblock a user by user id
export const unblockUser = async (userId: string) => {
  try {
    const res = await axiosInstance.patch(`/users/${userId}/unblock`);

    return res.data;
  } catch (err: any) {
    throw new Error(err.message);
  }
};


// update logged in user profile
export const updateProfile = async (payload: FormData) => {
  try {
    const res = await axiosInstance.patch(`/users/update-profile`, payload);


    updateTag("loggedInUserProfile")

    return res.data;
  } catch (err: any) {
    return err.response.data;
  }
};

// update logged in user profile social links
export const updateSocialLinks = async (payload: {
  socialLinks: TSocialLink[]
}) => {
  try {
    const res = await axiosInstance.put(`/users/profile/update-social-links`, payload);

    updateTag("loggedInUserProfile")

    return res?.data;
  } catch (err: any) {
    return err?.response?.data;
  }
};

// make user to admin (admin only)
export const makeAdmin = async (id: string) => {
  try {
    const res = await axiosInstance.patch(`/users/${id}/make-admin`);

    return res?.data;
  } catch (err: any) {
    return err?.response?.data;
  }
}

// delete an user account (amin only)
export const deleteUserAccount = async (id: string) => {
  try {
    const res = await axiosInstance.delete(`/users/${id}`);

    return res?.data;
  } catch (err: any) {
    return err?.response?.data;
  }
};