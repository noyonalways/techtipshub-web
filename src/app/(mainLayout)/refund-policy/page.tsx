import LegalPage, { type ILegalSection } from "@/components/legal/legal-page";
import { legalConfig } from "@/config/legal";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Refund and Cancellation Policy",
  description:
    "TechTipsHub is free to use and sells nothing. How to report a charge made in error, and how we handle refunds.",
  alternates: { canonical: "/refund-policy" },
  openGraph: {
    title: "Refund and Cancellation Policy",
    description:
      "TechTipsHub is free to use and sells nothing. How to report a charge made in error.",
    url: "/refund-policy",
  },
};

const sections: ILegalSection[] = [
  {
    id: "overview",
    title: "Scope",
    content: (
      <>
        <p>
          TechTipsHub is free. There are no memberships, upgrades or paid tiers,
          so nothing on this site is sold and no payment is ever required to
          read, comment, vote, follow or publish. Every account has the same
          abilities.
        </p>
        <p>
          This policy explains how we respond if you believe a charge connected
          to TechTipsHub was taken in error. It is part of our{" "}
          <Link href="/terms">Terms and Conditions</Link> and does not reduce
          consumer rights that apply where you live.
        </p>
      </>
    ),
  },
  {
    id: "no-payments",
    title: "We never ask for payment details",
    content: (
      <>
        <ul>
          <li>
            We do not have a checkout, a subscription page or a payment provider
            integrated into the site.
          </li>
          <li>
            We will never email or message you asking for card, wallet or bank
            details, and we do not store any.
          </li>
          <li>
            If you are asked to pay to unlock content on a site using our name or
            branding, it is not us. Do not pay, and please{" "}
            <Link href="/contact">tell us about it</Link>.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "refunds",
    title: "Charges made in error",
    content: (
      <>
        <p>
          If a charge you believe relates to TechTipsHub was taken in error, you
          are entitled to a full refund. This includes, for example:
        </p>
        <ul>
          <li>an amount taken from a site impersonating TechTipsHub;</li>
          <li>
            a duplicate or unexpected charge from an earlier paid offering that
            we can verify against our records; or
          </li>
          <li>
            a charge you did not authorise, including unauthorised use of your
            account.
          </li>
        </ul>
        <p>
          Because we no longer sell anything, any balance that still shows a paid
          membership is inactive; access to every feature depends only on being
          signed in, not on having paid.
        </p>
      </>
    ),
  },
  {
    id: "request",
    title: "How to report a charge",
    content: (
      <>
        <p>
          Email{" "}
          <a href={`mailto:${legalConfig.contactEmail}`}>
            {legalConfig.contactEmail}
          </a>{" "}
          from the address on your account, or use the{" "}
          <Link href="/contact">contact form</Link>, and include:
        </p>
        <ul>
          <li>your username and account email;</li>
          <li>the transaction identifier from the receipt you received;</li>
          <li>the date and amount of the payment; and</li>
          <li>what you expected to buy, if anything.</li>
        </ul>
        <p>
          We acknowledge reports within 3 business days and aim to decide within
          10 business days. If the charge came from us, the refund is returned to
          the original payment method and your bank or wallet provider may take a
          further 5 to 10 business days to post it. We cannot refund to a
          different card or account.
        </p>
        <p>
          We may ask for information needed to verify a payment or prevent fraud.
          Refusing reasonable verification may delay the investigation.
        </p>
      </>
    ),
  },
  {
    id: "chargebacks",
    title: "Chargebacks",
    content: (
      <>
        <p>
          Please contact us before asking your bank or card provider to reverse a
          charge, so we can look into it directly. If a chargeback is opened while
          we are investigating, we will pause our process until the bank
          responds.
        </p>
        <p>
          If you were told a payment would unlock something on this site, write to
          us with the receipt identifier and the email address on the account and
          we will investigate where the charge came from.
        </p>
      </>
    ),
  },
  {
    id: "changes",
    title: "Changes to this policy",
    content: (
      <>
        <p>
          We may update this policy to reflect legal requirements or changes to
          how the site works. The date at the top shows the current version.
          Changes never reduce rights that already apply to you.
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
          Billing and payment questions can go to{" "}
          <a href={`mailto:${legalConfig.contactEmail}`}>
            {legalConfig.contactEmail}
          </a>
          . Reports of charges made in error are treated as a priority.
        </p>
      </>
    ),
  },
];

const RefundPolicyPage = () => {
  return (
    <LegalPage
      currentHref="/refund-policy"
      sections={sections}
      summary="TechTipsHub is free and sells nothing. Here is how to report a charge made in error, and how we handle refunds."
      title="Refund and Cancellation Policy"
    />
  );
};

export default RefundPolicyPage;
