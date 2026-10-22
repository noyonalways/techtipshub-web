"use client";

import THForm from "@/components/form/th-from";
import THInput from "@/components/form/th-input";
import { useUser } from "@/context/user.provider";
import { useUserLogin } from "@/hooks/auth.hook";
import { signInValidationSchema } from "@/schemas";
import { TLogin } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@heroui/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { FieldValues, SubmitHandler } from "react-hook-form";
import { PiEyeLight, PiEyeSlashLight } from "react-icons/pi";

const label =
  "mb-1 block text-xs font-semibold uppercase tracking-wider text-default-500";

const LoginForm = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isPassword, setIsPassword] = useState(true);

  const { setIsLoading: setUserLoading } = useUser();
  const { mutate: handleLogin, isPending, data, isError, error } = useUserLogin();

  const onSubmit: SubmitHandler<FieldValues> = (values) => {
    handleLogin(values as TLogin);
    setUserLoading(true);
  };

  const redirect = searchParams.get("redirect");

  useEffect(() => {
    if (!isPending && data?.success) {
      setUserLoading(false);
      router.push(redirect || "/");
    }
  }, [isPending, data, redirect, router, setUserLoading]);

  // The API returns a message for wrong credentials; surface it rather than
  // leaving the form looking like nothing happened.
  const errorMessage =
    (data && !data.success && data.message) ||
    (isError ? error?.message : undefined);

  return (
    <Suspense>
      <THForm onSubmit={onSubmit} resolver={zodResolver(signInValidationSchema)}>
        <div className="space-y-4">
          <div>
            <label htmlFor="email" className={label}>
              Email
            </label>
            <THInput
              variant="bordered"
              radius="lg"
              name="email"
              id="email"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <div className="mb-1 flex items-baseline justify-between gap-2">
              <label htmlFor="password" className={`${label} mb-0`}>
                Password
              </label>
              <Link
                href="/forget-password"
                className="text-xs font-medium text-primary underline-offset-4 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <THInput
                variant="bordered"
                radius="lg"
                name="password"
                id="password"
                placeholder="Your password"
                type={isPassword ? "password" : "text"}
              />
              <Button
                variant="light"
                size="sm"
                radius="full"
                isIconOnly
                onClick={() => setIsPassword(!isPassword)}
                type="button"
                aria-label={isPassword ? "Show password" : "Hide password"}
                className="absolute right-1 top-1/2 -translate-y-1/2 text-lg"
              >
                {isPassword ? <PiEyeLight /> : <PiEyeSlashLight />}
              </Button>
            </div>
          </div>

          {errorMessage && (
            <p
              role="alert"
              className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger"
            >
              {errorMessage}
            </p>
          )}

          <Button
            isLoading={isPending}
            type="submit"
            color="primary"
            variant="solid"
            radius="lg"
            className="w-full font-semibold"
          >
            {isPending ? "Signing in…" : "Sign in"}
          </Button>
        </div>
      </THForm>
    </Suspense>
  );
};

const SuspendedLoginForm = () => (
  <Suspense fallback={<div className="h-64" />}>
    <LoginForm />
  </Suspense>
);

export default SuspendedLoginForm;
