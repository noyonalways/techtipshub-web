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
        <div className="hidden items-center gap-1 sm:flex">
          <NextLink
            className={`${buttonStyles({
              radius: "full",
              variant: "light",
              size: "sm",
            })} hidden font-medium duration-200 hover:bg-default-100 active:scale-95 sm:inline-flex`}
            href={`/login`}
          >
            Log in
          </NextLink>
          <NextLink
            className={`${buttonStyles({
              color: "primary",
              radius: "full",
              variant: "solid",
              size: "sm",
            })} hidden font-medium duration-200 active:scale-95 sm:inline-flex`}
            href={`/signup`}
          >
            Sign up
          </NextLink>
        </div>
      )}
    </>
  );
};

export default LoginLogoutSwitch;
