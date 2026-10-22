"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useUser } from "@/context/user.provider";
import { PiMagicWandLight, PiUsers } from "react-icons/pi";
import { HiOutlinePencilSquare } from "react-icons/hi2";
import { FiBookOpen, FiInfo, FiMail } from "react-icons/fi";
import AdBanner from "@/components/adsense/ad-banner";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  requiresAuth?: boolean;
}

const browseItems: NavItem[] = [
  {
    href: "/",
    label: "Personalized",
    icon: <PiMagicWandLight className="text-lg" />,
  },
  {
    href: "/following",
    label: "Following",
    icon: <PiUsers className="text-lg" />,
    requiresAuth: true,
  },
];

const exploreItems: NavItem[] = [
  {
    href: "/features",
    label: "Community",
    icon: <FiBookOpen className="text-lg" />,
  },
  { href: "/about-us", label: "About", icon: <FiInfo className="text-lg" /> },
  {
    href: "/contact-us",
    label: "Contact",
    icon: <FiMail className="text-lg" />,
  },
];

const NavLink = ({ item, active }: { item: NavItem; active: boolean }) => (
  <Link
    href={item.href}
    aria-current={active ? "page" : undefined}
    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
      active
        ? "bg-primary/10 text-primary"
        : "text-default-700 hover:bg-default-100 hover:text-foreground"
    }`}
  >
    <span aria-hidden className="shrink-0">
      {item.icon}
    </span>
    {item.label}
  </Link>
);

const NavSection = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="space-y-1">
    <p className="px-3 pb-1 text-[0.6875rem] font-semibold uppercase tracking-wider text-default-400">
      {title}
    </p>
    {children}
  </div>
);

const LeftSideBar = () => {
  const { user } = useUser();
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname?.startsWith(href);

  return (
    <aside className="tth-rail hidden w-56 shrink-0 border-r border-default/60 lg:block">
      <div className="tth-rail-inner flex flex-col px-3 py-5">
        <nav aria-label="Feed navigation" className="space-y-6">
          {user && (
            <Link
              href="/write-blog"
              className="flex items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
            >
              <HiOutlinePencilSquare className="text-lg" aria-hidden />
              Write a post
            </Link>
          )}

          <NavSection title="Browse">
            {browseItems.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                active={!!isActive(item.href)}
              />
            ))}
          </NavSection>

          <NavSection title="Explore">
            {exploreItems.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                active={!!isActive(item.href)}
              />
            ))}
          </NavSection>
        </nav>

        {/* Keeps the sidebar ad inside the sticky column, where it has always
            lived. The block claims the space under the navigation and caps
            itself so the rail never needs an internal scrollbar. */}
        <div className="flex min-h-0 flex-1 flex-col justify-end gap-4 pt-6">
          <div className="tth-rail-ad">
            <AdBanner />
          </div>
        </div>
      </div>
    </aside>
  );
};

export default LeftSideBar;
