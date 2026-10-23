"use client";

import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@heroui/react";
import { SharedSelection } from "@heroui/system";
import React, { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";

interface IProps {
  name: string;
  label?: string; // Optional label prop to make it more dynamic
}

const GenderDropdown: React.FC<IProps> = ({ name, label }) => {
  const {
    register,
    setValue,
    clearErrors,
    formState: { errors },
  } = useFormContext();

  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

  const handleSelectionChange = (keys: SharedSelection) => {
    const selected = Array.from(keys)[0];
    setSelectedKeys(new Set([selected as string]));
    setValue(name, selected);

    if (selected) {
      clearErrors(name);
    }
  };

  const selectedValue = React.useMemo(
    () => Array.from(selectedKeys).join(", ").replaceAll("_", " "),
    [selectedKeys]
  );

  useEffect(() => {
    register(name);
  }, [register, name]);

  return (
    <div>
      {/* Optional Label */}
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
        </label>
      )}

      <Dropdown>
        <DropdownTrigger>
          <Button
            radius="sm"
            variant="flat"
            className={`capitalize w-full justify-start ${
              !errors[name] && "bg-default-100"
            }`}
            color={errors[name] ? "danger" : "default"}
          >
            {selectedValue || "Select Gender"}
          </Button>
        </DropdownTrigger>

        <DropdownMenu
          aria-label="Gender selection"
          classNames={{ base: "border border-default-100" }}
          variant="flat"
          disallowEmptySelection
          selectionMode="single"
          selectedKeys={selectedKeys} // Manage selected keys
          onSelectionChange={handleSelectionChange} // Handle selection changes
        >
          <DropdownItem key="Male">Male</DropdownItem>
          <DropdownItem key="Female">Female</DropdownItem>
          <DropdownItem key="Other">Other</DropdownItem>
        </DropdownMenu>
      </Dropdown>

      {errors[name] && (
        <span className="text-[#f53e7e] mt-2 text-xs ml-1">
          {errors[name]?.message as string}
        </span>
      )}
    </div>
  );
};

export default GenderDropdown;
