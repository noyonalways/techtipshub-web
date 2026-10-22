import envConfig from "@/config/env.config";
import { getAccessToken } from "@/lib/fetch-with-auth";
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: envConfig.baseApi,
  withCredentials: true,
});

// Add a request interceptor
//
// The token is already valid by the time a request leaves the app: the proxy
// renews an expired access token at the request boundary, where cookies can be
// written. This only reads it.
axiosInstance.interceptors.request.use(
  async function (config) {
    const accessToken = await getAccessToken();

    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }

    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
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
  }
);

export default axiosInstance;
