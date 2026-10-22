import LegalPage, { type ILegalSection } from "@/components/legal/legal-page";
import { legalConfig } from "@/config/legal";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Disclaimer",
  description:
    "The limits of the technical information, code samples and advertising published on TechTips Hub.",
  alternates: { canonical: "/disclaimer" },
  openGraph: {
    title: "Disclaimer",
    description:
      "The limits of the technical information, code samples and advertising published on TechTips Hub.",
    url: "/disclaimer",
  },
};

const sections: ILegalSection[] = [
  {
    id: "general",
    title: "General information only",
    content: (
      <>
        <p>
          The content on TechTips Hub is published for general information and
          education. It is written in good faith and based on the authors&rsquo;
          experience, but it is not tailored to your project, infrastructure,
          legal position or skill level.
        </p>
        <p>
          You are responsible for how you apply anything you read here. Always
          review code and configuration in your own environment, keep backups,
          and test in a staging environment before using it in production.
        </p>
      </>
    ),
  },
  {
    id: "professional-advice",
    title: "Not professional advice",
    content: (
      <>
        <p>
          Nothing on this site is legal, financial, tax, medical or other
          professional advice, and nothing creates a professional relationship.
          Articles about security, privacy, licensing, contracts or compliance
          describe engineering practice, not a legal opinion for your situation.
        </p>
        <p>
          For decisions with legal or financial consequences, consult a
          qualified professional in your jurisdiction.
        </p>
      </>
    ),
  },
  {
    id: "code-samples",
    title: "Code samples and tutorials",
    content: (
      <>
        <p>
          Code samples are illustrative. They are usually simplified to make one
          idea clear and may omit error handling, validation, logging,
          accessibility or security controls that a real application needs.
          Copying a snippet does not make it production-ready.
        </p>
        <p>
          We do not warrant that a sample is complete, correct for your version
          of a library, or free of defects. Third-party packages, APIs and cloud
          services change without notice, so a tutorial that worked when
          published may need adaptation later. We are not liable for loss,
          downtime, data damage or security incidents resulting from the use of
          a sample.
        </p>
      </>
    ),
  },
  {
    id: "accuracy",
    title: "Accuracy and corrections",
    content: (
      <>
        <p>
          We try to be accurate and to date articles when a tool changes
          materially. Even so, we cannot guarantee that everything is complete,
          current or free of mistakes. Benchmarks and comparisons are specific
          to the setup that produced them and should not be read as universal
          results.
        </p>
        <p>
          If you find an error, email{" "}
          <a href={`mailto:${legalConfig.contactEmail}`}>
            {legalConfig.contactEmail}
          </a>
          . We will verify it and, where appropriate, correct the article and
          note the change. Corrections are made on the article rather than
          quietly removed.
        </p>
      </>
    ),
  },
  {
    id: "external-links",
    title: "External links",
    content: (
      <>
        <p>
          Articles link to external websites, repositories, documentation and
          tools. Those resources are outside our control and we are not
          responsible for their content, accuracy, availability or security.
          Linking to a resource is not an endorsement of everything it contains.
        </p>
        <p>
          If a link is broken or points to something harmful, please tell us so
          we can update it.
        </p>
      </>
    ),
  },
  {
    id: "advertising",
    title: "Advertising and sponsorship",
    content: (
      <>
        <p>
          The site is funded partly by advertising served through Google
          AdSense. Ads are selected by Google, not by our editorial team, and do
          not constitute a recommendation. Sponsored articles and paid
          placements are labelled as such.
        </p>
        <p>
          If we use affiliate links in future, the relevant article will say so
          clearly and the disclosure will appear close to the link. Commercial
          relationships never determine our technical conclusions.
        </p>
      </>
    ),
  },
  {
    id: "user-content",
    title: "Content from the community",
    content: (
      <>
        <p>
          Registered users can publish articles and comments. Those views belong
          to their authors and are not reviewed by us for correctness before
          publication. We moderate for compliance with our{" "}
          <Link href="/community-guidelines">Community Guidelines</Link>, not for
          technical accuracy.
        </p>
        <p>
          If a community post contains an error, treat it with the same
          scepticism you would apply to any code you find online, and verify it
          against primary documentation.
        </p>
      </>
    ),
  },
  {
    id: "no-warranty",
    title: "No warranty and limitation",
    content: (
      <>
        <p>
          To the fullest extent permitted by law, the site and its content are
          provided &ldquo;as is&rdquo; without warranties of any kind, whether
          express or implied, including accuracy, fitness for a particular
          purpose, title and non-infringement.
        </p>
        <p>
          Our liability is limited as described in the{" "}
          <Link href="/terms">Terms and Conditions</Link>. Some jurisdictions do
          not allow certain exclusions, so parts of this disclaimer may not
          apply to you. Where they do not apply, our liability is limited to the
          smallest amount the law allows.
        </p>
      </>
    ),
  },
  {
    id: "contact",
    title: "Contact",
    content: (
      <>
        <p>
          Corrections, concerns or questions about this disclaimer can be sent
          to{" "}
          <a href={`mailto:${legalConfig.contactEmail}`}>
            {legalConfig.contactEmail}
          </a>{" "}
          or through the <Link href="/contact-us">contact form</Link>.
        </p>
      </>
    ),
  },
];

const DisclaimerPage = () => {
  return (
    <LegalPage
      currentHref="/disclaimer"
      sections={sections}
      summary="What our technical writing can and cannot be relied on for, how corrections work, and where responsibility sits when you apply a tutorial."
      title="Disclaimer"
    />
  );
};

export default DisclaimerPage;
