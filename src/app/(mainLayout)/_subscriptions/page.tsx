import Container from "@/components/ui/container";
import SubscribeButton from "@/components/ui/subscribe-button";
import { poppins } from "@/config/fonts";
import { Button } from "@heroui/button";
import { Metadata } from "next";
import Link from "next/link";
import { FaCheckCircle } from "react-icons/fa";
import { MdRocketLaunch } from "react-icons/md";



export const metadata: Metadata = {
  title: "Subscription Plans",
  description:
    "Explore our subscription plans at TechTips Hub. Choose between free and premium options to unlock advanced features, analytics, and premium content for an enhanced tech reading experience.",
  keywords:
    "TechTips Hub, subscription plans, premium, free plan, blog subscription, analytics, advanced features, premium content",
  openGraph: {
    title: "Subscription Plans",
    description:
      "Unlock premium features, detailed analytics, and exclusive content with our subscription plans. Explore both free and premium options at TechTips Hub.",
    url: "https://techtipshub.vercel.app/subscription",
  },
};

interface IProps {}

const SubscriptionPage: React.FC<IProps> = () => {
  return (
    <section
      className={`pt-10 pb-20 lg:py-20 bg-[url("https://cdn.hashnode.com/res/hashnode/image/upload/v1681184891207/QgfWPdgYD.png?auto=compress&auto=compress,format&format=webp")] overflow-hidden relative`}
    >
      <Container>
        <div className="space-y-10">
          <div className="text-center space-y-6">
            <h1
              className={`${poppins.className} text-3xl lg:text-6xl text-center font-bold w-full max-w-5xl mx-auto lg:leading-snug`}
            >
              Enhance Your Content Creation with{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#e097ff] to-secondary dark:bg-clip-text dark:bg-gradient-to-r dark:from-primary dark:to-secondary dark:text-transparent">
                TechTips Hub Pro
              </span>
            </h1>
            <p className="w-full max-w-2xl mx-auto text-xl leading-snug">
              &quot;Unlock premium features designed to enhance your writing journey
              - from brainstorming ideas to publishing your best work.&quot;
            </p>
            <SubscribeButton
              radius="full"
              color="primary"
              startContent={<MdRocketLaunch />}
            >
              Get Pro Today
            </SubscribeButton>
          </div>

          <div>
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold mb-4">Choose Your Plan</h2>
              <p className="text-default-500">
                Select a plan that best fits your reading needs.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full max-w-3xl mx-auto items-stretch">
              <>
                <div className="border border-primary-50 p-6 rounded-lg shadow-sm flex flex-col space-y-6">
                  <div className="space-y-4 flex-1">
                    <h3 className="text-2xl font-semibold  text-center">
                      Free Plan
                    </h3>
                    <p className="text-center text-default-500">
                      Access free blog posts with limited features.
                    </p>

                    <ul className="space-y-3">
                      <li className="flex items-center">
                        <FaCheckCircle className="text-green-500 mr-2" />
                        Access to free blogs only
                      </li>
                      <li className="flex items-center">
                        <FaCheckCircle className="text-green-500 mr-2" />
                        Basic support
                      </li>
                      <li className="flex items-center">
                        <FaCheckCircle className="text-green-500 mr-2" />
                        Limited content library
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <div className="text-center">
                      <span className="text-3xl font-bold">Free</span>
                    </div>

                    <Link href="/">
                      <Button
                        radius="sm"
                        color="primary"
                        variant="flat"
                        className="w-full"
                      >
                        Get Started
                      </Button>
                    </Link>
                  </div>
                </div>
              </>

              <>
                <div className="border border-primary-50 p-6 rounded-lg shadow-sm flex flex-col space-y-6">
                  <div className="space-y-4 flex-1">
                    <h3 className="text-2xl font-semibold  text-center">
                      Premium Plan
                    </h3>
                    <p className="text-center text-default-500 ">
                      Enjoy unlimited access and exclusive features for just
                      $20/month.
                    </p>

                    <ul className="space-y-3">
                      <li className="flex items-center">
                        <FaCheckCircle className="text-green-500 mr-2" />
                        Access to all free & premium blogs
                      </li>
                      <li className="flex items-center">
                        <FaCheckCircle className="text-green-500 mr-2" />
                        Priority support
                      </li>
                      <li className="flex items-center">
                        <FaCheckCircle className="text-green-500 mr-2" />
                        Advanced content analytics
                      </li>
                      <li className="flex items-center">
                        <FaCheckCircle className="text-green-500 mr-2" />
                        Exclusive premium content
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <div className="text-center">
                      <span className="text-3xl font-bold">$20</span>
                      <span className="text-default-400">/month</span>
                    </div>

                    <SubscribeButton
                      className="w-full"
                      radius="sm"
                      color="secondary"
                    >
                      Get Premium
                    </SubscribeButton>
                  </div>
                </div>
              </>
            </div>
          </div>
        </div>
      </Container>

      <div className="absolute right-[28%] top-0 hidden h-[150px] w-[200px] rotate-12 rounded-3xl bg-gradient-to-l from-violet-600 to-indigo-800 opacity-20 blur-3xl filter dark:block dark:opacity-20 lg:top-44 lg:-right-20 lg:h-72 lg:w-[350px] xl:h-80 xl:w-[500px] animate-scaleEffect duration-300" />
      <div className="absolute bottom-44 -left-64 hidden h-[150px] w-[900px] -rotate-45 rounded-3xl bg-gradient-to-r from-violet-600 to-indigo-800 opacity-30 blur-3xl filter dark:hidden dark:sm:block lg:bottom-24 lg:-left-20 lg:h-28 lg:w-[250px] lg:-rotate-12 lg:opacity-20 xl:h-40 xl:w-[400px] animate-scaleEffect duration-300" />
      <div className="absolute left-[28%] top-28 hidden rotate-12 rounded-3xl bg-sky-700/80 opacity-90 blur-3xl filter dark:opacity-30 lg:h-32 lg:w-[450px] dark:lg:block xl:h-44 xl:w-[600px] animate-scaleEffect duration-300" />
      <div className="absolute h-16 w-[600px] rotate-[-40deg] rounded-3xl bg-sky-400 opacity-10 blur-2xl filter dark:hidden lg:bottom-24 lg:-left-28 lg:h-12 lg:w-[600px] lg:opacity-30 lg:blur-2xl xl:-left-40 xl:h-4 xl:w-[700px] xl:opacity-100" />
      <div className="absolute h-14 w-[600px] rotate-[-40deg] rounded-3xl bg-purple-400 opacity-30 blur-2xl filter dark:hidden lg:bottom-20 lg:-left-28 lg:h-10 lg:w-[600px] lg:opacity-20 lg:blur-xl xl:-left-40 xl:h-2 xl:w-[800px] xl:opacity-100" />
      <div className="absolute hidden h-16 w-[600px] rotate-[-40deg] rounded-3xl bg-sky-400 opacity-10 blur-2xl filter dark:hidden lg:top-24 lg:-right-28 lg:block lg:h-12 lg:w-[600px] lg:opacity-30 lg:blur-2xl xl:-right-40 xl:h-4 xl:w-[700px] xl:opacity-100" />
      <div className="absolute hidden h-14 w-[600px] rotate-[-40deg] rounded-3xl bg-purple-400 opacity-30 blur-2xl filter dark:hidden lg:top-20 lg:-right-28 lg:block lg:h-10 lg:w-[600px] lg:opacity-20 lg:blur-xl xl:-right-40 xl:h-2 xl:w-[800px] xl:opacity-100" />
    </section>
  );
};

export default SubscriptionPage;
