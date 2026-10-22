"use client";

import THForm from "@/components/form/th-from";
import THInput from "@/components/form/th-input";
import { useForgetPassword } from "@/hooks/auth.hook";
import { passwordResetValidationSchema } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@heroui/react";
import Link from "next/link";
import { FieldValues, SubmitHandler } from "react-hook-form";
import { FiMail } from "react-icons/fi";

const PasswordResetForm = () => {
  const { mutate: handleForgetPassword, isPending, data, isError, error } =
    useForgetPassword();

  const onSubmit: SubmitHandler<FieldValues> = (payload) => {
    handleForgetPassword({ email: payload.email });
  };

  // The API's own message is the truthful one: it distinguishes "no such
  // account" from "this server cannot send email yet". Show it verbatim.
  const errorMessage =
    (data && !data.success && data.message) ||
    (isError ? error?.message : undefined);

  if (data?.success) {
    const sentTo = data?.data?.email ?? data?.data?.user?.email;

    return (
      <div className="space-y-4">
        <div
          role="status"
          className="rounded-xl border border-success/30 bg-success/10 p-5"
        >
          <p className="flex items-center gap-2 font-medium text-success">
            <FiMail aria-hidden />
            Check your inbox
          </p>
          <p className="mt-1 text-sm text-default-600">
            {sentTo ? (
              <>
                We sent a reset link to{" "}
                <span className="font-medium text-foreground">{sentTo}</span>.
              </>
            ) : (
              <>We sent a reset link to the address on your account.</>
            )}{" "}
            It expires in 30 minutes. If it does not arrive, check spam — or
            send it again.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            radius="lg"
            variant="bordered"
            isLoading={isPending}
            onPress={() =>
              handleForgetPassword({ email: data?.data?.email ?? "" })
            }
          >
            Send again
          </Button>
          <Button as={Link} href="/login" radius="lg" color="primary">
            Back to sign in
          </Button>
        </div>
      </div>
    );
  }

  const emailUnavailable =
    !!errorMessage && /not configured|cannot be sent/i.test(errorMessage);

  return (
    <THForm
      onSubmit={onSubmit}
      resolver={zodResolver(passwordResetValidationSchema)}
    >
      <div className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="mb-1 block text-xs font-semibold uppercase tracking-wider text-default-500"
          >
            Email
          </label>
          <THInput
            radius="lg"
            variant="bordered"
            name="email"
            id="email"
            placeholder="The address on your account"
            type="email"
            autoComplete="email"
          />
        </div>

        {errorMessage && (
          <div
            role="alert"
            className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger"
          >
            <p>{errorMessage}</p>
            {emailUnavailable && (
              <p className="mt-1 text-danger/80">
                You can still sign in with your current password. If you have
                forgotten it, contact support to reset it for you.
              </p>
            )}
          </div>
        )}

        <Button
          isLoading={isPending}
          type="submit"
          color="primary"
          variant="solid"
          radius="lg"
          className="w-full font-semibold"
        >
          {isPending ? "Sending link…" : "Send reset link"}
        </Button>
      </div>
    </THForm>
  );
};

export default PasswordResetForm;
