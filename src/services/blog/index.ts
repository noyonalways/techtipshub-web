"use server";

import envConfig from "@/config/env.config";
import axiosInstance from "@/lib/AxiosInstance";
import { getAccessToken } from "@/lib/fetch-with-auth";
import { forgetRenderedArticles } from "@/lib/article-renders";
import { revalidatePath, updateTag } from "next/cache";

/**
 * An article was created, edited or removed, so `/sitemap.xml` no longer
 * describes the site. Revalidating it here keeps the published list current
 * without waiting for the hourly rebuild.
 */
const refreshSitemap = () => {
  try {
    revalidatePath("/sitemap.xml");
  } catch {
    // Called outside a request scope (a script, a build): the sitemap route
    // rebuilds on its own timer there.
  }
};

/**
 * Everything an article change makes stale, in one place.
 *
 * `updateTag` expires the tag outright, so a publish or edit is reflected on
 * the next visit rather than after the cached copy's timer. `tags` lists every
 * reader of the blog data: the feed, the sitemap, the per-version article data,
 * and the author index the build uses.
 *
 * `forgetRenderedArticles` is the other half: an article page is prerendered
 * with the article's `updatedAt` baked into its `params`, and holds on to it
 * within the render cache. Forgetting it is what tells each page its body is
 * out of date, so the next visit reads the article again instead of serving
 * the old body until the revalidation timer runs out.
 */
const refreshArticles = () => {
  updateTag("allBlogs");
  updateTag("sitemap");
  updateTag("articleData");
  forgetRenderedArticles();
  refreshSitemap();
};

const blogListUrl = (params?: Record<string, string | undefined>) => {
  const url = new URL(`${envConfig.baseApi}/blogs`);

  if (params) {
    Object.keys(params).forEach((key) => {
      const value = params[key];
      if (value !== undefined) {
        url.searchParams.append(key, value);
      }
    });
  }

  return url;
};

/**
 * The blog list as page data: fetched on the server, cached, and tagged
 * `allBlogs` so a publish, edit or delete refreshes it.
 *
 * This is what a page that should be prerendered reads. `getAllBlogs` below is
 * the live version for the browser's infinite scroll, where a stale page would
 * be a bug.
 */
export const getBlogs = async (
  params?: Record<string, string | undefined>,
) => {
  try {
    const res = await fetch(blogListUrl(params).toString(), {
      next: { tags: ["allBlogs"], revalidate: 1800 },
    });

    if (!res.ok) return undefined;
    return res.json();
  } catch (err: any) {
    return err?.response?.data;
  }
};

export const getAllBlogs = async (
  params?: Record<string, string | undefined>,
) => {
  try {
    const res = await fetch(blogListUrl(params).toString(), {
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
  // Read here rather than at module scope: a top-level `next/headers` import
  // in a service the prerendered article page also uses makes that page look
  // request-bound. Only this function needs the session.
  const { cookies } = await import("next/headers");
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
    refreshArticles();

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
      next: {
        tags: ["allBlogs"],
        revalidate: 1800,
      },
    });

    return res.json();
  } catch (err: any) {
    throw new Error(err?.message);
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
    // The page shows the vote totals.
    updateTag("articleData");

    return res.data;
  } catch (err: any) {
    return err?.response?.data;
  }
};

/**
 * Comments and votes are part of the article page, but they do not change the
 * article's `updatedAt`, so the page cache has to be told about them by hand.
 * Comments have an entry of their own (`comments`); the page also counts them
 * and shows the vote totals, so the article data goes with it.
 */
const refreshArticleComments = () => {
  updateTag("comments");
  updateTag("articleData");
};

// add a comment to a blog
export const commentOnBlog = async (blogId: string, payload: FormData) => {
  try {
    const res = await axiosInstance.post(`/blogs/${blogId}/comments`, payload);

    refreshArticleComments();
    // The article's comment total is shown next to the counter, so refresh it.
    updateTag("singleBlog");

    return await res?.data;
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
    refreshArticles();

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
    // The article was on the feed, the profile and the sitemap too, so this
    // expires every list that can still point at it.
    refreshArticles();

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
    refreshArticles();

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
    refreshArticles();

    return res.data;
  } catch (err: any) {
    return err?.response?.data;
  }
};

// delete comment by logged in user (own comment, shared route)
export const deleteCommentByUser = async (commentId: string) => {
  try {
    const res = await axiosInstance.delete(`/comments/${commentId}`);

    refreshArticleComments();

    return res.data;
  } catch (err: any) {
    return err?.response?.data;
  }
};

// delete any comment as admin, from the moderation screens
export const deleteCommentAsAdmin = async (commentId: string) => {
  try {
    const res = await axiosInstance.delete(`/admin/comments/${commentId}`);

    refreshArticleComments();

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

    refreshArticleComments();

    return res.data;
  } catch (err: any) {
    return err?.response?.data;
  }
};
