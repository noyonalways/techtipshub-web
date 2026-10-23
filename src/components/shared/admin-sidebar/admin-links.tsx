import { cloneElement, isValidElement, ReactNode } from "react";
import { HiOutlineHome } from "react-icons/hi2";
import {
  MdOutlineArticle,
  MdOutlineCategory,
  MdOutlineDashboard,
  MdOutlineDeleteOutline,
  MdOutlineFactCheck,
} from "react-icons/md";
import {
  PiChartLineUp,
  PiChatsCircle,
  PiEnvelopeSimple,
  PiListMagnifyingGlass,
  PiUsers,
} from "react-icons/pi";

export interface ILink {
  id: string;
  label: string;
  href: string;
  description: string;
  icon: ReactNode;
  /** Sidebar heading this link sits under. Order of the groups follows first appearance. */
  group?: string;
  /** One word for the collapsed rail and tight spaces. Falls back to `label`. */
  shortLabel?: string;
}

/**
 * Section labels are kept explicit so the sidebar, the breadcrumb and the page
 * title all read the same word for the same screen. Groups are ordered by
 * how often an editor touches them: what the site shows, who is on it, then
 * the record of what changed.
 */
export const ADMIN_GROUPS = [
  "Overview",
  "Content",
  "People",
  "Inbox",
  "Configuration",
] as const;

export const adminLinks: ILink[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    href: "/admin/dashboard",
    description: "Traffic, engagement and growth",
    icon: <MdOutlineDashboard />,
    group: "Overview",
  },
  {
    id: "analytics",
    label: "Analytics",
    href: "/admin/analytics",
    description: "Day-by-day traffic and growth",
    icon: <PiChartLineUp />,
    group: "Overview",
  },
  {
    id: "manage-blogs",
    label: "Articles",
    href: "/admin/manage-blogs",
    description: "Review, edit or remove articles",
    icon: <MdOutlineArticle />,
    group: "Content",
  },
  {
    id: "manage-comments",
    label: "Comments",
    href: "/admin/manage-comments",
    description: "Read and moderate discussions",
    icon: <PiChatsCircle />,
    group: "Content",
  },
  {
    id: "categories",
    label: "Categories",
    href: "/admin/categories",
    description: "Group articles by topic",
    icon: <MdOutlineCategory />,
    group: "Content",
  },
  {
    id: "trash",
    label: "Trash",
    href: "/admin/trash",
    description: "Removed articles and members",
    icon: <MdOutlineDeleteOutline />,
    group: "Content",
  },
  {
    id: "manage-users",
    label: "Members",
    href: "/admin/manage-users",
    description: "Roles, status and moderation",
    icon: <PiUsers />,
    group: "People",
  },
  {
    id: "messages",
    label: "Messages",
    href: "/admin/messages",
    description: "Contact form submissions",
    icon: <PiEnvelopeSimple />,
    group: "Inbox",
  },
  {
    id: "moderation",
    label: "Moderation queue",
    shortLabel: "Queue",
    href: "/admin/moderation",
    description: "Work through everything waiting on you",
    icon: <MdOutlineFactCheck />,
    group: "Inbox",
  },
  {
    id: "activity-log",
    label: "Activity log",
    shortLabel: "Activity",
    href: "/admin/activity-log",
    description: "Who changed what, and when",
    icon: <PiListMagnifyingGlass />,
    group: "Configuration",
  },
];

/**
 * Nav icons are authored without a size so one place can scale them: the
 * expanded rail draws them at 18, the collapsed rail and the drawer's header
 * can ask for another size without touching the data.
 */
export const navIcon = (icon: ReactNode, size = 18): ReactNode =>
  isValidElement<{ size?: number }>(icon) ? cloneElement(icon, { size }) : icon;

/**
 * Resolves the sidebar entry for a path. The longest matching href wins, so
 * `/admin/manage-users/<id>` stays under Members and a future nested route
 * cannot fall through to Dashboard.
 */
export const findAdminLink = (pathname?: string | null): ILink | undefined =>
  adminLinks
    .filter(
      (link) => pathname === link.href || pathname?.startsWith(`${link.href}/`),
    )
    .sort((a, b) => b.href.length - a.href.length)[0];

export const adminBackLinks: ILink[] = [
  {
    id: "back",
    label: "Back to site",
    href: "/",
    description: "Leave the admin panel",
    icon: <HiOutlineHome />,
  },
];
