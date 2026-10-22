"use client";

import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@heroui/react";
import Link from "next/link";
import { GoPencil } from "react-icons/go";

interface IProps {}

const EditProfileDropdown = ({}: IProps) => {
  return (
    <Dropdown placement="bottom-end">
      <DropdownTrigger>
        <Button
          size="sm"
          radius="full"
          variant="solid"
          color="primary"
          startContent={<GoPencil className="text-lg" />}
        >
          Edit
        </Button>
      </DropdownTrigger>
      <DropdownMenu aria-label="Profile Actions" variant="flat">
        <DropdownItem key="update-profile">
          <Link className="h-full w-full block" href={`/settings`}>
            Update Profile Details
          </Link>
        </DropdownItem>
        <DropdownItem key="update-social-links">
          <Link className="h-full w-full block" href={`/settings#social-links`}>
            Update Social Links
          </Link>
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};

export default EditProfileDropdown;
