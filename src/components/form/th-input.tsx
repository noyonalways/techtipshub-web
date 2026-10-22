"use client";

import { Input, InputProps } from "@heroui/react";
import { useFormContext } from "react-hook-form";

interface IProps extends InputProps {
  name: string;
}

const THInput: React.FC<IProps> = ({ name, ...props }) => {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const errorMessage = errors[name]?.message as string | undefined;

  return (
    <Input
      errorMessage={errorMessage || ""}
      isInvalid={!!errors[name]}
      {...register(name)}
      {...props}
    />
  );
};

export default THInput;
