"use client";

import THForm from "@/components/form/th-from";
import THInput from "@/components/form/th-input";
import { useForgetPassword } from "@/hooks/auth.hook";
import { passwordResetValidationSchema } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@heroui/react";
import { useRouter } from "next/navigation";
import { Suspense, useEffect } from "react";
import { FieldValues, SubmitHandler } from "react-hook-form";

const PasswordResetForm = () => {
  const router = useRouter();

  const {
    mutate: handleForgetPassword,
    isPending,
    data,
  } = useForgetPassword();

  const onSubmit: SubmitHandler<FieldValues> = (payload) => {
    handleForgetPassword({ email: payload.email });
  };

  useEffect(() => {
    if (!isPending && data?.success) {
      router.push("/login");
    }
  }, [isPending, data, router]);

  return (
    <Suspense>
      <THForm
        onSubmit={onSubmit}
        resolver={zodResolver(passwordResetValidationSchema)}
      >
        <div className="space-y-2 pb-4">
          <THInput radius="sm" name="email" label="Email Address" isRequired />

          <Button
            isLoading={isPending}
            type="submit"
            color="primary"
            variant="solid"
            radius="sm"
            className="w-full"
          >
            {isPending ? "Sending Email...": "Send Email"}
          </Button>
        </div>
      </THForm>
    </Suspense>
  );
};



export default PasswordResetForm;
