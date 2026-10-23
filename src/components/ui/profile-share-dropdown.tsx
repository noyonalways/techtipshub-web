"use client";

import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@heroui/react";
import { useEffect, useState } from "react";
import { BsTwitterX } from "react-icons/bs";
import { FaFacebook, FaLinkedin } from "react-icons/fa";
import { IoShareOutline } from "react-icons/io5";
import { PiLink } from "react-icons/pi";
import copy from "clipboard-copy";
import { toast } from "sonner";

interface IProps {}

const ProfileShareDropdown = ({}: IProps) => {
  const [profileLink, setProfileLink] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    // Adjust profile link to new users path
    const currentUrl = window.location.href;
    const adjustedUrl = currentUrl.replace("/profile", "/users");
    setProfileLink(adjustedUrl);
  }, []);


  const handleCopyLink = async () => {
    try {
      await copy(profileLink);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 4000); // Reset after 4 seconds
      toast.success("Link Copied!", {
        id: "profile-link-copied",
        closeButton: true,
      });
    } catch (error) {
      console.error("Failed to copy link", error);
    }
  };

  const handleShareClick = (url: string) => {
    window.open(url, "_blank");
  };

  return (
    <Dropdown placement="bottom">
      <DropdownTrigger>
        <Button
          aria-label="Share profile"
          className="border border-default-300 text-foreground hover:bg-default-100"
          size="sm"
          isIconOnly
          radius="full"
          variant="bordered"
        >
          <IoShareOutline className="text-lg" />
        </Button>
      </DropdownTrigger>
      <DropdownMenu aria-label="Share Profile Actions" classNames={{ base: "border border-default-100" }}>
        <DropdownItem
          key="profile-permalink"
          startContent={<PiLink />}
          onClick={handleCopyLink}
        >
          {isCopied ? "Link Copied!" : "Permalink"}
        </DropdownItem>
        <DropdownItem
          key="profile-linkedin"
          startContent={<FaLinkedin />}
          onClick={() =>
            handleShareClick(
              `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                profileLink
              )}`
            )
          }
        >
          LinkedIn
        </DropdownItem>
        <DropdownItem
          key="profile-twitter"
          startContent={<BsTwitterX />}
          onClick={() =>
            handleShareClick(
              `https://twitter.com/share?url=${encodeURIComponent(profileLink)}`
            )
          }
        >
          Twitter
        </DropdownItem>
        <DropdownItem
          key="profile-facebook"
          startContent={<FaFacebook />}
          onClick={() =>
            handleShareClick(
              `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                profileLink
              )}`
            )
          }
        >
          Facebook
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};

export default ProfileShareDropdown;
