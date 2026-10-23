import AuthShell from "@/components/modules/auth/auth-shell";
import SignUpForm from "@/components/modules/auth/signup-form";
import SocialLogin from "@/components/modules/auth/social-login";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sign Up",
  description:
    "Join TechTipsHub to read every article, share your own tutorials and join the discussion. Creating a free account is all it takes.",
  keywords:
    "TechTipsHub, sign up, register, create account, tech tips, tutorials, tech insights, tech community",
  openGraph: {
    title: "Sign up",
    description:
      "Create a free TechTipsHub account to read every article, publish your own tutorials and join the discussion.",
    url: "https://techtipshub.vercel.app/signup",
  },
};

const points = [
  {
    title: "Free, with no tiers",
    description:
      "Every account has the same abilities. There is no paid plan and nothing is held back.",
  },
  {
    title: "A profile you control",
    description:
      "Add a bio, a photo and the social links you want readers to see.",
  },
  {
    title: "Write in the browser",
    description:
      "A full editor with Markdown-style shortcuts, headings, code blocks and images.",
  },
];

const SignUpPage = () => {
  return (
    <AuthShell
      eyebrow="Get started"
      title="Create your account"
      description="Read everything, join the discussion and publish your own tutorials. It takes a minute."
      points={points}
      footer={
        <p>
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-primary-accessible underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </p>
      }
    >
      <div className="space-y-6">
        <SignUpForm />
        <SocialLogin />
        <p className="text-xs leading-relaxed text-default-600">
          By creating an account you agree to our{" "}
          <Link
            href="/terms"
            className="font-medium text-default-700 underline-offset-4 hover:underline"
          >
            Terms
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy"
            className="font-medium text-default-700 underline-offset-4 hover:underline"
          >
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </AuthShell>
  );
};

export default SignUpPage;
