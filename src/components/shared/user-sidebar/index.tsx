"use client";

import { useUser } from "@/context/user.provider";
import { Avatar } from "@heroui/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { FiMenu, FiX } from "react-icons/fi";
import { HiOutlineArrowLeft, HiOutlineArrowRight } from "react-icons/hi2";
import { userLinks } from "./user-links";

/**
 * Settings navigation. A sticky column on desktop, a disclosure panel on
 * phones — the same links, with the active item marked for both.
 */
const UserSidebar = () => {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useUser();

  // Navigating to another settings page should close the mobile panel.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const current =
    userLinks.find((link) => link.href === pathname) ??
    userLinks.filter((link) => pathname?.startsWith(`${link.href}/`)).at(-1);

  return (
    <>
      {/* Mobile trigger */}
      <div className="border-b border-default/60 lg:hidden">
        <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-4 py-3 sm:px-6">
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="settings-nav"
            className="inline-flex items-center gap-2 rounded-lg border border-default/60 px-2.5 py-1.5 text-sm font-medium transition-colors hover:bg-default-50"
          >
            {open ? (
              <FiX aria-hidden className="size-4" />
            ) : (
              <FiMenu aria-hidden className="size-4" />
            )}
            Settings
          </button>
          <span className="truncate text-sm text-default-500">
            {current?.label ?? "Profile"}
          </span>
        </div>
      </div>

      <aside
        id="settings-nav"
        className={`${
          open ? "block" : "hidden"
        } border-b border-default/60 bg-background lg:sticky lg:top-[var(--header-height)] lg:block lg:h-[calc(100dvh-var(--header-height))] lg:w-64 lg:shrink-0 lg:self-start lg:border-b-0 lg:border-r lg:border-default/60`}
      >
        <nav
          aria-label="Account settings"
          className="flex flex-col gap-6 px-4 py-5 lg:px-4 lg:py-6"
        >
          {/* Identity */}
          <div className="flex items-center gap-3 border-b border-default/60 pb-5">
            <Avatar
              size="sm"
              radius="full"
              src={user?.profilePicture}
              name={(user?.name || user?.username || "?")
                .charAt(0)
                .toUpperCase()}
              className="shrink-0"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">
                {user?.name || user?.username || "Your account"}
              </p>
              <p className="truncate text-xs text-default-500">
                {user?.email}
              </p>
            </div>
          </div>

          <div>
            <p className="px-3 pb-1.5 text-[0.6875rem] font-semibold uppercase tracking-wider text-default-400">
              Account
            </p>
            <ul className="space-y-0.5">
              {userLinks.map((link) => {
                const active = link.href === current?.href;
                return (
                  <li key={link.id}>
                    <Link
                      href={link.href}
                      aria-current={active ? "page" : undefined}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        active
                          ? "bg-primary/10 text-primary"
                          : "text-default-700 hover:bg-default-100 hover:text-foreground"
                      }`}
                    >
                      <span aria-hidden className="shrink-0">
                        {link.icon}
                      </span>
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="mt-2 space-y-0.5 border-t border-default/60 pt-4">
            {user?.username && (
              <Link
                href={`/profile/@${user.username}`}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-default-700 transition-colors hover:bg-default-100 hover:text-foreground"
              >
                <HiOutlineArrowRight aria-hidden className="size-4" />
                View public profile
              </Link>
            )}
            <Link
              href="/"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-default-700 transition-colors hover:bg-default-100 hover:text-foreground"
            >
              <HiOutlineArrowLeft aria-hidden className="size-4" />
              Back to the feed
            </Link>
          </div>

          <p className="hidden text-xs leading-relaxed text-default-400 lg:block">
            Changes are saved to your public profile immediately after you
            submit them.
          </p>
        </nav>
      </aside>
    </>
  );
};

export default UserSidebar;
