import LegalPage, { type ILegalSection } from "@/components/legal/legal-page";
import { legalConfig } from "@/config/legal";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms and Conditions",
  description:
    "The agreement that governs your use of TechTipsHub, including accounts, published content, acceptable use and liability.",
  alternates: { canonical: "/terms" },
  openGraph: {
    title: "Terms and Conditions",
    description:
      "The agreement that governs your use of TechTipsHub, including accounts, content and liability.",
    url: "/terms",
  },
};

const sections: ILegalSection[] = [
  {
    id: "agreement",
    title: "Agreement to these terms",
    content: (
      <>
        <p>
          These Terms and Conditions (&ldquo;terms&rdquo;) are a legal
          agreement between you and {legalConfig.operator} (&ldquo;we&rdquo;,
          &ldquo;us&rdquo; or &ldquo;our&rdquo;) covering your use of{" "}
          <a href={legalConfig.siteUrl}>{legalConfig.siteUrl}</a> and its
          features (the &ldquo;service&rdquo;).
        </p>
        <p>
          By browsing the site, creating an account or publishing content, you
          agree to these terms. If you do not
          agree, do not use the service. Our{" "}
          <Link href="/privacy">Privacy Policy</Link>,{" "}
          <Link href="/cookie">Cookie Policy</Link> and{" "}
          <Link href="/community-guidelines">Community Guidelines</Link> form
          part of this agreement.
        </p>
      </>
    ),
  },
  {
    id: "the-service",
    title: "What the service is",
    content: (
      <>
        <p>
          TechTipsHub is an independent publication and community for people
          interested in software development. Visitors can browse the feed and
          read a preview of any article. Registered users can read every
          article, comment, vote, follow other users, manage a public profile and
          publish their own work. Every account has the same abilities; nothing
          is reserved for paying members.
        </p>
        <p>
          We provide the platform, not professional advice. Articles are
          written by us and by community authors, and the views expressed in a
          bylined article belong to its author.
        </p>
      </>
    ),
  },
  {
    id: "accounts",
    title: "Eligibility and accounts",
    content: (
      <>
        <p>
          You must be at least {legalConfig.minimumAge} years old to create an
          account. If you are below the age of majority where you live, you may
          only use the service with the involvement of a parent or guardian.
        </p>
        <ul>
          <li>
            Provide accurate information and keep it up to date. Do not
            impersonate another person or organisation.
          </li>
          <li>
            Keep your password confidential. You are responsible for activity
            carried out through your account until you tell us it has been
            compromised.
          </li>
          <li>
            One person should normally hold one account. Do not create accounts
            to evade a suspension, manipulate votes or multiply votes.
          </li>
          <li>
            Tell us immediately at{" "}
            <a href={`mailto:${legalConfig.contactEmail}`}>
              {legalConfig.contactEmail}
            </a>{" "}
            if you suspect unauthorised access.
          </li>
          <li>
            We may refuse, suspend or close an account that breaches these
            terms, as described under{" "}
            <a href="#termination">Suspension and termination</a>.
          </li>
        </ul>
        <p>
          If you sign in through Google, Facebook or GitHub, you also agree to
          that provider&rsquo;s terms. We receive only the basic profile
          information described in our <Link href="/privacy">Privacy Policy</Link>.
        </p>
      </>
    ),
  },
  {
    id: "your-content",
    title: "Your content",
    content: (
      <>
        <p>
          You keep ownership of the articles, comments, images and profile
          details you create (&ldquo;your content&rdquo;). We do not claim
          ownership of it.
        </p>
        <p>
          To operate the service, you grant us a worldwide, non-exclusive,
          royalty-free licence to host, store, reproduce, format, display,
          distribute and make your content available on and through the
          service, including in feeds, search results, previews and social
          posts that link to your article. We may allow our hosting and
          delivery providers to process your content on our behalf. This
          licence lasts while your content is published and for a reasonable
          period afterwards while caches and backups expire.
        </p>
        <p>You confirm that:</p>
        <ul>
          <li>
            you own your content or have all permissions needed to publish it;
          </li>
          <li>
            it does not infringe anyone&rsquo;s copyright, trade mark, privacy
            or other rights;
          </li>
          <li>
            it complies with these terms and our{" "}
            <Link href="/community-guidelines">Community Guidelines</Link>;
          </li>
          <li>
            you have consent from any identifiable person shown in your images.
          </li>
        </ul>
        <p>
          You can edit or delete your content at any time. Deleting it removes
          it from the service, but copies may persist briefly in caches,
          backups, search-engine indexes and posts by other people that quote
          or link to it.
        </p>
        <p>
          We may remove content that breaches these terms, infringes rights or
          creates legal or security risk. We are not obliged to publish or
          retain any submission.
        </p>
      </>
    ),
  },
  {
    id: "acceptable-use",
    title: "Acceptable use",
    content: (
      <>
        <p>You must not use the service to:</p>
        <ul>
          <li>
            break the law, infringe intellectual property, or facilitate fraud,
            money laundering or the sale of illegal goods;
          </li>
          <li>
            harass, threaten, defame, dox or discriminate against anyone, or
            publish hateful or sexually explicit material;
          </li>
          <li>
            upload malware, phishing pages or code designed to damage or gain
            unauthorised access to systems;
          </li>
          <li>
            send spam, run unsolicited promotions, or post repetitive or
            machine-generated filler;
          </li>
          <li>
            scrape, crawl or harvest data at a rate that burdens the service, or
            use automated means to create accounts, post content or manipulate
            votes;
          </li>
          <li>
            attempt to bypass authentication, probe for vulnerabilities, or
            interfere with the site&rsquo;s security and rate limits;
          </li>
          <li>
            impersonate another person, misrepresent your affiliation, or
            publish another author&rsquo;s work as your own;
          </li>
          <li>
            advertise products or services without our prior written
            permission.
          </li>
        </ul>
        <p>
          You may quote and link to our articles, but you must not republish
          them in full or present them as your own. Automated access is
          permitted only through the public pages of the site in line with our{" "}
          <a href="/robots.txt">robots.txt</a>.
        </p>
      </>
    ),
  },
  {
    id: "moderation",
    title: "Community guidelines and moderation",
    content: (
      <>
        <p>
          The <Link href="/community-guidelines">Community Guidelines</Link>{" "}
          explain what is welcome in articles and comments. They are part of
          these terms.
        </p>
        <p>
          We may review, edit for formatting, label, restrict or remove content
          that we reasonably believe breaches these terms, and we may warn,
          suspend or close the account responsible. We are not required to
          monitor every submission. Reports can be sent to{" "}
          <a href={`mailto:${legalConfig.contactEmail}`}>
            {legalConfig.contactEmail}
          </a>
          ; we consider every report but do not always disclose the outcome.
        </p>
        <p>
          If you believe a moderation decision was wrong, reply to our message
          or email us with the details and we will review it once.
        </p>
      </>
    ),
  },
  {
    id: "accounts-and-access",
    title: "Accounts, access and payments",
    content: (
      <>
        <p>
          Using TechTipsHub is free. Every registered account can create their
          own profile, follow other members, comment and vote. Browsing the feed
          and reading previews does not require an account.
        </p>
        <ul>
          <li>
            Some actions — reading an article in full, commenting, voting,
            following, publishing and managing a profile — require you to be
            signed in.
          </li>
          <li>
            Visitors who are not signed in can browse the site and read a
            preview of each article.
          </li>
          <li>
            We may operate the site with advertising. Ads are served by third
            parties as described in our{" "}
            <Link href="/privacy">Privacy Policy</Link>.
          </li>
          <li>
            If we ever accept voluntary contributions, they will never unlock
            content or features. Any payment link we publish will be clearly
            labelled.
          </li>
        </ul>
        <p>
          Every account has exactly the same abilities. There are no paid tiers,
          no upgrades and no features reserved for particular members, so no
          payment is ever required to use the site.
        </p>
        <p>
          If you were charged in error, or believe you have paid for something
          on this site, see the{" "}
          <Link href="/refund-policy">Refund and Cancellation Policy</Link>.
          Nothing in these terms limits consumer rights that cannot be excluded
          by law.
        </p>
      </>
    ),
  },
  {
    id: "intellectual-property",
    title: "Our intellectual property",
    content: (
      <>
        <p>
          The site&rsquo;s name, logo, design, layout, software and editorial
          content are owned by us or used under licence. They are protected by
          copyright and other intellectual property laws.
        </p>
        <p>
          You may read, print and share links to our pages for personal,
          non-commercial use, and quote short excerpts with clear attribution
          and a link to the original article. You may not copy, republish,
          translate, sell or redistribute substantial parts of the site, or use
          our name and logo in a way that suggests endorsement, without written
          permission.
        </p>
        <p>
          Article authors retain ownership of their own work, as described under{" "}
          <a href="#your-content">Your content</a>.
        </p>
      </>
    ),
  },
  {
    id: "third-parties",
    title: "Third-party links and advertising",
    content: (
      <>
        <p>
          Articles may link to external websites, tools and documentation. Those
          sites are not under our control, and we are not responsible for their
          content, terms or privacy practices. Following a link is at your own
          risk.
        </p>
        <p>
          We display advertising through Google AdSense and may occasionally
          publish sponsored articles. Ads are served by third parties and their
          content is not an endorsement by us. Sponsored articles are labelled,
          and payment never buys a positive review or a factual claim we do not
          believe.
        </p>
      </>
    ),
  },
  {
    id: "availability",
    title: "Availability and changes",
    content: (
      <>
        <p>
          We aim to keep the site available, but we do not guarantee
          uninterrupted or error-free access. Maintenance, provider outages and
          security incidents can interrupt the service.
        </p>
        <p>
          We may add, change or withdraw features, and may remove content, at
          any time. Because the service is free, no refund or continued access
          is owed if a feature is withdrawn.
        </p>
      </>
    ),
  },
  {
    id: "disclaimers",
    title: "Disclaimers",
    content: (
      <>
        <p>
          The service and its content are provided on an &ldquo;as is&rdquo; and
          &ldquo;as available&rdquo; basis. To the fullest extent permitted by
          law, we disclaim warranties of accuracy, fitness for a particular
          purpose, merchantability and non-infringement.
        </p>
        <p>
          Technical articles describe one approach that worked at the time of
          writing. Code samples are illustrative, not production-ready, and
          must be reviewed and tested in your own environment. We are not
          responsible for data loss, downtime or security problems that result
          from applying an example.
        </p>
        <p>
          Nothing on this site is legal, financial, medical or other
          professional advice. See the <Link href="/disclaimer">Disclaimer</Link>{" "}
          for details. Some jurisdictions do not allow certain warranties to be
          excluded, so parts of this section may not apply to you.
        </p>
      </>
    ),
  },
  {
    id: "liability",
    title: "Limitation of liability",
    content: (
      <>
        <p>
          To the fullest extent permitted by law, we are not liable for indirect,
          incidental, special, consequential or punitive loss, or for loss of
          profit, revenue, data, goodwill or business opportunity, arising from
          your use of or inability to use the service.
        </p>
        <p>
          Our total liability for all claims relating to the service in any
          twelve-month period is limited to BDT 5,000, or the amount you paid
          us during that period if greater.
        </p>
        <p>
          Nothing in these terms excludes liability for death or personal injury
          caused by negligence, for fraud, or for any other liability that
          cannot lawfully be limited. If you are a consumer, you keep the
          statutory rights available to you.
        </p>
      </>
    ),
  },
  {
    id: "indemnity",
    title: "Indemnity",
    content: (
      <>
        <p>
          To the extent permitted by law, you agree to indemnify us against
          claims, losses, liabilities and reasonable costs (including legal
          fees) arising from your content, your breach of these terms, or your
          infringement of another person&rsquo;s rights. We will tell you about
          any such claim and may ask you to participate in the defence. This
          does not apply to the extent the claim results from our own
          negligence or breach.
        </p>
      </>
    ),
  },
  {
    id: "termination",
    title: "Suspension and termination",
    content: (
      <>
        <p>
          You may stop using the service and delete your account at any time
          from your settings or by emailing us.
        </p>
        <p>
          We may suspend or close an account, remove content, or block access if
          you materially breach these terms, if required by law, or if your
          account creates risk for other users or the service. Where it is
          reasonable to do so, we will explain the reason and give you a chance
          to respond.
        </p>
        <p>
          Sections that by their nature should survive termination &mdash;
          including ownership, disclaimers, limitation of liability, indemnity
          and governing law &mdash; continue to apply.
        </p>
      </>
    ),
  },
  {
    id: "governing-law",
    title: "Governing law and disputes",
    content: (
      <>
        <p>
          These terms are governed by {legalConfig.governingLaw}, without regard
          to conflict-of-law rules. If a dispute arises, please contact us first
          at{" "}
          <a href={`mailto:${legalConfig.contactEmail}`}>
            {legalConfig.contactEmail}
          </a>{" "}
          so we can try to resolve it informally within 30 days.
        </p>
        <p>
          If we cannot resolve it, the courts of Bangladesh have jurisdiction,
          except where consumer law in your country of residence gives you the
          right to bring proceedings locally. Nothing here prevents either party
          from seeking urgent relief to protect intellectual property or
          prevent misuse.
        </p>
      </>
    ),
  },
  {
    id: "changes",
    title: "Changes to these terms",
    content: (
      <>
        <p>
          We may update these terms as the service or the law changes. The
          &ldquo;last updated&rdquo; date at the top shows the current version.
          Material changes will be announced on the site or by email before they
          take effect.
        </p>
        <p>
          If you continue to use the service after a change takes effect, you
          accept the revised terms. If you do not agree, stop using the service
          and, if you wish, close your account.
        </p>
      </>
    ),
  },
  {
    id: "general",
    title: "General",
    content: (
      <>
        <p>
          If any provision of these terms is found unenforceable, the rest
          remains in force and the unenforceable part is applied to the
          greatest extent the law allows. A failure to enforce a provision is
          not a waiver of it.
        </p>
        <p>
          These terms, together with the policies linked above, are the entire
          agreement between you and us about the service. You may not transfer
          your rights under them without our consent; we may transfer ours as
          part of a reorganisation or sale, provided the terms continue to
          protect you.
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
          Questions about these terms can be sent to{" "}
          <a href={`mailto:${legalConfig.contactEmail}`}>
            {legalConfig.contactEmail}
          </a>{" "}
          or through the <Link href="/contact">contact form</Link>.
        </p>
      </>
    ),
  },
];

const TermsPage = () => {
  return (
    <LegalPage
      currentHref="/terms"
      sections={sections}
      summary="The agreement between you and TechTipsHub: accounts, published content, acceptable use and liability."
      title="Terms and Conditions"
    />
  );
};

export default TermsPage;
