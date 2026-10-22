"use server";

import envConfig from "@/config/env.config";
import axiosInstance from "@/lib/AxiosInstance";
import { revalidatePath, updateTag } from "next/cache";
import { cookies } from "next/headers";

export const getAllPosts = async (
  params?: Record<string, string | undefined>
) => {
  try {
    const url = new URL(`${envConfig.baseApi}/posts`);

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
        tags: ["allPosts"],
      },
    });

    return res?.json();
  } catch (err: any) {
    return err;
  }
};

// get following users posts
export const getFollowingUsersPosts = async (
  params?: Record<string, string | undefined>
) => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("tth_access_token")?.value;

  try {
    // Create a URL with the base endpoint
    const url = new URL(`${envConfig.baseApi}/posts/following-users`);

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
      cache: "no-cache", // Consistent with getAllPosts
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      next: {
        tags: ["allPosts"], // Add this if you want to enable cache invalidation
      },
    });

    return res.json();
  } catch (err: any) {
    return err; // Handle the error as you see fit
  }
};

export const createPost = async (payload: FormData) => {
  try {
    const res = await axiosInstance.post("/posts", payload);

    updateTag("allPosts");
    revalidatePath("/")

    return res?.data;
  } catch (err: any) {
    return err?.response?.data;
  }
};

export const getPostBySlug = async (slug: string) => {
  try {
    const res = await axiosInstance.get(`/posts/${slug}`);

    return res?.data;
  } catch (err: any) {
    return err?.response?.data;
  }
};

export const getLoggedInUserPosts = async (
  params?: Record<string, string | undefined>
) => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("tth_access_token")?.value;
  try {
    const url = new URL(`${envConfig.baseApi}/posts/my-posts`);

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
      next: {
        tags: ["myPosts"],
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await res.json();

    // A signed-out visitor (or an expired token) gets `{ success: false }` with
    // no `data`. Callers treat `data` as a list, so normalise it here rather
    // than spreading `undefined` and crashing the page.
    if (!res.ok || data?.success === false || !Array.isArray(data?.data)) {
      return { ...data, success: false, data: [] as unknown[] };
    }

    return data;
  } catch (err: any) {
    return { success: false, data: [] as unknown[], error: err?.message };
  }
};

export const getPostsByUserId = async (
  userId: string,
  params?: Record<string, string | undefined>
) => {
  try {
    const url = new URL(`${envConfig.baseApi}/posts/users/${userId}`);

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
        tags: ["allPosts"],
      },
    });

    return res.json();
  } catch (err: any) {
    throw new Error(err?.message);
  }
};

/**
 * Record a read for a post and get its fresh view total.
 *
 * Called with the reader's token when they are signed in (so they count once
 * per account) and with a pseudonymous `visitorId` for guests. Never throws, so
 * a failed count can't break the article page.
 */
export const recordPostView = async (
  slug: string,
  visitorId?: string
) => {
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
      }
    );

    return await res.json();
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
};

// upvote/downvote by post id
export const voteOnPost = async (
  postId: string,
  voteType: "upvote" | "downvote"
) => {
  try {
    const res = await axiosInstance.put(
      `/posts/${postId}/vote?voteType=${voteType}`
    );

    updateTag("singlePost");

    return res.data;
  } catch (err: any) {
    return err?.response?.data;
  }
};


// comment on post
export const commentOnPost = async (postId: string, payload: FormData) => {
  try {
    const res = await axiosInstance.post(`/posts/${postId}/comments`, payload);

    updateTag("comments");
    // The article's comment total is shown next to the counter, so refresh it.
    updateTag("singlePost");

    return await res?.data;
  } catch (err: any) {
    return err?.response?.data;
  }
};

// get all comments by post id
export const getCommentsByPostId = async (postId: string) => {
  try {
    const res = await fetch(
      `${envConfig.baseApi}/posts/${postId}/comments?limit=100`,
      {
        cache: "no-store",
        next: {
          tags: ["comments"],
        },
      }
    );

    return res?.json();
  } catch (err: any) {
    return err?.response?.data;
  }
};

// delete a blog by admin using id with reason
export const deleteBlogByAdminUsingId = async (
  blogId: string,
  reason: string
) => {
  try {
    const res = await axiosInstance.delete(`/posts/${blogId}/by-admin`, {
      data: { reason },
    });

    updateTag("allPosts");

    return res.data;
  } catch (err: any) {
    return err?.response?.data;
  }
};

// delete a blog by user using id
export const deleteBlogByUserUsingId = async (blogId: string) => {
  try {
    const res = await axiosInstance.delete(`/posts/${blogId}`);

    updateTag("myPosts");

    return res.data;
  } catch (err: any) {
    return err?.response?.data;
  }
};


// update a blog by user using id
export const updateBlogByUserUsingId = async (blogId: string, payload: FormData) => {
  try {
    const res = await axiosInstance.put(`/posts/${blogId}`, payload);

    updateTag("myPosts");

    return res.data;
  } catch (err: any) {
    return err?.response?.data;
  }
};

// update blog by admin
export const updateBlogByAdmin = async (blogId: string, payload: FormData) => {
  try {
    const res = await axiosInstance.put(`/posts/${blogId}/by-admin`, payload);

    updateTag("allPosts");

    return res.data;
  } catch (err: any) {
    return err?.response?.data;
  }
};

// delete comment by logged in user
export const deleteCommentByUser = async (commentId: string) => {
  try {
    const res = await axiosInstance.delete(`/comments/${commentId}`);

    updateTag("comments");

    return res.data;
  } catch (err: any) {
    return err?.response?.data;
  }
}

// update comment by logged in user
export const updateCommentByUser = async (commentId: string, payload: FormData) => {
  try {
    const res = await axiosInstance.put(`/comments/${commentId}`, payload);

    updateTag("comments");

    return res.data;
  } catch (err: any) {
    return err?.response?.data;
  }
}