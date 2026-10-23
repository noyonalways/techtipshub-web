// components/BlogShareDropdown.js
"use client";

import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@heroui/react";
import { PiLink, PiShareNetwork } from "react-icons/pi";
import { BsTwitterX } from "react-icons/bs";
import { FaFacebook, FaLinkedin } from "react-icons/fa";
import { useEffect, useState } from "react";
import copy from "clipboard-copy";
import { toast } from "sonner";

const BlogShareDropdown = () => {
  const [permalink, setPermalink] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setPermalink(window.location.href);
    }
  }, []);

  const handleCopyLink = async () => {
    try {
      await copy(permalink);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 4000); // Reset after 4 seconds
      toast.success("Link Copied!", {
        id: "blog-link-copied",
        closeButton: true,
      });
    } catch (error) {
      console.error("Failed to copy text to clipboard", error);
    }
  };

  const handleShareClick = (url: string) => {
    window.open(url, "_blank");
  };

  return (
    <Dropdown placement="top">
      <DropdownTrigger>
        <Button
          className="text-2xl mx-2"
          variant="light"
          isIconOnly
          radius="full"
        >
          <PiShareNetwork />
        </Button>
      </DropdownTrigger>
      <DropdownMenu aria-label="Share Actions" classNames={{ base: "border border-default-100" }}>
        <DropdownItem
          key="permalink"
          startContent={<PiLink />}
          onClick={handleCopyLink}
        >
          {isCopied ? "Link Copied!" : "Permalink"}
        </DropdownItem>
        <DropdownItem
          key="linkedin"
          startContent={<FaLinkedin />}
          onClick={() =>
            handleShareClick(
              `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                permalink
              )}`
            )
          }
        >
          LinkedIn
        </DropdownItem>
        <DropdownItem
          key="twitter"
          startContent={<BsTwitterX />}
          onClick={() =>
            handleShareClick(
              `https://twitter.com/share?url=${encodeURIComponent(permalink)}`
            )
          }
        >
          Twitter
        </DropdownItem>
        <DropdownItem
          key="facebook"
          startContent={<FaFacebook />}
          onClick={() =>
            handleShareClick(
              `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                permalink
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

export default BlogShareDropdown;
