export interface IComment {
  _id: string;
  /** Stored API field name for the commented blog. */
  post: ICommentBlog;
  user: ICommentUser;
  content: string;
  isDeleted: boolean;
  images: any[];
  upVotes: number;
  downVotes: number;
  createdAt: string;
  updatedAt: string;
}

export interface ICommentBlog {
  _id: string;
  title: string;
  slug: string;
}

export interface ICommentUser {
  _id: string;
  fullName: string;
  username: string;
  email: string;
  profilePicture: string;
}
