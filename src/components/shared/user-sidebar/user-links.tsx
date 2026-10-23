import { ReactNode } from "react";
import { HiOutlineUserCircle } from "react-icons/hi2";
import { MdOutlineArticle } from "react-icons/md";
import { manageBlogsPath } from "@/lib/blog-routes";

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
    label: "My articles",
    href: manageBlogsPath,
    description: "Edit or delete your published blogs",
    icon: <MdOutlineArticle size={18} />,
  },
];

/**
 * Pages that sit under a nav section without being in it.
 *
 * The article editor used to live under this rail; it now opens from
 * `/me/blogs/<slug>/edit` and describes itself on its own screen.
 */
export const sectionPages: Record<string, never> = {};
