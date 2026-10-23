import envConfig from "@/config/env.config";
import { getAccessToken } from "@/lib/fetch-with-auth";
import axios from "axios";

/**
 * A client build must never pull an API URL out of the environment: in the
 * browser a bare `NEXT_PUBLIC_*` path would point at the backend directly and
 * skip the app's own `/api/admin` handler. Snapshots that run on the server
 * keep using the configured base.
 */
const serverBaseApi =
  typeof process === "undefined" || typeof window !== "undefined"
    ? "/api/v1"
    : (envConfig.baseApi ?? "/api/v1");

const axiosInstance = axios.create({
  baseURL: serverBaseApi,
  withCredentials: true,
});

/**
 * Where an admin call goes once it leaves the browser.
 *
 * Admin screens render on the client, where `getAccessToken` cannot read the
 * httpOnly session cookie. Those calls go to this app's own
 * `/api/admin/...` handler instead, which forwards them to the API's
 * `/api/v1/admin/...` with the token attached. While rendering on the server
 * the token is readable, so the API is called directly.
 */
const clientAdminBase = "/api/admin";
const ADMIN_MARKER = "/admin";
const isServer = typeof window === "undefined";

// Add a request interceptor
//
// The token is already valid by the time a request leaves the app: the proxy
// renews an expired access token at the request boundary, where cookies can be
// written. This only reads it.
axiosInstance.interceptors.request.use(
  async function (config) {
    if (!isServer) {
      const path = config.url?.split("?")[0] ?? "";
      if (path === ADMIN_MARKER || path.startsWith(`${ADMIN_MARKER}/`)) {
        config.baseURL = clientAdminBase;
        config.url = config.url!.slice(ADMIN_MARKER.length) || "/";
        return config;
      }
    }

    const accessToken = await getAccessToken();

    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }

    return config;
  },
  function (error) {
    return Promise.reject(error);
  },
);

// Add a response interceptor
axiosInstance.interceptors.response.use(
  function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    return response;
  },
  function (error) {
    // 401s are handled before they are sent (see the request interceptor), so
    // there is nothing to retry here; callers get the API's own answer.
    return Promise.reject(error);
  },
);

export default axiosInstance;
