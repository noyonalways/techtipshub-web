import Container from "@/components/ui/container";
import { poppins } from "@/config/fonts";
import { Image } from "@heroui/image";
import Link from "next/link";
import { FaDiscord, FaFacebook, FaLinkedin, FaYoutube } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

interface IProps {}

const Footer: React.FC<IProps> = () => {
  return (
    <footer className="pt-10 border-t border-default/50 print:hidden">
      <Container>
        <div className="grid gird-cols-1 lg:grid-cols-4 gap-4 pb-8">
          <div className="space-y-4">
            <Link className="flex space-x-4 items-center" href={`/`}>
              <Image
                className="size-12"
                src="/tech-tips-hub-logo.png"
                alt="tech-tips-hub-logo"
              />
              <h2 className={`${poppins.className} text-lg font-bold`}>
                TechTips Hub
              </h2>
            </Link>
            <p className="text-default-500">
              Blogging made simple, loved by developers and teams.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Links</h3>
            <ul className="space-y-2 text-default-500">
              <li>
                <Link className="hover:underline" href="/">
                  Feed
                </Link>
              </li>
              <li>
                <Link className="hover:underline" href="/subscription">
                  Subscription
                </Link>
              </li>
              <li>
                <Link className="hover:underline" href="/about-us">
                  About
                </Link>
              </li>
              <li>
                <Link className="hover:underline" href="/contact">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Support</h3>
            <ul className="space-y-2 text-default-500">
              <li>
                <Link className="hover:underline" href="/">
                  Support Docs
                </Link>
              </li>
              <li>
                <Link className="hover:underline" href="/subscription">
                  Premium Support
                </Link>
              </li>
              <li>
                <Link className="hover:underline" href="/about-us">
                  Join Discord
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Connect with us</h3>
            <ul className="flex items-center space-x-4 text-lg text-default-600">
              <li>
                <a
                  className="p-2 border border-default-200 inline-block rounded-full hover:bg-default-100"
                  href="#"
                >
                  <FaLinkedin />
                </a>
              </li>
              <li>
                <a
                  className="p-2 border border-default-200 inline-block rounded-full hover:bg-default-100"
                  href="#"
                >
                  <FaXTwitter />
                </a>
              </li>
              <li>
                <a
                  className="p-2 border border-default-200 inline-block rounded-full hover:bg-default-100"
                  href="#"
                >
                  <FaDiscord />
                </a>
              </li>
              <li>
                <a
                  className="p-2 border border-default-200 inline-block rounded-full hover:bg-default-100"
                  href="#"
                >
                  <FaFacebook />
                </a>
              </li>
              <li>
                <a
                  className="p-2 border border-default-200 inline-block rounded-full hover:bg-default-100"
                  href="#"
                >
                  <FaYoutube />
                </a>
              </li>
            </ul>
          </div>
        </div>
      </Container>
      <div className="border-t border-default/50 py-5 bg-default-50">
        <Container>
          <div className="flex items-center justify-between ">
            <div className="flex space-x-2 text-xs">
              <Link className="hover:underline" href="/">
                Privacy
              </Link>
              <Link className="hover:underline" href="/">
                Terms
              </Link>
            </div>
            <p className="text-xs">
              &copy; {new Date().getFullYear()} TechTips Hub
            </p>
          </div>
        </Container>
      </div>
    </footer>
  );
};

export default Footer;
