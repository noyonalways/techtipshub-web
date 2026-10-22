import envConfig from "@/config/env.config";
import axios from "axios";
import { cookies } from "next/headers";

const ACCESS_TOKEN_COOKIE = "tth_access_token";
const REFRESH_TOKEN_COOKIE = "tth_refresh_token";

const axiosInstance = axios.create({
  baseURL: envConfig.baseApi,
  withCredentials: true,
});

// Add a request interceptor
axiosInstance.interceptors.request.use(
  async function (config) {
    // Do something before request is sent
    const cookieStore = await cookies();
    const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }

    return config;
  },
  function (error) {
    // Do something with request error
    return Promise.reject(error);
  }
);

// Refresh the access token using the stored refresh token.
// Defined here (instead of importing from "@/services/auth") to avoid a
// circular import between the auth service and this Axios instance.
const refreshAccessToken = async () => {
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

// Add a response interceptor
axiosInstance.interceptors.response.use(
  function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    return response;
  },
  async function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    if (
      error?.response?.data?.statusCode === 401 &&
      error?.response?.data?.message === "TokenExpiredError"
    ) {
      const config = error.config;

      console.log("sending refresh token...");

      const res = await refreshAccessToken();
      const accessToken = res?.data?.accessToken;

      if (!accessToken) {
        return Promise.reject(error);
      }

      config.headers["Authorization"] = `Bearer ${accessToken}`;

      const cookieStore = await cookies();

      cookieStore.set(ACCESS_TOKEN_COOKIE, accessToken, {
        secure: envConfig.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 60 * 365,
      });

      return axiosInstance(config);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
