import { DatePicker, DatePickerProps } from "@heroui/date-picker";
import { Controller } from "react-hook-form";

interface IProps extends DatePickerProps {
  name: string;
  label?: string;
}

export default function THDatePicker({
  label,
  name,
  ...props
}: IProps) {
  return (
    <Controller
      name={name}
      render={({ formState: { errors }, field: { value, ...fields } }) => (
        <DatePicker
          {...props}
          classNames={{ calendar: "bg-content1" }}
          errorMessage={(errors[name]?.message as string | undefined) || ""}
          isInvalid={!!errors[name]}
          label={label}
          {...fields}
        />
      )}
    />
  );
}
