"use client"

import { useUser } from "@/context/user.provider";
import { Button } from "@heroui/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PiMagicWandLight, PiUsers } from "react-icons/pi";

interface IProps {}

const FeedButtonsForSideBar = ({}: IProps) => {
  const { user: loggedInUser } = useUser();
  const pathName = usePathname();
  return (
    <>
      <Button
        as={Link}
        href="/"
        radius="sm"
        className={
          pathName === "/"
            ? "w-full justify-start bg-primary-100 font-medium text-foreground hover:bg-primary-200"
            : "w-full justify-start bg-transparent font-medium text-default-600 hover:bg-default-100 hover:text-foreground"
        }
        startContent={<PiMagicWandLight className="text-lg" />}
      >
        Personalized
      </Button>
      <Button
        as={Link}
        href="/following"
        isDisabled={!loggedInUser}
        radius="sm"
        className={
          pathName === "/following"
            ? "w-full justify-start bg-primary-100 font-medium text-foreground hover:bg-primary-200"
            : "w-full justify-start bg-transparent font-medium text-default-600 hover:bg-default-100 hover:text-foreground"
        }
        startContent={<PiUsers className="text-lg" />}
      >
        Following
      </Button>
    </>
  );
};

export default FeedButtonsForSideBar;