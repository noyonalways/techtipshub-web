"use server";

import axiosInstance from "@/lib/AxiosInstance";

// GET /admin/overview (Admin)
export const getAdminOverview = async () => {
  try {
    const res = await axiosInstance.get("/admin/overview");

    return res.data;
  } catch (error: any) {
    return error?.response?.data;
  }
};

// GET /admin/activity?days= (Admin)
export const getAdminActivity = async (days: number) => {
  try {
    const res = await axiosInstance.get("/admin/activity", {
      params: { days },
    });

    return res.data;
  } catch (error: any) {
    return error?.response?.data;
  }
};
