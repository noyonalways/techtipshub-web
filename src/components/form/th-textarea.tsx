"use client";

import { Textarea, TextAreaProps } from "@heroui/react";
import { useFormContext } from "react-hook-form";

interface IProps extends TextAreaProps {
  name: string;
}

const THTextarea: React.FC<IProps> = ({ name, ...props }) => {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const errorMessage = errors[name]?.message as string | undefined;

  return (
    <Textarea
      errorMessage={errorMessage || ""}
      isInvalid={!!errors[name]}
      {...register(name)}
      {...props}
    />
  );
};

export default THTextarea;
