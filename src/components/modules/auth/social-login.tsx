"use client";

import { Button } from "@heroui/react";
import { signIn } from "next-auth/react";
import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

/**
 * Third-party sign-in. Rendered as full-width labelled buttons so the option
 * is readable, not a pair of cryptic icon tiles.
 */
const SocialLogin = () => {
  const providers = [
    {
      id: "google",
      label: "Continue with Google",
      icon: <FcGoogle aria-hidden size={18} />,
    },
    {
      id: "github",
      label: "Continue with GitHub",
      icon: <FaGithub aria-hidden size={18} />,
    },
  ];

  return (
    <div>
      <div className="flex items-center gap-3 tth-label-sm text-default-600">
        <span className="h-px flex-1 bg-default/60" aria-hidden />
        or
        <span className="h-px flex-1 bg-default/60" aria-hidden />
      </div>

      <div className="mt-5 grid gap-2 sm:grid-cols-2">
        {providers.map((provider) => (
          <Button
            key={provider.id}
            fullWidth
            radius="lg"
            variant="bordered"
            className="border border-default-300 font-medium text-foreground hover:bg-default-100"
            startContent={provider.icon}
            onClick={() => {
              signIn(provider.id, { callbackUrl: "/" });
            }}
          >
            {provider.label}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default SocialLogin;
