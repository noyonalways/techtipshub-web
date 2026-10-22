import Container from "@/components/ui/container";
import { Divider } from "@heroui/divider";
import { Image } from "@heroui/image";
import Link from "next/link";
import SignUpForm from "@/components/modules/auth/signup-form";
import { Metadata } from "next";
import SocialLogin from "@/components/modules/auth/social-login";

export const metadata: Metadata = {
  title: "Sign Up",
  description:
    "Join TechTips Hub to access the latest tips, insights, and tutorials. Sign up now to explore both free and premium content, stay updated with cutting-edge tech knowledge, and personalize your reading experience.",
  keywords:
    "TechTips Hub, sign up, register, create account, tech tips, tutorials, premium content, tech insights, tech community",
  openGraph: {
    title: "Sign Up",
    description:
      "Create an account at TechTips Hub to access exclusive tech tips, tutorials, and personalized content. Sign up for free or choose our premium plan for an enhanced experience.",
    url: "https://techtipshub.vercel.app/signup",
  },
};

const SignUpPage = () => {
  return (
    <section className="py-10 relative w-full overflow-hidden">
      <Container>
        <div className="w-full max-w-lg mx-auto mb-40 mt-2 lg:mb-40 lg:mt-10">
          <div className="space-y-4 flex flex-col items-center mb-8">
            <Link href="/">
              <Image
                className="size-14"
                src="/tech-tips-hub-logo.png"
                alt="tech-tips-hub-logo"
              />
            </Link>
            <div>
              <h2 className="text-center text-3xl font-bold">User Sign Up</h2>
            </div>
          </div>

          <SignUpForm />

          <SocialLogin />

          <Divider className="bg-default/50" />
          <div className="flex items-center justify-center mt-2 text-sm space-x-1 text-center">
            <span>Already have an account?</span>
            <Link className="text-primary hover:underline" href="/login">
              Login
            </Link>
          </div>
        </div>

        <div className="-z-50">
          <div className="absolute h-14 w-[600px] rotate-[45deg] rounded-3xl bg-purple-600 opacity-30  filter -bottom-5 lg:bottom-20 lg:-right-28 lg:block lg:h-10 lg:w-[600px] lg:opacity-20 xl:-right-40 xl:h-2 xl:w-[800px] xl:opacity-100 blur-2xl" />
          <div className="absolute  h-20 w-[600px] rotate-[45deg] rounded-3xl bg-primary-500 opacity-10  filter bottom-14  lg:bottom-32 lg:-right-28 lg:block lg:h-12 lg:w-[600px] lg:opacity-30  xl:-right-40 xl:h-4 xl:w-[700px] xl:opacity-100 blur-2xl" />
        </div>
      </Container>
    </section>
  );
};

export default SignUpPage;
