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
        className="bg-default-100 font-medium text-foreground hover:bg-default-200"
        onClick={() => handleOnClick(name)}
        radius="full"
        size="sm"
        variant="flat"
      >
        {name}
      </Button>
  );
};

export default CategoryButton;
