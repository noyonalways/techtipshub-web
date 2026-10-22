import Link from "next/link";

// Only real destinations. Inactive profiles are omitted rather than rendered
// as dead `href="#"` links or links to generic platform homepages.
const links = [
  { label: "Feed", href: "/" },
  { label: "About", href: "/about-us" },
  { label: "Premium", href: "/subscriptions" },
  { label: "Contact", href: "/contact-us" },
];

const legalLinks = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Cookies", href: "/cookie" },
];

const MiniFooter = () => {
  return (
    <div className="w-full space-y-5 rounded-xl border border-default/50 p-5">
      <div className="space-y-3">
        <h3 className="text-sm font-semibold">Links</h3>
        <ul className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm text-default-600">
          {links.map((link) => (
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
        <div className="flex flex-wrap gap-x-3 gap-y-1 border-t border-default/50 pt-4 text-xs text-default-500">
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
        <p className="text-xs text-default-500">
          &copy; {new Date().getFullYear()} TechTips Hub. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default MiniFooter;
