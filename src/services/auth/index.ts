"use server";

import envConfig from "@/config/env.config";
import axiosInstance from "@/lib/AxiosInstance";
import { TLoggedInUser, TLogin } from "@/types";
import { jwtDecode } from "jwt-decode";
import { cookies } from "next/headers";

const ACCESS_TOKEN_COOKIE = "tth_access_token";
const REFRESH_TOKEN_COOKIE = "tth_refresh_token";

const cookieOptions = {
  secure: envConfig.NODE_ENV === "production",
  httpOnly: true,
  maxAge: 1000 * 60 * 60 * 24 * 60 * 365,
} as const;

const setAuthCookies = async (accessToken: string, refreshToken: string) => {
  const cookieStore = await cookies();

  cookieStore.set(ACCESS_TOKEN_COOKIE, accessToken, cookieOptions);
  cookieStore.set(REFRESH_TOKEN_COOKIE, refreshToken, cookieOptions);
};

// register a new user
export const registerUser = async (payload: FormData) => {
  try {
    const res = await axiosInstance.post("/auth/register", payload);

    return res.data;
  } catch (err: any) {
    return err?.response?.data;
  }
};

// login existing user
export const loginUser = async (payload: TLogin) => {
  try {
    const res = await axiosInstance.post("/auth/login", payload);

    if (res?.data.success) {
      await setAuthCookies(
        res.data.data.accessToken,
        res.data.data.refreshToken
      );
    }

    return res?.data;
  } catch (err: any) {
    return err?.response?.data;
  }
};

// social login
export const socialLogin = async (payload: {
  email: string;
  fullName: string;
  profilePicture?: string;
}) => {
  try {
    const res = await axiosInstance.post("/auth/social-login", payload);

    if (res?.data.success) {
      await setAuthCookies(
        res.data.data.accessToken,
        res.data.data.refreshToken
      );
    }

    return res?.data;
  } catch (err: any) {
    return err?.response?.data;
  }
};

// logout user
export const logOutUser = async () => {
  const cookieStore = await cookies();

  cookieStore.delete(ACCESS_TOKEN_COOKIE);
  cookieStore.delete(REFRESH_TOKEN_COOKIE);
};

// get current logged in user details
export const getCurrentUser = async () => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  let decodedToken: TLoggedInUser | null = null;

  if (accessToken) {
    decodedToken = jwtDecode<TLoggedInUser>(accessToken);
  }

  return decodedToken;
};

// get user profile info
export const getProfileInfo = async () => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  try {
    const res = await fetch(`${envConfig.baseApi}/auth/me`, {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return res.json();
  } catch (err: any) {
    return err;
  }
};

// forget password
export const forgetPassword = async (payload: { email: string }) => {
  try {
    const res = await axiosInstance.post("/auth/forget-password", payload);

    return res.data;
  } catch (err: any) {
    return err?.response?.data;
  }
};

// reset password
export const resetPassword = async (payload: {
  newPassword: string;
  token: string;
}) => {
  const { token, ...body } = payload;

  try {
    // The token identifies the account; it is never written into the URL.
    const res = await axiosInstance.post("/auth/reset-password", body, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return res.data;
  } catch (err: any) {
    return err?.response?.data;
  }
};

export const getNewAccessToken = async () => {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;

    const res = await axiosInstance({
      url: "/auth/refresh-token",
      method: "POST",
      withCredentials: true,
      headers: {
        cookie: `refreshToken=${refreshToken}`,
      },
    });

    return res?.data;
  } catch (err: any) {
    return err?.response?.data;
  }
};
