import AuthShell from "@/components/modules/auth/auth-shell";
import ResetPasswordForm from "@/components/modules/auth/reset-password-form";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Choose a new password",
  description: "Set a new password for your TechTipsHub account.",
  robots: { index: false, follow: false },
};

const points = [
  {
    title: "Only the link holder can change it",
    description:
      "The link works once and expires after 30 minutes, so a forwarded or old email cannot be reused.",
  },
  {
    title: "Your other sessions end",
    description:
      "Setting a new password signs out any device still using the old one.",
  },
  {
    title: "Stuck?",
    description:
      "If the link has expired, request a fresh one — it takes a few seconds.",
  },
];

const ResetPasswordPage = () => {
  return (
    <AuthShell
      eyebrow="Account recovery"
      title="Choose a new password"
      description="Pick something you haven’t used elsewhere. You will sign in again right after."
      points={points}
      footer={
        <p>
          Need a new link?{" "}
          <Link
            href="/forget-password"
            className="font-semibold text-primary-accessible underline-offset-4 hover:underline"
          >
            Request another email
          </Link>
        </p>
      }
    >
      <ResetPasswordForm />
    </AuthShell>
  );
};

export default ResetPasswordPage;
