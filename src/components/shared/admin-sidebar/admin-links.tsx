import { ReactNode } from "react";
import { HiOutlineHome } from "react-icons/hi2";
import { MdOutlineArticle, MdOutlineDashboard } from "react-icons/md";
import { PiUsers } from "react-icons/pi";

interface ILink {
  id: string;
  label: string;
  href: string;
  description: string;
  icon: ReactNode;
}

export const adminLinks: ILink[] = [
  {
    id: "12",
    label: "Dashboard",
    href: "/admin/dashboard",
    description: "Traffic, engagement and growth",
    icon: <MdOutlineDashboard size={18} />,
  },
  {
    id: "13",
    label: "Manage Blogs",
    href: "/admin/manage-blogs",
    description: "Review, edit or remove articles",
    icon: <MdOutlineArticle size={18} />,
  },
  {
    id: "14",
    label: "Manage Users",
    href: "/admin/manage-users",
    description: "Roles, status and moderation",
    icon: <PiUsers size={18} />,
  },
];

export const adminBackLinks: ILink[] = [
  {
    id: "11",
    label: "Back to site",
    href: "/",
    description: "Leave the admin panel",
    icon: <HiOutlineHome size={18} />,
  },
];
