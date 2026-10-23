"use client";

import { useUser } from "@/context/user.provider";
import { Button } from "@heroui/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PiMagicWandLight, PiUsers } from "react-icons/pi";

/**
 * Feed switch: every feed or following. The current item gets the amber wash
 * with an ink label; the other one is quiet. HeroUI's own `flat primary`
 * paints the label in raw amber-600, which fails on paper, so the state is
 * expressed with tokens here instead.
 */
const itemClass = (active: boolean) => {
  const base = "w-full justify-start font-medium transition-colors";

  return active
    ? `${base} bg-primary-100 text-foreground hover:bg-primary-200 dark:bg-primary-200/20 dark:hover:bg-primary-200/30`
    : `${base} bg-transparent text-default-600 hover:bg-default-100 hover:text-foreground`;
};

const FeedButtons = () => {
  const { user: loggedInUser } = useUser();
  const pathName = usePathname();

  return (
    <>
      <Button
        as={Link}
        className={itemClass(pathName === "/")}
        href="/"
        radius="full"
        startContent={<PiMagicWandLight className="text-lg" />}
      >
        Personalized
      </Button>
      <Button
        as={Link}
        className={itemClass(pathName === "/following")}
        href="/following"
        isDisabled={!loggedInUser}
        radius="full"
        startContent={<PiUsers className="text-lg" />}
      >
        Following
      </Button>
    </>
  );
};

export default FeedButtons;
