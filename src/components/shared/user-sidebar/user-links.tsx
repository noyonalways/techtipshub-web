import { ReactNode } from "react";
import { HiOutlineUserCircle } from "react-icons/hi2";
import { MdOutlineArticle } from "react-icons/md";

interface ILink {
  id: string;
  label: string;
  href: string;
  description: string;
  icon: ReactNode;
}

export const userLinks: ILink[] = [
  {
    id: "01",
    label: "Profile",
    href: "/settings",
    description: "Name, photo, bio and social links",
    icon: <HiOutlineUserCircle size={18} />,
  },
  {
    id: "02",
    label: "Manage Blogs",
    href: "/settings/manage-blogs",
    description: "Edit or delete your published posts",
    icon: <MdOutlineArticle size={18} />,
  },
];
