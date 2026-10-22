import { ICategory } from "./category.type";
import { IUser } from "./user.type";

export interface IPost {
  _id: string;
  author: IUser;
  title: string;
  slug: string;
  contentType: string;
  /** Absent for guests — the API returns a preview without the body. */
  content: string;
  /** True when the API withheld the body because the visitor is a guest. */
  isLocked?: boolean;
  coverImage: string;
  category: ICategory;
  images: any[];
  tags: string[];
  upVotes: number;
  downVotes: number;
  totalComments: number;
  totalViews: number;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}
