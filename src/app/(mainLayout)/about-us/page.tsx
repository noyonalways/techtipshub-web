import AdBanner from "@/components/adsense/ad-banner";
import Container from "@/components/ui/container";
import { Avatar } from "@nextui-org/avatar";
import { Button } from "@nextui-org/button";
import { Card, CardBody, CardHeader } from "@nextui-org/card";
import { Metadata } from "next";
import Link from "next/link";
import {
  BiBookOpen,
  BiChevronRight,
  BiMailSend,
  BiMessageSquare,
  BiUserPlus,
} from "react-icons/bi";
import { BsEye } from "react-icons/bs";
import { FaThumbsUp } from "react-icons/fa";
import { FaUserShield } from "react-icons/fa6";
import { FiZap } from "react-icons/fi";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn more about TechTips Hub, your go-to source for the latest tech tips, tutorials, and expert insights. Discover our mission and meet the team behind the content.",
  keywords:
    "TechTips Hub, about us, tech blog, tutorials, expert insights, technology, mission, team",
  openGraph: {
    title: "About Us",
    description:
      "Get to know TechTips Hub and our mission to provide valuable tech tips and insights. Meet the team that helps you stay updated with the latest in technology.",
    url: "https://techtipshub.vercel.app/about-us",
  }
};

interface IProps {}

const AboutUs: React.FC<IProps> = () => {
  const features = [
    {
      icon: <BiBookOpen className="w-6 h-6" />,
      title: "Premium Content",
      description: "Access exclusive tech insights",
    },
    {
      icon: <FaUserShield className="w-6 h-6" />,
      title: "Community",
      description: "Connect with tech enthusiasts",
    },
    {
      icon: <FaThumbsUp className="w-6 h-6" />,
      title: "Interactive",
      description: "Engage through votes and comments",
    },
    {
      icon: <BiMessageSquare className="w-6 h-6" />,
      title: "Discussions",
      description: "Participate in threaded conversations",
    },
    {
      icon: <BsEye className="w-6 h-6" />,
      title: "Analytics",
      description: "Track your content's performance",
    },
    {
      icon: <BiUserPlus className="w-6 h-6" />,
      title: "Secure",
      description: "Robust user authentication",
    },
  ];

  const stats = [
    { label: "Active Users", value: "100K+" },
    { label: "Articles Published", value: "50K+" },
    { label: "Monthly Views", value: "5M+" },
    { label: "Expert Contributors", value: "1K+" },
  ];

  const testimonials = [
    {
      name: "Alex Chen",
      role: "Software Engineer",
      content:
        "TechTips Hub has become my go-to platform for staying updated with the latest in tech. The quality of content and community engagement is unparalleled.",
    },
    {
      name: "Sarah Johnson",
      role: "UX Designer",
      content:
        "As a contributor, I love how TechTips Hub allows me to share my knowledge and connect with other professionals. It's more than just a blogging platform; it's a vibrant tech ecosystem.",
    },
  ];

  return (
    <div>
      <div className="relative bg-gradient-to-r from-blue-600 to-indigo-800 py-20 lg:py-40 text-white mb-20">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-snug">
              Empowering Tech Enthusiasts Worldwide
            </h1>
            <p className="text-xl mb-8 text-white dark:text-white">
              TechTips Hub: Where Innovation Meets Community
            </p>
            <Button
              href="/login"
              as={Link}
              radius="sm"
              color="primary"
              size="lg"
              endContent={<BiChevronRight />}
              className="font-semibold bg-white text-blue-600 hover:bg-blue-50"
            >
              Join Our Community
            </Button>
          </div>
        </div>
      </div>

      <>
        <Container>
          <div className="mb-20">
            <h2 className="text-3xl font-bold mb-6 text-center">Who We Are</h2>
            <p className="text-base lg:text-lg text-default-500 mb-12 leading-relaxed max-w-4xl mx-auto text-center">
              TechTips Hub is the premier destination for tech enthusiasts to
              explore, learn, and contribute to the ever-evolving world of
              technology. Our platform combines cutting-edge blogging
              capabilities with robust community features, creating a unique
              space where knowledge sharing and networking converge.
            </p>
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="p-6">
                <CardHeader>
                  <h3 className="text-2xl font-bold text-blue-600">
                    Our Mission
                  </h3>
                </CardHeader>
                <CardBody>
                  <p className="text-default-500">
                    To democratize tech knowledge by providing a dynamic
                    platform that fosters learning, collaboration, and
                    innovation among tech enthusiasts of all levels.
                  </p>
                </CardBody>
              </Card>
              <Card className="p-6">
                <CardHeader>
                  <h3 className="text-2xl font-bold text-blue-600">
                    Our Vision
                  </h3>
                </CardHeader>
                <CardBody>
                  <p className="text-default-500">
                    To become the global hub for technology insights, driving
                    innovation and connecting minds across the digital
                    landscape.
                  </p>
                </CardBody>
              </Card>
            </div>
          </div>
        </Container>

        <Container>
          <div className="mb-20 bg-blue-50 dark:bg-blue-100/20 py-16 px-4 rounded-2xl">
            <h2 className="text-3xl font-bold mb-10 text-center">
              Platform Impact
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <p className="text-4xl font-bold text-blue-600 mb-2">
                    {stat.value}
                  </p>
                  <p className="text-default-500 dark:text-default-600">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Container>

        <Container>
          <div className="mb-20">
            <h2 className="text-3xl font-bold mb-10 text-center">
              Key Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card key={index} shadow="none" className="shadow">
                  <CardBody className="flex flex-col items-center text-center p-6">
                    <div className="bg-blue-100 dark:bg-blue-100/20 p-3 rounded-full mb-4">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-semibold mb-2">
                      {feature.title}
                    </h3>
                    <p>{feature.description}</p>
                  </CardBody>
                </Card>
              ))}
            </div>
          </div>
        </Container>

        <Container>
          <div className="mb-20">
            <h2 className="text-3xl font-bold mb-10 text-center">
              What Our Users Say
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              {testimonials.map((testimonial, index) => (
                <Card key={index}>
                  <CardBody className="p-6">
                    <p className="mb-4 italic">"{testimonial.content}"</p>
                    <div className="flex items-center">
                      <Avatar
                        src={`/placeholder.svg?height=40&width=40`}
                        size="sm"
                        className="mr-4"
                      />
                      <div>
                        <p className="font-semibold">{testimonial.name}</p>
                        <p className="text-sm">{testimonial.role}</p>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          </div>
        </Container>

        <Container>
          <div className="text-center mb-10 bg-gradient-to-r from-blue-500 to-indigo-600 py-16 px-4 rounded-2xl text-white">
            <h2 className="text-3xl font-bold mb-6">Join Our Tech Community</h2>
            <p className="text-lg lg:text-xl mb-8 max-w-2xl mx-auto text-white dark:text-white">
              Be part of a thriving ecosystem of tech enthusiasts. Share your
              knowledge, learn from experts, and stay at the forefront of
              technological advancements.
            </p>
            <div className="flex justify-center gap-4">
              <Button
                href="/signup"
                as={Link}
                radius="sm"
                color="primary"
                endContent={<FiZap />}
                className="font-semibold bg-white text-blue-600 hover:bg-blue-50"
              >
                Sign Up Now
              </Button>
              <Button
                href="/contact-us"
                as={Link}
                radius="sm"
                variant="bordered"
                endContent={<BiMailSend />}
                className="font-semibold text-white border-white hover:bg-blue-700"
              >
                Contact Us
              </Button>
            </div>
          </div>
        </Container>

        <Container>
          <div className="mb-10 mt-6">
            <AdBanner />
          </div>
        </Container>
      </>
    </div>
  );
};

export default AboutUs;
