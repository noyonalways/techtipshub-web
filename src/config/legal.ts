/**
 * Single source of truth for the public legal documents.
 *
 * Everything here is shown to visitors, so update the `lastUpdated` pair
 * whenever a policy changes materially. `lastUpdated` is the machine-readable
 * value used by `<time dateTime="…">`; `lastUpdatedLabel` is what readers see.
 */
export const legalConfig = {
  operator: "TechTips Hub",
  siteUrl: "https://techtipshub.vercel.app",
  contactEmail:
    process.env.NEXT_PUBLIC_CONTACT_EMAIL || "noyonrahman2003@gmail.com",
  /**
   * Legal entity behind the site. AdSense and data-protection law require a
   * named entity, so this must be filled in before the policies are relied
   * upon. It is rendered verbatim, brackets included, so the placeholder is
   * obvious on the page rather than quietly wrong.
   */
  legalEntity: "[YOUR COMPANY NAME]",
  /** Registered address / jurisdiction of the legal entity. */
  legalAddress: "[YOUR REGISTERED ADDRESS]",
  lastUpdated: "2026-10-22",
  lastUpdatedLabel: "22 October 2026",
  /** Minimum age for an account, in years. */
  minimumAge: 13,
  governingLaw: "the laws of the People's Republic of Bangladesh",
} as const;

export interface ILegalPageLink {
  label: string;
  href: string;
  title: string;
  description: string;
}

/**
 * Order matters: it drives the footer columns, the cross-links at the end of
 * each document, and the "all policies" navigation.
 */
export const legalPages: ILegalPageLink[] = [
  {
    label: "Privacy Policy",
    href: "/privacy",
    title: "Privacy Policy",
    description:
      "What we collect, why we collect it, and the choices you have over your data.",
  },
  {
    label: "Terms and Conditions",
    href: "/terms",
    title: "Terms and Conditions",
    description:
      "The rules for using TechTips Hub, publishing content and commenting.",
  },
  {
    label: "Cookie Policy",
    href: "/cookie",
    title: "Cookie Policy",
    description:
      "The cookies and similar technologies this site uses, and how to control them.",
  },
  {
    label: "Refund Policy",
    href: "/refund-policy",
    title: "Refund and Cancellation Policy",
    description:
      "How accidental donations and payments are reviewed and refunded. Nothing on the site requires payment.",
  },
  {
    label: "Disclaimer",
    href: "/disclaimer",
    title: "Disclaimer",
    description:
      "The limits of the technical advice, code samples and advertising we publish.",
  },
  {
    label: "Community Guidelines",
    href: "/community-guidelines",
    title: "Community Guidelines",
    description:
      "What is welcome in posts and comments, and how moderation works.",
  },
];
