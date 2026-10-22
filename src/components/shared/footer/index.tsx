import Container from "@/components/ui/container";
import { poppins } from "@/config/fonts";
import { Image } from "@heroui/image";
import Link from "next/link";

const siteLinks = [
  { label: "Feed", href: "/" },
  { label: "Premium", href: "/subscriptions" },
  { label: "About", href: "/about-us" },
  { label: "Contact", href: "/contact-us" },
];

const supportLinks = [
  { label: "About the platform", href: "/about-us" },
  { label: "Membership", href: "/subscriptions" },
  { label: "Contact us", href: "/contact-us" },
];

const legalLinks = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Cookie Policy", href: "/cookie" },
];

const Footer = () => {
  return (
    <footer className="border-t border-default/50 pt-10 print:hidden">
      <Container>
        <div className="grid grid-cols-1 gap-8 pb-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <Link className="flex items-center gap-3" href="/">
              <Image
                className="size-10"
                src="/tech-tips-hub-logo.png"
                alt="TechTips Hub"
              />
              <h2 className={`${poppins.className} text-lg font-bold`}>
                TechTips Hub
              </h2>
            </Link>
            <p className="text-sm text-default-500">
              Practical writing on web development, AI and the tools modern
              developers use every day.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Links</h3>
            <ul className="space-y-2 text-sm text-default-500">
              {siteLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    className="hover:text-foreground hover:underline"
                    href={link.href}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Support</h3>
            <ul className="space-y-2 text-sm text-default-500">
              {supportLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    className="hover:text-foreground hover:underline"
                    href={link.href}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Legal</h3>
            <ul className="space-y-2 text-sm text-default-500">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    className="hover:text-foreground hover:underline"
                    href={link.href}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>

      <div className="border-t border-default/50 bg-default-50 py-5">
        <Container>
          <div className="flex flex-col gap-3 text-xs text-default-500 sm:flex-row sm:items-center sm:justify-between">
            <p>
              &copy; {new Date().getFullYear()} TechTips Hub. All rights
              reserved.
            </p>
            <div className="flex flex-wrap gap-4">
              {legalLinks.map((link) => (
                <Link
                  key={link.href}
                  className="hover:text-foreground hover:underline"
                  href={link.href}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </Container>
      </div>
    </footer>
  );
};

export default Footer;
