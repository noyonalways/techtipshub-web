export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "TechTipsHub",
  shortName: "TechTips",
  url: "https://techtipshub.vercel.app",
  tagline: "writing for builders",
  description:
    "Practical writing on web development, AI and the tools modern developers use: tutorials, explainers and honest tool comparisons.",
  navItems: [
    {
      label: "Feed",
      href: "/",
    },
    {
      label: "Features",
      href: "/features",
    },
    {
      label: "About",
      href: "/about",
    },
    {
      label: "Contact",
      href: "/contact",
    },
  ],
  navMenuItems: [
    {
      label: "Feed",
      href: "/",
    },
    {
      label: "Features",
      href: "/features",
    },
    {
      label: "About",
      href: "/about",
    },
    {
      label: "Contact",
      href: "/contact",
    },
  ],
  links: {
    github: "https://github.com/nextui-org/nextui",
    twitter: "https://twitter.com/getnextui",
    docs: "https://nextui.org",
    discord: "https://discord.gg/9b6yyZKmH4",
    sponsor: "https://patreon.com/jrgarciadev",
  },
};
