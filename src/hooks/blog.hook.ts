import {
  commentOnBlog,
  createBlog,
  updateBlogByUserUsingId,
  getAllBlogs,
  voteOnBlog,
  deleteBlogByAdminUsingId,
  deleteBlogByUserUsingId,
  updateBlogByAdmin,
  deleteCommentByUser,
  updateCommentByUser,
} from "@/services/blog";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

export const useCreateBlog = () => {
  return useMutation<any, Error, FormData>({
    mutationKey: ["CREATE_BLOG"],
    mutationFn: async (payload) => await createBlog(payload),
    onSuccess: (data) => {
      if (!data?.success) {
        toast.error(data?.errorSources?.[0]?.message || data?.message, {
          id: "create-blog",
        });
      }
      if (data.success) {
        toast.success(data?.message, {
          id: "create-blog",
        });
      }
    },
  });
};

// vote on blog
export const useVoteOnBlog = () => {
  return useMutation<
    any,
    Error,
    { blogId: string; voteType: "upvote" | "downvote" }
  >({
    mutationKey: ["VOTE_ON_BLOG"],
    mutationFn: async ({ blogId, voteType }) =>
      await voteOnBlog(blogId, voteType),
    onSuccess: (data) => {
      if (!data?.success) {
        toast.error(data?.message, {
          id: "vote-on-blog",
        });
      }
      if (data.success) {
        toast.success(data?.message, {
          id: "vote-on-blog",
        });
      }
    },
  });
};

// comment on blog
export const useCommentOnBlog = () => {
  return useMutation<any, Error, { blogId: string; payload: FormData }>({
    mutationKey: ["COMMENT_ON_BLOG"],
    mutationFn: async ({ blogId, payload }) =>
      await commentOnBlog(blogId, payload),
    onSuccess: (data) => {
      if (!data?.success) {
        toast.error(data?.message, {
          id: "comment-on-blog",
        });
      }
      if (data.success) {
        toast.success(data?.message, {
          id: "comment-on-blog",
        });
      }
    },
  });
};

// get all blogs (for admin only)
// Params are part of the key, so each page and filter keeps its own entry.
export const useGetAllBlogs = (params?: Record<string, string>) => {
  return useQuery({
    queryKey: params ? ["GET_ALL_BLOGS", params] : ["GET_ALL_BLOGS"],
    queryFn: async () => await getAllBlogs(params),
    placeholderData: (previous: unknown) => previous,
  });
};

// delete a blog by admin using id with reason
export const useDeleteBlogByAdminUsingId = () => {
  return useMutation<any, Error, { blogId: string; reason: string }>({
    mutationKey: ["DELETE_BLOG_BY_ADMIN"],
    mutationFn: async ({ blogId, reason }) =>
      await deleteBlogByAdminUsingId(blogId, reason),
    onSuccess: (data) => {
      if (!data?.success) {
        toast.error(data?.message, {
          id: "delete-blog-by-admin",
        });
      }
      if (data.success) {
        toast.success(data?.message, {
          id: "delete-blog-by-admin",
        });
      }
    },
  });
};

export const useDeleteBlogByUserUsingId = () => {
  return useMutation<any, Error, string>({
    mutationKey: ["DELETE_BLOG_BY_USER"],
    mutationFn: async (blogId) => await deleteBlogByUserUsingId(blogId),
    onSuccess: (data) => {
      if (!data?.success) {
        toast.error(data?.message, {
          id: "delete-blog-by-user",
        });
      }
      if (data.success) {
        toast.success(data?.message, {
          id: "delete-blog-by-user",
        });
      }
    },
  });
};

export const useUpdateBlogByUserUsingId = () => {
  return useMutation<any, Error, { blogId: string; payload: FormData }>({
    mutationKey: ["UPDATE_BLOG_BY_USER"],
    mutationFn: async ({ blogId, payload }) =>
      await updateBlogByUserUsingId(blogId, payload),
    onSuccess: (data) => {
      if (!data?.success) {
        toast.error(data?.message, {
          id: "update-blog-by-user",
        });
      }
      if (data.success) {
        toast.success(data?.message, {
          id: "update-blog-by-user",
        });
      }
    },
  });
};

// update blog by admin
export const useUpdateBlogByAdmin = () => {
  return useMutation<any, Error, { blogId: string; payload: FormData }>({
    mutationKey: ["UPDATE_BLOG_BY_ADMIN"],
    mutationFn: async ({ blogId, payload }) =>
      await updateBlogByAdmin(blogId, payload),
    onSuccess: (data) => {
      if (!data?.success) {
        toast.error(data?.message, {
          id: "update-blog-by-admin",
        });
      }
      if (data.success) {
        toast.success(data?.message, {
          id: "update-blog-by-admin",
        });
      }
    },
  });
};

// delete comment by user
export const useDeleteCommentByUser = () => {
  return useMutation<any, Error, string>({
    mutationKey: ["DELETE_COMMENT_BY_USER"],
    mutationFn: async (commentId) => await deleteCommentByUser(commentId),
    onSuccess: (data) => {
      if (!data?.success) {
        toast.error(data?.message, {
          id: "delete-comment-by-user",
        });
      }
      if (data.success) {
        toast.success(data?.message, {
          id: "delete-comment-by-user",
        });
      }
    },
  });
};

// update comment by user
export const useUpdateCommentByUser = () => {
  return useMutation<any, Error, { commentId: string; payload: FormData }>({
    mutationKey: ["UPDATE_COMMENT_BY_USER"],
    mutationFn: async ({ commentId, payload }) =>
      await updateCommentByUser(commentId, payload),
    onSuccess: (data) => {
      if (!data?.success) {
        toast.error(data?.message, {
          id: "update-comment-by-user",
        });
      }
      if (data.success) {
        toast.success(data?.message, {
          id: "update-comment-by-user",
        });
      }
    },
  });
};
