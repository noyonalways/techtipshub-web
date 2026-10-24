import SuspendedLoginForm from "@/components/modules/auth/login-form";
import AuthShell from "@/components/modules/auth/auth-shell";
import SocialLogin from "@/components/modules/auth/social-login";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Login",
  description:
    "Log in to TechTipsHub to access personalized content and manage your account. Stay updated with the latest tech insights.",
  robots: { index: false, follow: true },
  alternates: { canonical: "/login" },
  openGraph: {
    url: "/login",
    title: "Login",
    description:
      "Access your TechTipsHub account for personalized content and latest updates.",
  },
};

const points = [
  {
    title: "Read every article in full",
    description:
      "Preview what is on the feed; sign in to read the complete piece, including code samples.",
  },
  {
    title: "Take part in the discussion",
    description:
      "Comment on articles, vote on what helped and follow the authors you want to keep up with.",
  },
  {
    title: "Publish your own tutorials",
    description:
      "Every account can write, edit and manage articles with the built-in composer.",
  },
];

const LoginPage = () => {
  return (
    <AuthShell
      eyebrow="Account"
      title="Welcome back"
      description="Sign in to pick up where you left off — your feed, your drafts and the discussion."
      points={points}
      footer={
        <p>
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-semibold text-primary-accessible underline-offset-4 hover:underline"
          >
            Create one free
          </Link>
        </p>
      }
    >
      <div className="space-y-6">
        <SuspendedLoginForm />
        <SocialLogin />
      </div>
    </AuthShell>
  );
};

export default LoginPage;
