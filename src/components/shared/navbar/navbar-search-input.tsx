"use client";

import THForm from "@/components/form/th-from";
import THInput from "@/components/form/th-input";
import { SearchIcon } from "@/components/icons";
import { Kbd } from "@heroui/react";
import { useRouter } from "next/navigation";
import { FieldValues, SubmitHandler } from "react-hook-form";

interface IProps {}

const NavbarSearchInput = ({}: IProps) => {
  const router = useRouter();

  const onSubmit: SubmitHandler<FieldValues> = (values) => {
    if (values.search) {
      router.push(`?search=${values.search}`);
    }
  };

  return (
    <THForm onSubmit={onSubmit}>
      <THInput
        name="search"
        radius="full"
        variant="bordered"
        aria-label="Search"
        classNames={{
          input: "text-sm ",
        }}
        endContent={
          <Kbd className="hidden lg:inline-block" keys={["command"]}>
            K
          </Kbd>
        }
        labelPlacement="outside"
        placeholder="Search..."
        startContent={
          <SearchIcon className="text-base text-default-400 pointer-events-none flex-shrink-0" />
        }
        type="search"
      />
    </THForm>
  );
};

export default NavbarSearchInput;
