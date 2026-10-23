import axiosInstance from "@/lib/AxiosInstance";
import { toServiceError } from "./shared";

/**
 * `GET /admin/search?q=` (Admin). List services live in their own files
 * (`./blogs`, `./comments`, ...).
 *
 * These modules are deliberately NOT `"use server"`: the admin pages render in
 * the browser, so the calls have to run there and go through the app's
 * `/api/admin` handler. A server-action module would forbid the synchronous
 * payload readers some of them export.
 */
export const searchAdmin = async (query: string) => {
  try {
    const res = await axiosInstance.get("/admin/search", {
      params: { q: query },
    });

    return res.data;
  } catch (error) {
    throw toServiceError(error, "Search is not available right now.");
  }
};
