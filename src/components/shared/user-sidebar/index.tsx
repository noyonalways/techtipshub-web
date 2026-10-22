"use client";

import { Button } from "@heroui/react";
import Link from "next/link";
import { useState } from "react";
import {
  HiBars3,
  HiOutlineArrowLeft,
  HiXMark,
} from "react-icons/hi2";
import { usePathname } from "next/navigation";
import { userLinks } from "./user-links";

interface IProps {}

const UserSidebar = ({}: IProps) => {
  const [open, setOpen] = useState(false);
  const pathName = usePathname();

  return (
    <div className={`relative basis-full lg:basis-[16%] bg-background z-40`}>
      <Button
        className="absolute left-0 top-4 px-2 lg:hidden"
        variant="light"
        radius="sm"
        onClick={() => setOpen(!open)}
        startContent={<HiBars3 size={18} />}
      >
        User Settings
      </Button>

      <aside
        className={`border-r border-default/50 fixed bg-background w-[80%] lg:w-auto duration-200 lg:sticky top-16 lg:top-[68px] ${
          open ? "left-0" : "-left-96"
        }`}
      >
        <div className="flex flex-col h-[calc(100vh-68px)] pt-2 w-full">
          <div className="space-y-2 w-full flex-1">
            <h2 className="font-semibold px-4 py-2">User Settings</h2>

            {open && (
              <Button
                className="absolute right-2 top-0 lg:hidden"
                variant="flat"
                radius="sm"
                onClick={() => setOpen(!open)}
                startContent={<HiXMark size={16} />}
                isIconOnly
               />
            )}

            <ul className="px-4 flex flex-col w-full space-y-2">
              {userLinks.map((link) => (
                <li key={link.id}>
                  <Button
                    className="w-full justify-start"
                    startContent={link.icon}
                    radius="sm"
                    color={pathName === link.href ? "primary" : "default"}
                    variant={pathName === link.href ? "flat" : "light"}
                    as={Link}
                    href={link.href}
                  >
                    {link.label}
                  </Button>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-4 border-t border-default/50 ">
            <Button
              className="w-full justify-start"
              startContent={<HiOutlineArrowLeft size={18} />}
              radius="sm"
              variant="light"
              as={Link}
              href="/"
            >
              Back to Home
            </Button>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default UserSidebar;
