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
        href={`/`}
        variant={pathName === "/" ? "flat" : "light"}
        color={pathName === "/" ? "primary" : "default"}
        radius="sm"
        className={`w-full justify-start`}
        startContent={<PiMagicWandLight className="text-lg" />}
      >
        Personalized
      </Button>
      <Button
        isDisabled={!loggedInUser}
        as={Link}
        href={`/following`}
        variant={pathName === "/following" ? "flat" : "light"}
        color={pathName === "/following" ? "primary" : "default"}
        radius="sm"
        className={`w-full justify-start`}
        startContent={<PiUsers className="text-lg" />}
      >
        Following
      </Button>
    </>
  );
};

export default FeedButtonsForSideBar;