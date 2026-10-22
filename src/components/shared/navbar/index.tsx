"use client";

import LoginLogoutSwitch from "@/components/ui/login-logout-switch";
import { ThemeSwitch } from "@/components/ui/theme-switch";
import WritePostButton from "@/components/ui/write-post-button";
import { siteConfig } from "@/config/site";
import { usePathname } from "next/navigation";
import {
  Button,
  Image,
  link as linkStyles,
  Navbar as NextUINavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuToggle,
} from "@heroui/react";
import clsx from "clsx";
import NextLink from "next/link";
import NavbarSearchInput from "./navbar-search-input";
import { GoPencil } from "react-icons/go";
import { useUser } from "@/context/user.provider";

export const Navbar = () => {
  const pathName = usePathname();
  const { user } = useUser();

  return (
    <NextUINavbar
      maxWidth="full"
      position="sticky"
      className="border border-default/50 z-50 print:hidden"
    >
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand as="li" className="gap-3 max-w-fit">
          <NextLink href="/">
            <Image
              className="size-10"
              src="/tech-tips-hub-logo.png"
              alt="tech-tips-hub-logo"
            />
          </NextLink>
          <div className="size-10 flex justify-center lg:hidden">
            <NavbarMenuToggle />
          </div>
        </NavbarBrand>
        <ul className="hidden lg:flex gap-10 justify-start ml-2">
          {siteConfig.navItems.map((item) => (
            <NavbarItem key={item.href}>
              <NextLink
                className={clsx(
                  linkStyles({ color: "foreground" }),
                  "data-[active=true]:text-primary data-[active=true]:font-medium",
                  pathName === item.href ? "text-primary" : ""
                )}
                color="foreground"
                href={item.href}
              >
                {item.label}
              </NextLink>
            </NavbarItem>
          ))}
        </ul>
      </NavbarContent>

      <NavbarContent
        className="hidden sm:flex basis-1/5 sm:basis-full"
        justify="end"
      >
        <NavbarItem className="hidden lg:flex">
          {<NavbarSearchInput />}
        </NavbarItem>

        <NavbarItem className="hidden sm:flex gap-2">
          <ThemeSwitch className="hidden lg:inline-block" />
        </NavbarItem>

        {user && (
          <NavbarItem>
            <Button
              as={NextLink}
              size="sm"
              radius="full"
              variant="solid"
              color="primary"
              startContent={<GoPencil className="text-lg" />}
              href="/write-blog"
            >
              Write Blog
            </Button>
          </NavbarItem>
        )}

        <LoginLogoutSwitch />
      </NavbarContent>

      <NavbarContent className="md:hidden basis-1 pl-4" justify="end">
        <ThemeSwitch />
        {user && (
          <NavbarItem>
            <Button
              as={NextLink}
              size="sm"
              radius="full"
              variant="solid"
              color="primary"
              startContent={<GoPencil className="text-lg" />}
              href="/write-blog"
            >
              Write Blog
            </Button>
          </NavbarItem>
        )}
        <LoginLogoutSwitch />
      </NavbarContent>

      <NavbarMenu className="z-50">
        <NavbarSearchInput />
        <div className="mx-4 mt-2 flex flex-col gap-2">
          {siteConfig.navMenuItems.map((item, index) => (
            <NavbarMenuItem key={`${item}-${index}`}>
              <NextLink
                className={clsx(
                  linkStyles({ color: "foreground" }),
                  "data-[active=true]:text-primary data-[active=true]:font-medium",
                  pathName === item.href ? "text-primary" : ""
                )}
                href={item.href}
              >
                {item.label}
              </NextLink>
            </NavbarMenuItem>
          ))}
        </div>
      </NavbarMenu>
    </NextUINavbar>
  );
};
