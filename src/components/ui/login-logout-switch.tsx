"use client";

import { useUser } from "@/context/user.provider";
import { button as buttonStyles } from "@heroui/react";
import NextLink from "next/link";
import NavarDropdown from "./navbar-dropdown";

const LoginLogoutSwitch = () => {
  const { user } = useUser();
  return (
    <>
      {user ? (
        <NavarDropdown />
      ) : (
        <div className="flex items-center gap-1">
          <NextLink
            className={`${buttonStyles({
              radius: "full",
              variant: "light",
              size: "sm",
            })} hidden font-medium duration-200 hover:bg-default-100 active:scale-95 sm:inline-flex`}
            href={`/login`}
          >
            Log In
          </NextLink>
          <NextLink
            className={`${buttonStyles({
              color: "primary",
              radius: "full",
              variant: "solid",
              size: "sm",
            })} font-medium duration-200 active:scale-95`}
            href={`/signup`}
          >
            Sign Up
          </NextLink>
        </div>
      )}
    </>
  );
};

export default LoginLogoutSwitch;
