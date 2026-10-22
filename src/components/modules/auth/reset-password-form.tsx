"use client";

import THForm from "@/components/form/th-from";
import THInput from "@/components/form/th-input";
import { useResetPassword } from "@/hooks/auth.hook";
import { newPasswordValidationSchema } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@heroui/react";
import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { FieldValues, SubmitHandler } from "react-hook-form";
import { FiCheckCircle, FiEye, FiEyeOff } from "react-icons/fi";

const label =
  "mb-1 block text-xs font-semibold uppercase tracking-wider text-default-500";

type TokenState = "reading" | "ready" | "missing";

// The URL is an external store that never notifies us: these two readers only
// have to satisfy `useSyncExternalStore`, which calls them during render (so
// the token is known on the first paint) and again after hydration.
const subscribeToLocation = () => () => {};
const readToken = () => {
  const fromHash = new URLSearchParams(window.location.hash.slice(1)).get(
    "token",
  );
  // Older emails used a query parameter; accept it once, then tidy the URL.
  const fromQuery = new URLSearchParams(window.location.search).get("token");
  return fromHash || fromQuery || null;
};

const readTokenOnServer = () => null;

/**
 * Collects the reset token from the URL fragment.
 *
 * The link looks like `/reset-password?email=…#token=…`. The fragment is
 * deliberately used for the secret: unlike the query string it is never sent to
 * a server, never appears in access logs, and is not passed in a Referer header
 * to third-party assets on the page.
 */
const useResetToken = () => {
  const token = useSyncExternalStore(
    subscribeToLocation,
    readToken,
    readTokenOnServer,
  );
  // Before hydration there is no location to read, so the first paint is a
  // skeleton rather than a false "this link is missing" message.
  const hydrated = useSyncExternalStore(
    subscribeToLocation,
    () => true,
    () => false,
  );

  if (!hydrated) return { token: null, state: "reading" as TokenState };
  return {
    token,
    state: (token ? "ready" : "missing") as TokenState,
  };
};

const PasswordField = ({
  name,
  id,
  placeholder,
  autoComplete,
}: {
  name: string;
  id: string;
  placeholder: string;
  autoComplete: string;
}) => {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <THInput
        name={name}
        id={id}
        type={visible ? "text" : "password"}
        placeholder={placeholder}
        autoComplete={autoComplete}
        radius="lg"
        variant="bordered"
        classNames={{ inputWrapper: "pr-10" }}
      />
      <button
        type="button"
        onClick={() => setVisible((value) => !value)}
        aria-label={visible ? "Hide password" : "Show password"}
        className="absolute right-3 top-[2.15rem] text-default-400 transition-colors hover:text-foreground"
      >
        {visible ? <FiEyeOff /> : <FiEye />}
      </button>
    </div>
  );
};

const ResetPasswordForm = () => {
  const { token, state } = useResetToken();
  const { mutate, isPending, data, reset } = useResetPassword();

  const onSubmit: SubmitHandler<FieldValues> = (values) => {
    if (!token) return;
    mutate({ newPassword: values.newPassword, token });
  };

  // A legacy link puts the secret in the query string; move it to the fragment
  // once so clicking through the page cannot leak it to another host.
  useEffect(() => {
    const fromQuery = new URLSearchParams(window.location.search).get("token");
    if (!fromQuery) return;
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}#token=${fromQuery}`,
    );
  }, []);

  if (state === "reading") {
    return (
      <div className="space-y-3" aria-busy>
        <div className="h-11 animate-pulse rounded-lg bg-default-100" />
        <div className="h-11 animate-pulse rounded-lg bg-default-100" />
        <div className="h-11 animate-pulse rounded-lg bg-default-100" />
      </div>
    );
  }

  if (state === "missing") {
    return (
      <div className="rounded-xl border border-warning/30 bg-warning/10 p-5">
        <p className="font-medium text-warning-700 dark:text-warning">
          This page needs a reset link
        </p>
        <p className="mt-1 text-sm text-default-600">
          Open the link from the email we sent you, or request a fresh one and
          it will bring you straight back here.
        </p>
        <Button
          as={Link}
          href="/forget-password"
          radius="lg"
          color="primary"
          className="mt-4 font-semibold"
        >
          Request a new link
        </Button>
      </div>
    );
  }

  if (data?.success) {
    return (
      <div
        role="status"
        className="rounded-xl border border-success/30 bg-success/10 p-5"
      >
        <p className="flex items-center gap-2 font-medium text-success">
          <FiCheckCircle aria-hidden />
          Your password is updated
        </p>
        <p className="mt-1 text-sm text-default-600">
          For your security, every other session was signed out. Sign in with
          the new password to continue.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            as={Link}
            href="/login"
            radius="lg"
            color="primary"
            className="font-semibold"
          >
            Sign in
          </Button>
          <Button as={Link} href="/" radius="lg" variant="bordered">
            Back to the feed
          </Button>
        </div>
      </div>
    );
  }

  const errorMessage = data && !data.success ? data.message : undefined;

  return (
    <THForm
      onSubmit={onSubmit}
      resolver={zodResolver(newPasswordValidationSchema)}
    >
      <div className="space-y-4">
        <div>
          <label htmlFor="newPassword" className={label}>
            New password
          </label>
          <PasswordField
            name="newPassword"
            id="newPassword"
            placeholder="At least 6 characters"
            autoComplete="new-password"
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className={label}>
            Confirm new password
          </label>
          <PasswordField
            name="confirmPassword"
            id="confirmPassword"
            placeholder="Type it again"
            autoComplete="new-password"
          />
        </div>

        <p className="text-xs text-default-500">
          Use at least 6 characters. A passphrase you don’t use anywhere else is
          strongest.
        </p>

        {errorMessage && (
          <div
            role="alert"
            className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger"
          >
            <p>{errorMessage}</p>
            {/expired|not valid/i.test(errorMessage) && (
              <Link
                href="/forget-password"
                className="mt-1 inline-block font-semibold underline underline-offset-4"
                onClick={() => reset()}
              >
                Request a new link
              </Link>
            )}
          </div>
        )}

        <Button
          isLoading={isPending}
          type="submit"
          color="primary"
          radius="lg"
          className="w-full font-semibold"
        >
          {isPending ? "Updating…" : "Set new password"}
        </Button>
      </div>
    </THForm>
  );
};

export default ResetPasswordForm;
