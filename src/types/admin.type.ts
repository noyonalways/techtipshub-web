import type { IBlog } from "./blog.type";
import type { IUser } from "./user.type";

export interface IPaginationMeta {
  page: number;
  limit: number;
  total: number;
  /** The API names it `totalPages` (see `QueryBuilder.countTotal`); there is no `totalPage`. */
  totalPages: number;
}

/** Week-over-week comparison as the overview computes it. Every field is optional in practice. */
export interface IAdminChange {
  value: number;
  previous: number;
  /** Pre-formatted, e.g. "+12.5%". */
  change: string;
  type: "increase" | "decrease" | "no change";
}

export interface IAdminOverviewAuthor {
  fullName?: string;
  username?: string;
  profilePicture?: string;
}

export interface IAdminTopArticle {
  _id: string;
  title: string;
  slug: string;
  totalViews?: number;
  totalComments?: number;
  upVotes?: number;
  downVotes?: number;
  createdAt?: string;
  author?: IAdminOverviewAuthor;
}

export interface IAdminTopContributor {
  _id: string;
  fullName?: string;
  username?: string;
  profilePicture?: string;
  /** Articles published in the measured window. */
  published?: number;
  totalViews?: number;
}

export type TAdminRecentType = "blog" | "member" | "comment";

export interface IAdminRecentItem {
  type: TAdminRecentType;
  id: string;
  title?: string;
  href?: string;
  excerpt?: string;
  actor?: IAdminOverviewAuthor;
  createdAt?: string;
}

/**
 * The API owns these keys; the screen renders whatever it receives and labels
 * only the keys it recognises, so this stays an open bag on purpose.
 */
export interface IAdminHealth {
  [key: string]: unknown;
}

export interface IAdminOverview {
  today?: {
    views?: number;
    comments?: number;
    upvotes?: number;
    newMembers?: number;
  };
  week?: {
    views?: IAdminChange;
    comments?: IAdminChange;
    newMembers?: IAdminChange;
    upvotes?: IAdminChange;
  };
  pending?: Record<string, unknown>;
  topArticles?: IAdminTopArticle[];
  topContributors?: IAdminTopContributor[];
  recent?: IAdminRecentItem[];
  health?: IAdminHealth;
}

export interface IAdminActivityPoint {
  date: string;
  views: number;
  comments: number;
  blogs: number;
  members: number;
  upvotes: number;
  downvotes: number;
}

export interface IAdminCategory {
  _id: string;
  name: string;
  description?: string;
  blogCount?: number;
  createdAt?: string;
}

export type ITrashedBlog = IBlog;

/**
 * A deleted member as the trash endpoint returns it. `role` and `status` hold
 * the values the account had at deletion; the date is `updatedAt` because the
 * collection has no `deletedAt` field.
 */
export type ITrashedUser = IUser;

/**
 * Moderation screens: comments, contact messages and the admin log. The list
 * endpoints answer `{ success, data: { result, meta } }`, so the shapes here
 * describe `data`, not the envelope.
 */
export interface TAdminMeta {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
}

export type TContactStatus = "new" | "read" | "archived";

export interface TContact {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
  status: TContactStatus;
  handledBy?: { _id: string; fullName: string; username: string };
  handledAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TContactCounts {
  new: number;
  read: number;
  archived: number;
}

export interface TContactListData {
  result: TContact[];
  meta?: TAdminMeta;
  counts?: TContactCounts;
}

export interface TAdminCommentUser {
  _id: string;
  fullName: string;
  username: string;
  email: string;
  profilePicture: string;
}

export interface TAdminCommentPost {
  _id: string;
  title: string;
  slug: string;
}

/**
 * A comment as `/comments` serialises it for admins. Written out rather than
 * reusing IComment so a change on the API side shows up in this file first.
 */
export interface TAdminComment {
  _id: string;
  content: string;
  images: string[];
  upVotes: number;
  downVotes: number;
  createdAt: string;
  updatedAt?: string;
  isDeleted: boolean;
  user: TAdminCommentUser;
  post: TAdminCommentPost;
}

export interface TAdminCommentListData {
  result: TAdminComment[];
  meta?: TAdminMeta;
}

export interface TAdminCommentCounts {
  total: number;
  last24h: number;
  last7d: number;
}

export interface TAdminLogActor {
  _id: string;
  fullName: string;
  username: string;
  profilePicture?: string;
}

export interface TAdminLog {
  _id: string;
  action: string;
  targetType: string;
  targetId?: string;
  summary: string;
  createdAt: string;
  admin?: TAdminLogActor;
}

/**
 * Paged admin lists.
 *
 * Every admin list request takes the same optional page, size, search and sort,
 * and every one answers with rows plus a `meta` block. A `page` of 0 is the
 * caller saying "all of it in one request", which the API reads as "no limit".
 */
export interface IAdminListParams {
  page?: number;
  limit?: number;
  searchTerm?: string;
  /** Field name, `-` for newest first. The API accepts the ones it documents. */
  sort?: string;
}

export interface IAdminMembersParams extends IAdminListParams {
  role?: IUser["role"];
  status?: IUser["status"];
}

export interface IAdminTrashParams extends IAdminListParams {
  /** Blog ids stay in the URL under `category`; this one is the Mongo id. */
  category?: string;
}

export interface IAdminBlogsParams extends IAdminListParams {
  category?: string;
  author?: string;
  /** Article publishing status; `all` and `""` send nothing. */
  status?: string;
}

/** The comment window the API filters on, measured from now. */
export type TAdminCommentWindow = "24h" | "7d" | "all";

export interface IAdminCommentsParams extends IAdminListParams {
  within?: TAdminCommentWindow;
}

export type TAdminMessageFilter = TContactStatus | "all";

export interface IAdminMessagesParams extends IAdminListParams {
  status?: TAdminMessageFilter;
}

export interface IAdminCategoriesParams {
  searchTerm?: string;
  page?: number;
  limit?: number;
}

export type TAdminLogsWindow = "24h" | "7d" | "30d" | "90d" | "all";
