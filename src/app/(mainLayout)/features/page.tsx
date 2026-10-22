import AdBanner from "@/components/adsense/ad-banner";
import Container from "@/components/ui/container";
import { poppins } from "@/config/fonts";
import { Button } from "@heroui/button";
import { Metadata } from "next";
import { FaCheckCircle, FaLightbulb, FaRocket, FaUsers, FaPen } from "react-icons/fa";

export const metadata: Metadata = {
  title: "Features Page",
  description:
    "Join our thriving tech community at TechTips Hub. Share your knowledge, learn from experts, and become part of a growing network of tech enthusiasts.",
  keywords:
    "TechTips Hub, tech community, tech writing, knowledge sharing, tech tutorials, learning platform",
  openGraph: {
    title: "Join TechTips Hub Community",
    description:
      "Share your tech knowledge, learn from experts, and become part of our growing community. Start your tech writing journey today!",
    url: "https://techtipshub.vercel.app/join-community",
  },
};

interface IProps {}

const CommunityPage: React.FC<IProps> = () => {
  return (
    <section
      className={`pt-10 pb-20 lg:py-20 bg-[url("/bg-box-design.png")] overflow-hidden relative`}
    >
      <Container>
        <div className="space-y-10">
          <div className="text-center space-y-6">
            <h1
              className={`${poppins.className} text-3xl lg:text-6xl text-center font-bold w-full max-w-4xl mx-auto lg:leading-snug`}
            >
              Share Your Tech Knowledge with{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#e097ff] to-secondary dark:bg-clip-text dark:bg-gradient-to-r dark:from-primary dark:to-secondary dark:text-transparent">
                TechTips Hub
              </span>
            </h1>
            <p className="w-full max-w-2xl mx-auto text-xl leading-snug">
              &quot;Join our community of tech enthusiasts where you can share your
              expertise, learn from others, and build your tech writing
              portfolio!&quot;
            </p>
            <div className="flex flex-col md:flex-row gap-3 md:gap-4 justify-center">
              <Button
                radius="full"
                color="secondary"
                href="/signup"
                className="text-base md:text-lg md:px-8 md:py-6"
                startContent={<FaPen className="text-xl" />}
              >
                Start Writing Today
              </Button>
              <Button
                radius="full"
                color="primary"
                variant="bordered"
                href="/"
                className="text-base md:text-lg md:px-8 md:py-6"
                startContent={<FaRocket className="text-xl" />}
              >
                Explore Articles
              </Button>
            </div>
          </div>

          <div>
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold mb-4">
                Why Join Our Community?
              </h2>
              <p className="text-default-500">
                Share knowledge, build your portfolio, and connect with fellow
                tech enthusiasts
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full max-w-6xl mx-auto items-stretch">
              <div className="border border-primary-50 p-6 rounded-lg shadow-sm flex flex-col space-y-6 hover:scale-105 transition-transform duration-300">
                <div className="space-y-4 flex-1">
                  <div className="flex justify-center">
                    <FaPen className="text-4xl text-primary" />
                  </div>
                  <h3 className="text-2xl font-semibold text-center">
                    Write & Share
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-center">
                      <FaCheckCircle className="text-green-500 mr-2" />
                      Build your tech portfolio
                    </li>
                    <li className="flex items-center">
                      <FaCheckCircle className="text-green-500 mr-2" />
                      Share your expertise
                    </li>
                    <li className="flex items-center">
                      <FaCheckCircle className="text-green-500 mr-2" />
                      Help others learn
                    </li>
                  </ul>
                </div>
              </div>

              <div className="border border-primary-50 p-6 rounded-lg shadow-sm flex flex-col space-y-6 hover:scale-105 transition-transform duration-300 bg-gradient-to-b from-primary/5 to-transparent">
                <div className="space-y-4 flex-1">
                  <div className="flex justify-center">
                    <FaUsers className="text-4xl text-secondary" />
                  </div>
                  <h3 className="text-2xl font-semibold text-center">
                    Community Benefits
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-center">
                      <FaCheckCircle className="text-green-500 mr-2" />
                      Network with experts
                    </li>
                    <li className="flex items-center">
                      <FaCheckCircle className="text-green-500 mr-2" />
                      Get feedback on articles
                    </li>
                    <li className="flex items-center">
                      <FaCheckCircle className="text-green-500 mr-2" />
                      Collaborate on content
                    </li>
                    <li className="flex items-center">
                      <FaCheckCircle className="text-green-500 mr-2" />
                      Build your reputation
                    </li>
                  </ul>
                </div>
              </div>

              <div className="border border-primary-50 p-6 rounded-lg shadow-sm flex flex-col space-y-6 hover:scale-105 transition-transform duration-300">
                <div className="space-y-4 flex-1">
                  <div className="flex justify-center">
                    <FaLightbulb className="text-4xl text-primary" />
                  </div>
                  <h3 className="text-2xl font-semibold text-center">
                    Growth Opportunities
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-center">
                      <FaCheckCircle className="text-green-500 mr-2" />
                      Improve writing skills
                    </li>
                    <li className="flex items-center">
                      <FaCheckCircle className="text-green-500 mr-2" />
                      Learn from feedback
                    </li>
                    <li className="flex items-center">
                      <FaCheckCircle className="text-green-500 mr-2" />
                      Showcase expertise
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="my-16">
              <AdBanner />
            </div>

            <div className="text-center mt-16 space-y-6">
              <h3 className="text-2xl font-bold">
                Ready to Share Your Knowledge?
              </h3>
              <p className="text-default-500 max-w-2xl mx-auto">
                Join our community today and start sharing your tech insights
                with thousands of readers. Your expertise matters!
              </p>
              <Button
                href="/signup"
                color="secondary"
                size="lg"
                className="text-lg px-8"
                radius="sm"
                startContent={<FaUsers />}
              >
                Join Our Community
              </Button>
            </div>
          </div>
        </div>
      </Container>

      {/* Keep existing background effects */}
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

export default CommunityPage; 