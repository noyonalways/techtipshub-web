"use client";

import { ThemeSwitch } from "@/components/ui/theme-switch";
import { useUser } from "@/context/user.provider";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { FiMenu, FiX } from "react-icons/fi";
import { HiOutlineArrowLeft } from "react-icons/hi2";
import { adminBackLinks, adminLinks } from "./admin-links";

/**
 * Admin navigation: a fixed rail on desktop, a slide-over panel on phones.
 * Distinct from the public site header — no adverts, no search, no writing
 * shortcuts.
 */
const AdminSidebar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useUser();

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  const current =
    adminLinks.find((link) => pathname?.startsWith(link.href)) ?? adminLinks[0];

  return (
    <aside className="border-b border-default/60 bg-background lg:sticky lg:top-0 lg:h-[100dvh] lg:w-64 lg:shrink-0 lg:self-start lg:border-b-0 lg:border-r">
      {/* Brand row */}
      <div className="flex h-14 items-center justify-between gap-3 border-b border-default/60 px-4 lg:h-16">
        <Link href="/" className="flex min-w-0 items-center gap-2.5">
          <Image
            src="/tech-tips-hub-logo.png"
            alt=""
            width={28}
            height={28}
            className="size-7 rounded-md"
          />
          <span className="truncate text-sm font-semibold tracking-tight">
            TechTips Hub
            <span className="ml-2 rounded border border-default/60 px-1.5 py-0.5 align-middle text-[0.625rem] font-semibold uppercase tracking-wider text-default-500">
              Admin
            </span>
          </span>
        </Link>

        <div className="flex items-center gap-1">
          <ThemeSwitch />
          <button
            type="button"
            onClick={() => setIsMenuOpen((open) => !open)}
            aria-expanded={isMenuOpen}
            aria-controls="admin-nav"
            aria-label={isMenuOpen ? "Close admin menu" : "Open admin menu"}
            className="rounded-lg p-2 text-default-600 transition-colors hover:bg-default-100 lg:hidden"
          >
            {isMenuOpen ? (
              <FiX className="size-5" aria-hidden />
            ) : (
              <FiMenu className="size-5" aria-hidden />
            )}
          </button>
        </div>
      </div>

      <nav
        id="admin-nav"
        aria-label="Admin"
        className={`${
          isMenuOpen ? "block" : "hidden"
        } border-b border-default/60 bg-background px-3 py-4 lg:flex lg:h-[calc(100dvh-4rem)] lg:flex-col lg:border-b-0`}
      >
        <p className="px-3 pb-1.5 text-[0.6875rem] font-semibold uppercase tracking-wider text-default-400">
          Administration
        </p>
        <ul className="space-y-0.5">
          {adminLinks.map((link) => {
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

        <div className="mt-auto space-y-3 pt-6">
          <div className="border-t border-default/60 pt-3">
            {adminBackLinks.map((link) => (
              <Link
                key={link.id}
                href={link.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-default-700 transition-colors hover:bg-default-100 hover:text-foreground"
              >
                <HiOutlineArrowLeft aria-hidden className="size-4" />
                {link.label}
              </Link>
            ))}
          </div>

          {user && (
            <div className="rounded-lg border border-default/60 px-3 py-2.5">
              <p className="truncate text-xs font-semibold">{user.email}</p>
              <p className="mt-0.5 text-[0.6875rem] uppercase tracking-wider text-default-500">
                Signed in as {user.role}
              </p>
            </div>
          )}

          <p className="px-3 text-[0.6875rem] leading-relaxed text-default-400">
            Every admin action is logged against your account.
          </p>
        </div>
      </nav>
    </aside>
  );
};

export default AdminSidebar;
