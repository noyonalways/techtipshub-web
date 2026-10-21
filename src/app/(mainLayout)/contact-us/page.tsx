import AdBanner from "@/components/adsense/ad-banner";
import ContactForm from "@/components/modules/contact/contact-form";
import Container from "@/components/ui/container";
import { Button } from "@nextui-org/button";
import { Card, CardBody, CardHeader } from "@nextui-org/card";
import { Metadata } from "next";
import { BiMapPin, BiPhone } from "react-icons/bi";
import { BsMailbox } from "react-icons/bs";
import { FiMessageCircle } from "react-icons/fi";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with the TechTips Hub team for any inquiries, feedback, or support. We’re here to assist you with all your tech-related queries.",
  keywords:
    "TechTips Hub, contact us, tech support, inquiries, feedback, tech questions, help",
  openGraph: {
    title: "Contact Us",
    description:
      "Have questions or need support? Contact the TechTips Hub team and let us help you with your tech-related inquiries.",
    url: "https://techtipshub.vercel.app/contact-us"
  },
};

interface IProps {}

const ContactUsPage: React.FC<IProps> = () => {
  return (
    <>
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-24 lg:py-32">
        <Container>
          <div className="flex flex-col md:flex-row items-center text-center lg:text-start lg:justify-between">
            <div className="mb-8 md:mb-0 md:mr-8">
              <h1 className="text-4xl font-bold mb-4">Get in Touch</h1>
              <p className="text-xl text-white dark:text-white">
                We're here to help and answer any question you might have.
              </p>
            </div>
            <Button
              className="flex items-center bg-white text-blue-800 rounded-full py-2 px-4"
              startContent={<FiMessageCircle size={20} />}
            >
              24/7 Support Available
            </Button>
          </div>
        </Container>
      </div>

      <Container>
        <div className="grid md:grid-cols-5 gap-8 w-full py-14">
          <Card className="md:col-span-3 bg-transparent" shadow="none">
            <CardHeader>
              <div className="flex flex-col">
                <h2 className="text-md text-xl font-semibold">Contact Form</h2>
                <p className="text-small text-default-500">
                  Fill out the form and we'll be in touch as soon as possible.
                </p>
              </div>
            </CardHeader>

            <CardBody>
              <ContactForm />
            </CardBody>
          </Card>

          <Card className="md:col-span-2 bg-transparent" shadow="none">
            <CardHeader>
              <h2 className="text-xl font-semibold">Contact Information</h2>
            </CardHeader>
            <CardBody className="space-y-6">
              <div className="flex items-start space-x-4">
                <BiMapPin className="text-primary mt-1" size={20} />
                <div>
                  <h3 className="font-semibold">Our Office</h3>
                  <p className="text-sm text-default-500">
                    123 Business Avenue, Suite 100
                  </p>
                  <p className="text-sm text-default-500">New York, NY 10001</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <BiPhone className="text-primary mt-1" size={20} />
                <div>
                  <h3 className="font-semibold">Phone</h3>
                  <p className="text-sm text-default-500">+1 (555) 123-4567</p>
                  <p className="text-sm text-default-500">
                    Mon-Fri, 9am-6pm EST
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <BsMailbox className="text-primary mt-1" size={20} />
                <div>
                  <h3 className="font-semibold">Email</h3>
                  <p className="text-sm text-default-500">
                    support@example.com
                  </p>
                  <p className="text-sm text-default-500">sales@example.com</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="pb-10">
          <AdBanner />
        </div>
      </Container>
    </>
  );
};

export default ContactUsPage;
