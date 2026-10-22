"use client";

import { useUser } from "@/context/user.provider";
import { Button } from "@heroui/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PiMagicWandLight, PiUsers } from "react-icons/pi";

interface IProps {}

const FeedButtonsForSmallDevice = ({}: IProps) => {
  const { user: loggedInUser } = useUser();
  const pathName = usePathname();
  return (
    <>
      <Button
        as={Link}
        href={`/`}
        radius="full"
        variant={pathName === "/" ? "flat" : "light"}
        color={pathName === "/" ? "primary" : "default"}
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
        radius="full"
        startContent={<PiUsers className="text-lg" />}
      >
        Following
      </Button>
    </>
  );
};

export default FeedButtonsForSmallDevice;
