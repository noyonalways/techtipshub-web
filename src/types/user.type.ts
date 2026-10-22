export type TLoggedInUser = {
  _id: string;
  email: string;
  name: string;
  username: string;
  profilePicture: string;
  role: TUserRole;
  iat: number;
  exp: number;
};

export type TUserRole = "User" | "Admin";
export type TUserStatus = "Active" | "Blocked";
export type TUserGender = "Male" | "Female" | "Other";
export type TSocialPlatform =
  | "Facebook"
  | "Instagram"
  | "Linkedin"
  | "Twitter"
  | "Github"
  | "Youtube";

export type TSocialLink = {
  platform: TSocialPlatform;
  url: string;
};

export interface IUser {
  _id: string;
  fullName: string;
  username: string;
  bio: string;
  designation: string;
  email: string;
  phone: string;
  location: string;
  profilePicture: string;
  gender: TUserGender;
  role: TUserRole;
  status: TUserStatus;
  totalFollowers: number;
  totalFollowing: number;
  dateOfBirth: string;
  isVerified: boolean;
  isDeleted: boolean;
  socialLinks: TSocialLink[];
  createdAt: string;
  updatedAt: string;
  totalPosts: number;
  __v: number;
}
