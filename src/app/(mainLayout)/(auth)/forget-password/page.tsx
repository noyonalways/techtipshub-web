import AuthShell from "@/components/modules/auth/auth-shell";
import SuspendedPasswordResetForm from "@/components/modules/auth/password-reset-form";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Reset Password",
  description:
    "Reset the password for your TechTipsHub account. We will email you a secure link.",
  robots: { index: false, follow: true },
  alternates: { canonical: "/forget-password" },
  openGraph: {
    url: "/forget-password",
    title: "Reset Password",
    description: "Recover access to your TechTipsHub account.",
  },
};

const points = [
  {
    title: "One email, one link",
    description:
      "The link is valid for a limited time and works once. Request a new one if it expires.",
  },
  {
    title: "No password changes without you",
    description:
      "We only send the reset link to the address already on the account.",
  },
];

const ForgetPasswordPage = () => {
  return (
    <AuthShell
      eyebrow="Account recovery"
      title="Reset your password"
      description="Enter the email you signed up with and we will send you a link to choose a new password."
      points={points}
      footer={
        <p>
          Remembered it?{" "}
          <Link
            href="/login"
            className="font-semibold text-primary-accessible underline-offset-4 hover:underline"
          >
            Back to sign in
          </Link>
        </p>
      }
    >
      <SuspendedPasswordResetForm />
    </AuthShell>
  );
};

export default ForgetPasswordPage;
