import SuspendedLoginForm from "@/components/modules/auth/login-form";
import SocialLogin from "@/components/modules/auth/social-login";
import Container from "@/components/ui/container";
import { Divider } from "@heroui/divider";
import { Image } from "@heroui/image";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Login",
  description:
    "Log in to TechTips Hub to access personalized content and manage your account. Stay updated with the latest tech insights.",
  openGraph: {
    url: "https://techtipshub.vercel.app/login",
    title: "Login",
    description:
      "Access your TechTips Hub account for personalized content and latest updates.",
  },
};

interface IProps {}

const LoginPage: React.FC<IProps> = () => {
  return (
    <section className="py-10 relative w-full overflow-hidden">
      <Container>
        <div className="w-full max-w-lg mx-auto mb-40 mt-10 lg:mb-40 lg:mt-10">
          <div className="space-y-4 flex flex-col items-center mb-8">
            <Link href="/">
              <Image
                className="size-14"
                src="/tech-tips-hub-logo.png"
                alt="tech-tips-hub-logo"
              />
            </Link>
            <div>
              <h2 className="text-center text-3xl font-bold">User Login</h2>
            </div>
          </div>

          <SuspendedLoginForm />
          <div className="text-center mt-2 pb-4">
            <Link
              href="/forget-password"
              className="text-primary hover:underline"
            >
              Forgotten Password?
            </Link>
          </div>

          <SocialLogin />


          <Divider className="bg-default/50" />
          <div className="flex items-center justify-center mt-4 text-sm space-x-1 text-center">
            <span>Don&apos;t have an account?</span>
            <Link className="text-primary hover:underline" href="/signup">
              Sign Up
            </Link>
          </div>
        </div>

        <div className="-z-50 hidden md:block">
          <div className="absolute h-14 w-[600px] rotate-[45deg] rounded-3xl bg-purple-600 opacity-30  filter -bottom-5 lg:bottom-20 lg:-right-28 lg:block lg:h-10 lg:w-[600px] lg:opacity-20 xl:-right-40 xl:h-2 xl:w-[800px] xl:opacity-100 blur-2xl" />
          <div className="absolute  h-20 w-[600px] rotate-[45deg] rounded-3xl bg-primary-500 opacity-10  filter bottom-14  lg:bottom-32 lg:-right-28 lg:block lg:h-12 lg:w-[600px] lg:opacity-30  xl:-right-40 xl:h-4 xl:w-[700px] xl:opacity-100 blur-2xl" />
        </div>
      </Container>
    </section>
  );
};

export default LoginPage;
