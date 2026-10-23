"use server";

import envConfig from "@/config/env.config";
import axiosInstance from "@/lib/AxiosInstance";
import { getAccessToken } from "@/lib/fetch-with-auth";
import { revalidatePath, updateTag } from "next/cache";
import { cookies } from "next/headers";

export const getAllBlogs = async (
  params?: Record<string, string | undefined>,
) => {
  try {
    const url = new URL(`${envConfig.baseApi}/blogs`);

    // Append only defined parameters
    if (params) {
      Object.keys(params).forEach((key) => {
        const value = params[key];
        if (value !== undefined) {
          url.searchParams.append(key, value);
        }
      });
    }

    const res = await fetch(url.toString(), {
      cache: "no-cache",
      next: {
        tags: ["allBlogs"],
      },
    });

    return res?.json();
  } catch (err: any) {
    return err;
  }
};

// get following users blogs
export const getFollowingUsersBlogs = async (
  params?: Record<string, string | undefined>,
) => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("tth_access_token")?.value;

  try {
    // Create a URL with the base endpoint
    const url = new URL(`${envConfig.baseApi}/blogs/following-users`);

    // Append only defined parameters
    if (params) {
      Object.keys(params).forEach((key) => {
        const value = params[key];
        if (value !== undefined) {
          url.searchParams.append(key, value);
        }
      });
    }

    const res = await fetch(url.toString(), {
      cache: "no-cache", // Consistent with getAllBlogs
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      next: {
        tags: ["allBlogs"], // Add this if you want to enable cache invalidation
      },
    });

    return res.json();
  } catch (err: any) {
    return err; // Handle the error as you see fit
  }
};

export const createBlog = async (payload: FormData) => {
  try {
    const res = await axiosInstance.post("/blogs", payload);

    updateTag("allBlogs");
    revalidatePath("/");

    return res?.data;
  } catch (err: any) {
    return err?.response?.data;
  }
};

export const getBlogBySlug = async (slug: string) => {
  try {
    const res = await axiosInstance.get(`/blogs/${slug}`);

    return res?.data;
  } catch (err: any) {
    return err?.response?.data;
  }
};

export const getLoggedInUserBlogs = async (
  params?: Record<string, string | undefined>,
) => {
  try {
    const url = new URL(`${envConfig.baseApi}/blogs/my-blogs`);

    // Append only defined parameters
    if (params) {
      Object.keys(params).forEach((key) => {
        const value = params[key];
        if (value !== undefined) {
          url.searchParams.append(key, value);
        }
      });
    }

    // Renews an expired (or about-to-expire) access token instead of reporting
    // the member as signed out, which would empty the list.
    const accessToken = await getAccessToken();

    const res = await fetch(url.toString(), {
      next: {
        tags: ["myBlogs"],
      },
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    });

    const data = await res.json();

    // A visitor with no usable session still gets `{ success: false }` with no
    // `data`. Callers treat `data` as a list, so normalise it here rather than
    // spreading `undefined` and crashing the page — and keep the reason, so the
    // page can say "sign in again" instead of "you have no articles".
    if (!res.ok || data?.success === false || !Array.isArray(data?.data)) {
      return { ...data, success: false, data: [] as unknown[] };
    }

    return data;
  } catch (err: any) {
    return { success: false, data: [] as unknown[], error: err?.message };
  }
};

export const getBlogsByUserId = async (
  userId: string,
  params?: Record<string, string | undefined>,
) => {
  try {
    const url = new URL(`${envConfig.baseApi}/blogs/users/${userId}`);

    if (params) {
      Object.keys(params).forEach((key) => {
        const value = params[key];
        if (value !== undefined) {
          url.searchParams.append(key, value);
        }
      });
    }

    const res = await fetch(url.toString(), {
      cache: "no-store",
      next: {
        tags: ["allBlogs"],
      },
    });

    return res.json();
  } catch (err: any) {
    throw new Error(err?.message);
  }
};

/**
 * Record a read for a blog and get its fresh view total.
 *
 * Called with the reader's token when they are signed in (so they count once
 * per account) and with a pseudonymous `visitorId` for guests. Never throws, so
 * a failed count can't break the article page.
 */
export const recordBlogView = async (slug: string, visitorId?: string) => {
  try {
    const accessToken = (await cookies()).get("tth_access_token")?.value;

    const res = await fetch(
      `${envConfig.baseApi}/views/${encodeURIComponent(slug)}`,
      {
        method: "POST",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify(visitorId ? { visitorId } : {}),
      },
    );

    return await res.json();
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
};

// upvote/downvote by blog id
export const voteOnBlog = async (
  blogId: string,
  voteType: "upvote" | "downvote",
) => {
  try {
    const res = await axiosInstance.put(
      `/blogs/${blogId}/vote?voteType=${voteType}`,
    );

    updateTag("singleBlog");

    return res.data;
  } catch (err: any) {
    return err?.response?.data;
  }
};

// comment on blog
export const commentOnBlog = async (blogId: string, payload: FormData) => {
  try {
    const res = await axiosInstance.post(`/blogs/${blogId}/comments`, payload);

    updateTag("comments");
    // The article's comment total is shown next to the counter, so refresh it.
    updateTag("singleBlog");

    return await res?.data;
  } catch (err: any) {
    return err?.response?.data;
  }
};

// get all comments by blog id
export const getCommentsByBlogId = async (blogId: string) => {
  try {
    const res = await fetch(
      `${envConfig.baseApi}/blogs/${blogId}/comments?limit=100`,
      {
        cache: "no-store",
        next: {
          tags: ["comments"],
        },
      },
    );

    return res?.json();
  } catch (err: any) {
    return err?.response?.data;
  }
};

// delete a blog by admin using id with reason
export const deleteBlogByAdminUsingId = async (
  blogId: string,
  reason: string,
) => {
  try {
    const res = await axiosInstance.delete(`/admin/blogs/${blogId}`, {
      data: { reason },
    });

    updateTag("allBlogs");

    return res.data;
  } catch (err: any) {
    return err?.response?.data;
  }
};

// delete a blog by user using id
export const deleteBlogByUserUsingId = async (blogId: string) => {
  try {
    const res = await axiosInstance.delete(`/blogs/${blogId}`);

    updateTag("myBlogs");

    return res.data;
  } catch (err: any) {
    return err?.response?.data;
  }
};

// update a blog by user using id
export const updateBlogByUserUsingId = async (
  blogId: string,
  payload: FormData,
) => {
  try {
    const res = await axiosInstance.put(`/blogs/${blogId}`, payload);

    updateTag("myBlogs");

    return res.data;
  } catch (err: any) {
    return err?.response?.data;
  }
};

// update blog by admin
export const updateBlogByAdmin = async (blogId: string, payload: FormData) => {
  try {
    const res = await axiosInstance.put(`/admin/blogs/${blogId}`, payload);

    updateTag("allBlogs");

    return res.data;
  } catch (err: any) {
    return err?.response?.data;
  }
};

// delete comment by logged in user (own comment, shared route)
export const deleteCommentByUser = async (commentId: string) => {
  try {
    const res = await axiosInstance.delete(`/comments/${commentId}`);

    updateTag("comments");

    return res.data;
  } catch (err: any) {
    return err?.response?.data;
  }
};

// delete any comment as admin, from the moderation screens
export const deleteCommentAsAdmin = async (commentId: string) => {
  try {
    const res = await axiosInstance.delete(`/admin/comments/${commentId}`);

    updateTag("comments");

    return res.data;
  } catch (err: any) {
    return err?.response?.data;
  }
};

// update comment by logged in user
export const updateCommentByUser = async (
  commentId: string,
  payload: FormData,
) => {
  try {
    const res = await axiosInstance.put(`/comments/${commentId}`, payload);

    updateTag("comments");

    return res.data;
  } catch (err: any) {
    return err?.response?.data;
  }
};
