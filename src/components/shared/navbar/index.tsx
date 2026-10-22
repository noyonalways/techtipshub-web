"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@heroui/react";
import { AnimatePresence, motion } from "framer-motion";
import { HiOutlinePencilSquare } from "react-icons/hi2";
import { FiMenu, FiX } from "react-icons/fi";
import { useUser } from "@/context/user.provider";
import { siteConfig } from "@/config/site";
import { poppins } from "@/config/fonts";
import LoginLogoutSwitch from "@/components/ui/login-logout-switch";
import { ThemeSwitch } from "@/components/ui/theme-switch";
import NavbarSearchInput from "./navbar-search-input";
import Image from "next/image";

const isActivePath = (pathname: string | null, href: string) =>
  href === "/" ? pathname === "/" : Boolean(pathname?.startsWith(href));

export const Navbar = () => {
  const pathname = usePathname();
  const { user } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-default/60 bg-background/80 backdrop-blur-md print:hidden">
      <div className="mx-auto flex h-16 w-full max-w-[88rem] items-center gap-3 px-4 sm:gap-4 sm:px-6">
        {/* Brand + mobile menu toggle */}
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((open) => !open)}
            className="-ml-2 rounded-lg p-2 text-default-600 transition-colors hover:bg-default-100 hover:text-foreground lg:hidden"
          >
            {menuOpen ? (
              <FiX className="size-5" aria-hidden />
            ) : (
              <FiMenu className="size-5" aria-hidden />
            )}
          </button>

          <Link
            href="/"
            aria-label="TechTips Hub home"
            className="flex items-center gap-2.5"
          >
            <Image
              src="/tech-tips-hub-logo.png"
              alt=""
              width={32}
              height={32}
              className="size-8 rounded-md"
              priority
            />
            <span
              className={`${poppins.className} hidden text-[0.9375rem] font-semibold tracking-tight sm:block`}
            >
              TechTips Hub
            </span>
          </Link>
        </div>

        {/* Primary navigation */}
        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {siteConfig.navItems.map((item) => {
              const active = isActivePath(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      active
                        ? "text-primary"
                        : "text-default-600 hover:bg-default-100 hover:text-foreground"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Search grows to fill the middle */}
        <div className="ml-auto hidden min-w-0 max-w-sm flex-1 lg:block">
          <NavbarSearchInput />
        </div>

        {/* Actions */}
        <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2 lg:ml-0">
          <ThemeSwitch />

          {user ? (
            <Button
              as={Link}
              href="/write-blog"
              size="sm"
              radius="full"
              color="primary"
              startContent={<HiOutlinePencilSquare className="text-base" />}
              className="hidden font-medium sm:inline-flex"
            >
              Write
            </Button>
          ) : null}

          <LoginLogoutSwitch />
        </div>
      </div>

      {/* Mobile navigation drawer */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="overflow-hidden border-t border-default/60 bg-background lg:hidden"
          >
            <div className="space-y-4 px-4 py-4">
              <NavbarSearchInput />

              <nav aria-label="Main (mobile)">
                <ul className="space-y-1">
                  {siteConfig.navMenuItems.map((item) => {
                    const active = isActivePath(pathname, item.href);
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={() => setMenuOpen(false)}
                          aria-current={active ? "page" : undefined}
                          className={`block rounded-lg px-3 py-2.5 text-sm font-medium ${
                            active
                              ? "bg-primary/10 text-primary"
                              : "text-default-700 hover:bg-default-100"
                          }`}
                        >
                          {item.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>

              {user && (
                <Button
                  as={Link}
                  href="/write-blog"
                  onPress={() => setMenuOpen(false)}
                  fullWidth
                  radius="lg"
                  color="primary"
                  startContent={<HiOutlinePencilSquare className="text-base" />}
                >
                  Write a post
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
