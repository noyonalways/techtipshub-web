"use client";

import { useUser } from "@/context/user.provider";
import { Avatar } from "@heroui/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { FiEdit3, FiMenu, FiX } from "react-icons/fi";
import { HiOutlineArrowLeft, HiOutlineArrowRight } from "react-icons/hi2";
import { sectionPages, userLinks } from "./user-links";

/**
 * Which settings page the path belongs to.
 *
 * The article editor lives under `manage-blogs` (`/settings/edit/<slug>`), so
 * it keeps that section's nav entry highlighted, but it names itself in the
 * header and the "On this page" note rather than the parent's copy.
 */
const resolvePage = (pathname: string | null) => {
  const section =
    userLinks
      .filter(
        (link) =>
          pathname === link.href || pathname?.startsWith(`${link.href}/`),
      )
      .at(-1) ?? null;

  const isArticleEditor = Boolean(pathname?.startsWith("/settings/edit/"));

  return {
    section,
    page: (isArticleEditor && sectionPages.editor) || section,
  };
};

/**
 * Settings navigation. A sticky column on desktop, a disclosure panel on
 * phones — the same links, with the active item marked for both.
 */
const UserSidebar = () => {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useUser();

  // Navigating to another settings page should close the mobile panel. Tracking
  // the path we opened on means this holds even for a link back to this exact
  // page, while still needing no effect.
  const [openForPath, setOpenForPath] = useState<string | null>(null);
  if (openForPath !== null && openForPath !== pathname) {
    setOpenForPath(null);
    if (open) setOpen(false);
  }

  const toggle = () => {
    const next = !open;
    setOpen(next);
    setOpenForPath(next ? pathname : null);
  };

  const { section: current, page } = resolvePage(pathname);

  return (
    <>
      {/* Mobile trigger */}
      <div className="border-b border-default/60 lg:hidden">
        <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-4 py-3 sm:px-6">
          <button
            type="button"
            onClick={toggle}
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
            {page?.label ?? "Profile"}
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
                {user?.username ? `@${user.username}` : user?.email}
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

          {page?.description && (
            <div className="rounded-lg bg-default-50 px-3 py-2.5 dark:bg-default-100/10">
              <p className="text-[0.6875rem] font-semibold uppercase tracking-wider text-default-400">
                On this page
              </p>
              <p className="mt-1 text-xs leading-relaxed text-default-600">
                {page.description}
              </p>
            </div>
          )}

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
              href="/write-blog"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-default-700 transition-colors hover:bg-default-100 hover:text-foreground"
            >
              <FiEdit3 aria-hidden className="size-4" />
              Write a new post
            </Link>
            <Link
              href="/"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-default-700 transition-colors hover:bg-default-100 hover:text-foreground"
            >
              <HiOutlineArrowLeft aria-hidden className="size-4" />
              Back to the feed
            </Link>
          </div>
        </nav>
      </aside>
    </>
  );
};

export default UserSidebar;
