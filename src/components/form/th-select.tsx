import { Select, SelectItem, SelectProps } from "@heroui/select";
import { useFormContext } from "react-hook-form";

interface IProps {
  options: {
    key: string;
    label: string;
  }[];
  name: string;
  label?: string;
  variant?: "flat" | "faded" | "bordered" | "underlined" | undefined;
  size?: "sm" | "md" | "lg" | undefined;
  radius?: "none" | "sm" | "md" | "lg" | "full";
  id?: string;
  placeholder?: string;
  isRequired?: boolean;
}

const THSelect: React.FC<IProps> = ({
  name,
  label,
  variant,
  size,
  radius,
  id,
  placeholder,
  options,
  isRequired,
  ...props
}) => {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const errorMessage = errors[name]?.message as string | undefined;

  return (
    <Select
      {...register(name)}
      {...props}
      errorMessage={errorMessage || ""}
      isInvalid={!!errors[name]}
      label={label}
      variant={variant}
      size={size}
      radius={radius}
      id={id}
      isRequired={isRequired}
      placeholder={placeholder}
      classNames={{ popoverContent: "border border-default-100" }}
    >
      {options?.map((option) => (
        <SelectItem  key={option.key}>{option.label}</SelectItem>
      ))}
    </Select>
  );
};

export default THSelect;
