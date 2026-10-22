import LegalPage, { type ILegalSection } from "@/components/legal/legal-page";
import LegalTable from "@/components/legal/legal-table";
import { legalConfig } from "@/config/legal";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How TechTips Hub collects, uses, shares and protects your personal information, and the rights you have over your data.",
  alternates: { canonical: "/privacy" },
  openGraph: {
    title: "Privacy Policy",
    description:
      "How TechTips Hub collects, uses, shares and protects your personal information.",
    url: "/privacy",
  },
};

const sections: ILegalSection[] = [
  {
    id: "overview",
    title: "Overview",
    content: (
      <>
        <p>
          <strong>{legalConfig.operator}</strong> (&ldquo;we&rdquo;,
          &ldquo;us&rdquo; or &ldquo;our&rdquo;) publishes articles about web
          development, artificial intelligence and the tools developers use. We
          operate the website at{" "}
          <a href={legalConfig.siteUrl}>{legalConfig.siteUrl}</a>.
        </p>
        <p>
          This policy explains what personal information we collect when you
          visit the site, create an account, publish an article, comment or
          vote; why we collect it; who we share it with;
          and the choices available to you.
        </p>
        <p>
          For the purposes of data protection law, we are the controller of the
          personal information described here. You can reach us at{" "}
          <a href={`mailto:${legalConfig.contactEmail}`}>
            {legalConfig.contactEmail}
          </a>
          .
        </p>
        <p>
          By using the site you acknowledge this policy. If you do not agree
          with it, please do not create an account or use the features that
          require one. Our{" "}
          <Link href="/cookie">Cookie Policy</Link> forms part of this policy.
        </p>
      </>
    ),
  },
  {
    id: "information-you-provide",
    title: "Information you give us",
    content: (
      <>
        <p>We collect information you enter on the site or send to us.</p>
        <h3>Account information</h3>
        <p>
          When you register with an email address and password, or sign in with
          Google, Facebook or GitHub, we store:
        </p>
        <ul>
          <li>
            your full name, username, email address and profile picture;
          </li>
          <li>
            optional profile details you choose to add, such as a bio,
            designation, location, phone number, date of birth, gender and
            links to social profiles;
          </li>
          <li>
            a one-way hash of your password. We never store your password in
            plain text and we cannot recover it for you;
          </li>
          <li>your role and account status (for example, active or blocked).</li>
        </ul>
        <h3>Content and activity</h3>
        <p>
          We store the articles you publish, including their titles, images,
          categories and drafts; the comments you write; your upvotes and
          downvotes; the accounts you follow; and any reports you submit about
          content or other users.
        </p>
        <h3>Messages to us</h3>
        <p>
          If you use the contact form we collect your first name, last name,
          email address, subject and message. The form sends that information
          to our inbox so we can reply; we do not use it to build a marketing
          list.
        </p>
        <h3>Charges made in error</h3>
        <p>
          TechTips Hub does not sell memberships or any other paid product, so we
          never ask for card or wallet details. If you contact us about a charge
          you believe was made in error, we record the details you send us (such
          as a transaction identifier) in order to investigate it.
        </p>
      </>
    ),
  },
  {
    id: "information-collected-automatically",
    title: "Information we collect automatically",
    content: (
      <>
        <p>
          When you load a page, our hosting infrastructure and analytics tools
          record limited technical information:
        </p>
        <ul>
          <li>
            IP address, browser type and version, operating system, device type
            and screen size;
          </li>
          <li>
            the pages you request, the page that referred you, and the time and
            duration of your visit;
          </li>
          <li>
            a coarse location derived from your IP address (such as city or
            country). We do not request precise location from your device;
          </li>
          <li>
            error and security logs, including requests that are rate-limited
            or rejected.
          </li>
        </ul>
        <p>
          This information is used in aggregate to keep the site available,
          diagnose faults, prevent abuse and understand which articles are
          useful. It is not used to identify you personally.
        </p>
      </>
    ),
  },
  {
    id: "information-from-other-sources",
    title: "Information from other sources",
    content: (
      <>
        <p>We receive limited information from the services that power the site:</p>
        <ul>
          <li>
            <strong>Social sign-in.</strong> If you sign in with Google,
            Facebook or GitHub, the provider shares your name, email address,
            profile picture and a provider-specific account identifier. We do
            not receive your password for those services or access to your
            posts there.
          </li>
          <li>
            <strong>Payments.</strong> TechTips Hub does not process payments.
            If you contact us about a charge you believe was made in error, we
            keep the details you send us (such as a transaction identifier) so
            we can investigate it.
          </li>
          <li>
            <strong>Advertising and analytics.</strong> Google, as our
            advertising and analytics provider, reports aggregated information
            about ad impressions, clicks and site traffic.
          </li>
          <li>
            <strong>Images.</strong> Images you upload are stored and delivered
            by Cloudinary on our behalf.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "how-we-use-information",
    title: "How we use information",
    content: (
      <>
        <p>We use personal information to:</p>
        <ul>
          <li>create and secure your account, and sign you in;</li>
          <li>
            publish your articles, display your profile, and show comments and
            votes from other readers;
          </li>
          <li>
            deliver notifications and service messages, such as password-reset
            emails;
          </li>
          <li>
            investigate and resolve reports of charges made in error;
          </li>
          <li>
            moderate content, investigate reports, enforce our{" "}
            <Link href="/terms">Terms and Conditions</Link> and{" "}
            <Link href="/community-guidelines">Community Guidelines</Link>, and
            keep the site safe;
          </li>
          <li>
            measure traffic and improve the layout, performance and editorial
            direction of the site;
          </li>
          <li>
            display advertising, including interest-based advertising served by
            Google, and measure its performance;
          </li>
          <li>
            answer your messages and comply with legal obligations.
          </li>
        </ul>
        <h3>Legal bases</h3>
        <p>
          Where data protection law requires a legal basis, we rely on the
          following:
        </p>
        <LegalTable label="Legal bases for processing personal information">
          <table>
            <thead>
              <tr>
                <th>Purpose</th>
                <th>Legal basis</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Providing accounts, publishing, comments and votes</td>
                <td>Performance of a contract with you</td>
              </tr>
              <tr>
                <td>Investigating a charge reported in error</td>
                <td>
                  Performance of a contract, compliance with legal obligations
                  and our legitimate interest in correcting billing mistakes
                </td>
              </tr>
              <tr>
                <td>Moderation, security and abuse prevention</td>
                <td>
                  Our legitimate interest in keeping the service safe and usable
                </td>
              </tr>
              <tr>
                <td>Traffic measurement and site improvement</td>
                <td>
                  Our legitimate interest in operating and improving the site,
                  or your consent where required
                </td>
              </tr>
              <tr>
                <td>Interest-based advertising</td>
                <td>Your consent where required, otherwise as described below</td>
              </tr>
            </tbody>
          </table>
        </LegalTable>
        <p>
          We do not sell your personal information. We do not use your email
          address to send third-party marketing.
        </p>
      </>
    ),
  },
  {
    id: "cookies",
    title: "Cookies and similar technologies",
    content: (
      <>
        <p>
          We use cookies to keep you signed in and to measure and fund the
          site. Cookies are small text files stored by your browser. We also
          use browser storage for your light or dark theme preference.
        </p>
        <p>
          Cookies fall into three groups: strictly necessary cookies for
          sign-in and security, analytics cookies that tell us how pages are
          used, and advertising cookies set by Google. The{" "}
          <Link href="/cookie">Cookie Policy</Link> lists the cookies involved,
          their purposes and how to control them.
        </p>
      </>
    ),
  },
  {
    id: "advertising-and-analytics",
    title: "Advertising and analytics",
    content: (
      <>
        <h3>Google AdSense</h3>
        <p>
          We display advertising through Google AdSense. Google and its partners
          may use cookies or similar technologies to serve ads based on your
          prior visits to this and other websites, to limit how often you see
          the same ad, and to measure performance.
        </p>
        <p>
          You can opt out of personalised advertising in{" "}
          <a
            href="https://adssettings.google.com"
            rel="noopener noreferrer"
            target="_blank"
          >
            Google Ads Settings
          </a>
          , or opt out of third-party vendor cookies at{" "}
          <a
            href="https://www.aboutads.info/choices/"
            rel="noopener noreferrer"
            target="_blank"
          >
            aboutads.info
          </a>
          . Opting out does not remove ads; it makes them less relevant. Where
          the law requires consent for advertising cookies, Google presents a
          consent message on our behalf before those cookies are set.
        </p>
        <p>
          Google&rsquo;s own practices are described in the{" "}
          <a
            href="https://policies.google.com/technologies/partner-sites"
            rel="noopener noreferrer"
            target="_blank"
          >
            Google Privacy &amp; Terms
          </a>{" "}
          page for sites that use its services.
        </p>
        <h3>Google Analytics and Tag Manager</h3>
        <p>
          We use Google Analytics 4, loaded through Google Tag Manager, to count
          visits, see which articles are read and understand how visitors reach
          the site. Google Analytics 4 does not store or log full IP addresses.
          Reports we see are aggregated; we do not use them to identify
          individuals.
        </p>
        <p>
          You can install the{" "}
          <a
            href="https://tools.google.com/dlpage/gaoptout"
            rel="noopener noreferrer"
            target="_blank"
          >
            Google Analytics opt-out browser add-on
          </a>{" "}
          or block these scripts with a content blocker. The site will continue
          to work.
        </p>
      </>
    ),
  },
  {
    id: "sharing",
    title: "When we share information",
    content: (
      <>
        <p>
          We share personal information only with service providers that help
          us run the site, and only as far as needed for their task:
        </p>
        <LegalTable label="Third-party service providers">
          <table>
            <thead>
              <tr>
                <th>Provider</th>
                <th>Purpose</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Vercel</td>
                <td>Website and API hosting, content delivery and logs</td>
              </tr>
              <tr>
                <td>Our database provider</td>
                <td>Storing accounts, articles and comments</td>
              </tr>
              <tr>
                <td>Cloudinary</td>
                <td>Storing and delivering uploaded images</td>
              </tr>
              <tr>
                <td>Google</td>
                <td>
                  Analytics, Tag Manager, advertising and social sign-in
                </td>
              </tr>
              <tr>
                <td>Meta and GitHub</td>
                <td>Social sign-in, if you choose those options</td>
              </tr>
              <tr>
                <td>Our email provider</td>
                <td>Delivering service emails and contact-form messages</td>
              </tr>
            </tbody>
          </table>
        </LegalTable>
        <p>We may also disclose information:</p>
        <ul>
          <li>
            if required by law, a court order or a lawful request from a public
            authority;
          </li>
          <li>
            to establish, exercise or defend legal claims, or to investigate
            fraud or abuse;
          </li>
          <li>
            as part of a merger, acquisition or sale of assets, in which case
            the recipient remains bound by this policy for data it receives;
          </li>
          <li>with your direction or consent.</li>
        </ul>
        <p>
          Our providers may process data outside your country. See{" "}
          <a href="#international-transfers">International transfers</a>.
        </p>
      </>
    ),
  },
  {
    id: "public-content",
    title: "Content that is public",
    content: (
      <>
        <p>
          TechTips Hub is a publishing platform. Your username, profile picture,
          bio, social links, published articles, comments and votes are visible
          to anyone and may be indexed by search engines and copied by others.
          Treat anything you publish as public.
        </p>
        <p>
          Please do not post sensitive personal information &mdash; your own or
          anyone else&rsquo;s &mdash; in an article or comment. If you need a
          profile detail to stay private, leave that field empty.
        </p>
      </>
    ),
  },
  {
    id: "international-transfers",
    title: "International transfers",
    content: (
      <>
        <p>
          We are based in Bangladesh and use providers with infrastructure in
          several countries, including the United States and the European Union.
          Your information may therefore be processed outside the country where
          you live.
        </p>
        <p>
          Where required, transfers are covered by appropriate safeguards, such
          as standard contractual clauses approved by the European Commission or
          an equivalent mechanism offered by the provider. You can ask us for
          more detail about the safeguards that apply to a particular provider.
        </p>
      </>
    ),
  },
  {
    id: "retention",
    title: "How long we keep information",
    content: (
      <>
        <p>We keep information only for as long as we need it:</p>
        <ul>
          <li>
            <strong>Account and profile data</strong> while your account is
            open. If you delete your account, we delete or anonymise the
            profile within 30 days.
          </li>
          <li>
            <strong>Articles and comments</strong> while they are published.
            After account deletion they are removed or attributed to a deleted
            user, unless retention is needed to resolve a dispute or comply
            with the law.
          </li>
          <li>
            <strong>Billing correspondence</strong> for as long as tax,
            accounting and consumer-protection rules require, if you have
            contacted us about a charge.
          </li>
          <li>
            <strong>Moderation and security records</strong> for as long as
            needed to prevent repeat abuse and enforce our terms.
          </li>
          <li>
            <strong>Backups</strong> for a short, rolling period of up to 90
            days before they are overwritten.
          </li>
          <li>
            <strong>Analytics data</strong> for the retention period configured
            in our analytics account.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "security",
    title: "How we protect information",
    content: (
      <>
        <p>
          Passwords are hashed with bcrypt. Sign-in cookies are HTTP-only,
          marked secure in production and scoped to this site. Traffic between
          your browser and our servers is encrypted with TLS. Access to the
          database and admin tools is restricted to authorised people.
        </p>
        <p>
          No service is completely secure. Please use a unique password, keep
          it private and tell us promptly if you believe your account has been
          compromised. If a breach is likely to affect your rights, we will
          notify you and the relevant authority as required by law.
        </p>
      </>
    ),
  },
  {
    id: "your-rights",
    title: "Your rights",
    content: (
      <>
        <p>
          Depending on where you live, you may have the right to:
        </p>
        <ul>
          <li>ask for a copy of the personal information we hold about you;</li>
          <li>correct information that is inaccurate or incomplete;</li>
          <li>ask us to delete your account and associated information;</li>
          <li>ask us to restrict or object to certain processing;</li>
          <li>
            receive information you gave us in a portable, machine-readable
            format;
          </li>
          <li>
            withdraw consent you previously gave, such as consent for
            personalised advertising cookies, without affecting processing that
            happened before withdrawal;
          </li>
          <li>
            lodge a complaint with your local data protection authority.
          </li>
        </ul>
        <p>
          To exercise a right, email{" "}
          <a href={`mailto:${legalConfig.contactEmail}`}>
            {legalConfig.contactEmail}
          </a>{" "}
          from the address linked to your account. We may ask for information to
          confirm your identity before acting. We respond within 30 days unless
          the request is complex, in which case we will tell you why we need
          more time. Exercising your rights is free, and we will not treat you
          differently for doing so.
        </p>
        <p>
          Some information is visible on your public profile. You can edit or
          remove it from your account settings at any time.
        </p>
      </>
    ),
  },
  {
    id: "children",
    title: "Children’s privacy",
    content: (
      <>
        <p>
          The site is not intended for children under {legalConfig.minimumAge}.
          In countries where the digital age of consent is higher, you must be
          at least 16 to create an account without a parent or guardian&rsquo;s
          consent.
        </p>
        <p>
          We do not knowingly collect information from children below the
          applicable age. If you believe a child has created an account, email
          us and we will delete it and the related information.
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
          We may update this policy when the site, our providers or the law
          change. The &ldquo;last updated&rdquo; date at the top always shows
          the current version.
        </p>
        <p>
          If a change materially affects how we use your personal information,
          we will post a notice on the site or email registered users before the
          change takes effect. Continuing to use the site after that point means
          you accept the updated policy.
        </p>
      </>
    ),
  },
  {
    id: "contact",
    title: "Contact us",
    content: (
      <>
        <p>
          Questions, requests or complaints about privacy can be sent to{" "}
          <a href={`mailto:${legalConfig.contactEmail}`}>
            {legalConfig.contactEmail}
          </a>
          . We prefer email because it gives us a written record, but you can
          also use the{" "}
          <Link href="/contact-us">contact form</Link>.
        </p>
        <p>
          If you are not satisfied with our response, you may complain to your
          local data protection authority. In Bangladesh, you can raise the
          matter with the relevant government authority responsible for digital
          security.
        </p>
      </>
    ),
  },
];

const PrivacyPolicyPage = () => {
  return (
    <LegalPage
      currentHref="/privacy"
      sections={sections}
      summary="This policy explains what information TechTips Hub collects, why we collect it, who we share it with, and the control you have over it."
      title="Privacy Policy"
    />
  );
};

export default PrivacyPolicyPage;
