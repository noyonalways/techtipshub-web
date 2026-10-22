"use client";

import { ICategory } from "@/types";
import { Button } from "@heroui/react";
import { useRouter } from "next/navigation";

interface IProps extends ICategory {}

const CategoryButton = ({ name }: IProps) => {
  const router = useRouter();

  const handleOnClick = (ctName: string) => {
    router.push(`?category=${ctName}`);
  };

  return (
    <Button
      onClick={() => handleOnClick(name)}
      variant="flat"
      radius="full"
      size="sm"
    >
      {name}
    </Button>
  );
};

export default CategoryButton;
