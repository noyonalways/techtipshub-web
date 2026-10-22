"use client"

import { ThemeSwitch } from "@/components/ui/theme-switch";
import {
  Button,
  Image,
} from "@heroui/react";
import Link from "next/link";
import { useState } from "react";
import { HiBars2, HiXMark } from "react-icons/hi2";
import { adminLinks } from "./admin-links";
import { usePathname } from "next/navigation";

interface IProps {}

const AdminSidebar = ({}: IProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathName = usePathname();


  return (
    <div className="lg:basis-[15%] border-b lg:border-r border-default/50 lg:h-screen fixed top-0 lg:sticky w-full z-[60] bg-background">
      <div className="flex items-center justify-between p-4 border-b border-default/50">
        <Link className="flex items-center space-x-2" href="/">
          <Image
            className="size-10"
            src="/tech-tips-hub-logo.png"
            alt="tech-tips-hub-logo"
          />
          <span className="text-lg font-semibold hidden lg:inline-block">
            Admin Panel
          </span>
        </Link>
        <div className="flex space-x-4 items-center">
          <ThemeSwitch />
          <Button
            isIconOnly
            variant="flat"
            className="lg:hidden active:scale-95 transition duration-150"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <HiXMark size={24} /> : <HiBars2 size={24} />}
          </Button>
        </div>
      </div>

      <nav
        className={`lg:block transition-all duration-300 ease-in-out px-2 lg:px-4 py-2 ${
          isMenuOpen ? "right-0" : "right-full"
        } absolute lg:static top-18  w-full bg-background/30 lg:bg-transparent h-screen lg:h-auto backdrop-blur-lg`}
      >
        <ul className="space-y-2">
          {adminLinks.map((link) => (
            <li key={link.id}>
              <Button
                radius="sm"
                color={pathName === link.href ? "primary": "default"}
                variant={pathName === link.href ? "flat": "light"}
                className={`w-full justify-start`}
                as={Link}
                href={link.href}
                startContent={link.icon}
              >
                {link.label}
              </Button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default AdminSidebar;