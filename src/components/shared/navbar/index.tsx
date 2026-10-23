"use client";

import { writeBlogPath } from "@/lib/blog-routes";


import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@heroui/react";
import { AnimatePresence, motion } from "framer-motion";
import { HiOutlinePencilSquare } from "react-icons/hi2";
import { FiMenu, FiX } from "react-icons/fi";
import { useUser } from "@/context/user.provider";
import { siteConfig } from "@/config/site";
import { Logo } from "@/components/shared/logo";
import LoginLogoutSwitch from "@/components/ui/login-logout-switch";
import { ThemeSwitch } from "@/components/ui/theme-switch";
import NavbarSearchInput from "./navbar-search-input";

const isActivePath = (pathname: string | null, href: string) =>
  href === "/" ? pathname === "/" : Boolean(pathname?.startsWith(href));

export const Navbar = () => {
  const pathname = usePathname();
  const { user } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-default/60 bg-background/95 backdrop-blur print:hidden">
      <div className="mx-auto flex h-16 w-full max-w-page items-center gap-3 px-4 sm:gap-4 sm:px-6 lg:px-8">
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
            aria-label="TechTipsHub home"
            className="flex items-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus/70"
          >
            <Logo size="md" className="hidden sm:inline-flex" />
            <Logo size="sm" wordmark={false} className="sm:hidden" />
          </Link>
        </div>

        {/* Primary navigation. Each link spans the bar's full height so the
            2px current-state rule lands on the header's own bottom border
            instead of floating inside it. */}
        <nav aria-label="Main" className="hidden self-stretch lg:block">
          <ul className="flex h-full items-stretch gap-1">
            {siteConfig.navItems.map((item) => {
              const active = isActivePath(pathname, item.href);
              return (
                <li key={item.href} className="flex">
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`flex items-center border-b-2 px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus/70 ${
                      active
                        ? "border-primary text-foreground"
                        : "border-transparent text-default-600 hover:text-foreground"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Search grows to fill the middle, up to 16rem: wide enough for the
            placeholder and the ⌘K hint, narrow enough that it does not read as
            the header's main control. The cap is an arbitrary value on purpose;
            `max-w-2xs` is not in this Tailwind scale and silently resolves to
            nothing. `w-0` gives the flex item a real starting basis, with
            `min-w-0` to stop the row's gap from holding it open. */}
        <div className="ml-auto hidden w-0 min-w-0 max-w-[16rem] flex-1 lg:block">
          <NavbarSearchInput />
        </div>

        {/* Actions */}
        <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2 lg:ml-0">
          <ThemeSwitch />

          {user ? (
            <Button
              as={Link}
              href={writeBlogPath}
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
            <div className="space-y-4 px-4 py-4 sm:px-6 lg:px-8">
              <NavbarSearchInput block />

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
                              ? "bg-primary/10 text-primary-accessible"
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

              {user ? (
                <Button
                  as={Link}
                  href={writeBlogPath}
                  onPress={() => setMenuOpen(false)}
                  fullWidth
                  radius="lg"
                  color="primary"
                  startContent={<HiOutlinePencilSquare className="text-base" />}
                >
                  Write a blog
                </Button>
              ) : (
                // Below `sm` the top bar keeps only the theme switch, so the
                // account actions live here where there is room to hit them.
                <div className="flex flex-col gap-2 sm:hidden">                  <Button
                    as={Link}
                    className="font-medium border border-default-300 text-foreground hover:bg-default-100"
                    href="/login"
                    onPress={() => setMenuOpen(false)}
                    fullWidth
                    radius="lg"
                    variant="bordered"
                  >
                    Log in
                  </Button>
                  <Button
                    as={Link}
                    className="font-semibold"
                    href="/signup"
                    onPress={() => setMenuOpen(false)}
                    fullWidth
                    radius="lg"
                    color="primary"
                  >
                    Sign up
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
