import LegalPage, { type ILegalSection } from "@/components/legal/legal-page";
import { legalConfig } from "@/config/legal";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Community Guidelines",
  description:
    "What is welcome in TechTipsHub articles and comments, our rules on AI-generated content and copyright, and how moderation works.",
  alternates: { canonical: "/community-guidelines" },
  openGraph: {
    title: "Community Guidelines",
    description:
      "What is welcome in TechTipsHub articles and comments, and how moderation works.",
    url: "/community-guidelines",
  },
};

const sections: ILegalSection[] = [
  {
    id: "scope",
    title: "Where these guidelines apply",
    content: (
      <>
        <p>
          TechTipsHub is a place for people who build software to share what
          they have learned. These guidelines cover everything you publish here:
          articles, drafts that become public, comments, your username, profile
          picture, bio and social links.
        </p>
        <p>
          They are part of our <Link href="/terms">Terms and Conditions</Link>.
          Breaking them can lead to content removal or account suspension, as
          described under{" "}
          <a href="#enforcement">Moderation and enforcement</a>.
        </p>
      </>
    ),
  },
  {
    id: "principles",
    title: "The short version",
    content: (
      <>
        <ul>
          <li>
            <strong>Be useful.</strong> Share something a reader can apply:
            working examples, trade-offs, mistakes and how you fixed them.
          </li>
          <li>
            <strong>Be honest.</strong> Do not present untested code, borrowed
            work or speculation as established fact.
          </li>
          <li>
            <strong>Be civil.</strong> Critique the idea, not the person. Assume
            good faith until it is clearly absent.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "writing",
    title: "Publishing articles",
    content: (
      <>
        <ul>
          <li>
            Publish work you wrote or have permission to publish. Quoting
            others is fine with attribution and a link; copying an article in
            full is not.
          </li>
          <li>
            Test the code you publish, or say plainly that you have not. Include
            the versions of the tools you used when they matter.
          </li>
          <li>
            Use images you own or that are licensed for reuse, and credit the
            source. Do not upload screenshots containing other people&rsquo;s
            personal data.
          </li>
          <li>
            Label sponsored or affiliate content, and disclose any material
            connection to a product you recommend.
          </li>
          <li>
            Write a title and summary that match the article. Avoid clickbait
            and exaggerated claims.
          </li>
          <li>
            One article per topic. Do not republish the same post repeatedly to
            stay on the front page.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "ai-content",
    title: "AI-assisted content",
    content: (
      <>
        <p>
          You may use AI tools to help draft, edit or explain. You remain
          responsible for everything you publish. That means checking code
          actually runs, verifying claims against primary sources, and removing
          invented references.
        </p>
        <p>
          Do not publish unreviewed machine-generated articles at volume. They
          push useful writing out of the feed and are removed under the spam
          rule below. Where a substantial part of an article was generated,
          disclose it in the article.
        </p>
      </>
    ),
  },
  {
    id: "comments",
    title: "Comments",
    content: (
      <>
        <p>Comments should add to the article:</p>
        <ul>
          <li>ask a specific question or share a better approach;</li>
          <li>report a bug or a factual error, ideally with a reproduction;</li>
          <li>disagree with the reasoning, not the author.</li>
        </ul>
        <p>
          Comments that only promote a product, repeat the same link across
          posts, or attack other readers will be removed.
        </p>
      </>
    ),
  },
  {
    id: "not-allowed",
    title: "What is not allowed",
    content: (
      <>
        <ul>
          <li>
            <strong>Harassment and hate.</strong> Threats, stalking, slurs,
            demeaning comments and attacks based on race, ethnicity, religion,
            disability, gender, sexual orientation, age or nationality.
          </li>
          <li>
            <strong>Doxxing.</strong> Publishing someone&rsquo;s address, phone
            number, workplace, private email or other personal information
            without consent.
          </li>
          <li>
            <strong>Sexual content.</strong> Pornography, sexualised imagery of
            real people, and any content involving minors.
          </li>
          <li>
            <strong>Violence and illegal activity.</strong> Instructions for
            harming people, building weapons, or committing fraud, and content
            that facilitates the sale of illegal goods.
          </li>
          <li>
            <strong>Malware and abuse.</strong> Phishing pages, credential
            stealers, exploits aimed at real systems, and code intended to
            damage or gain unauthorised access.
          </li>
          <li>
            <strong>Spam.</strong> Bulk promotional comments, unrelated links,
            keyword stuffing, referral schemes and repetitive low-effort posts.
          </li>
          <li>
            <strong>Manipulation.</strong> Vote rings, sock-puppet accounts,
            buying engagement, or coordinated reporting of another user.
          </li>
          <li>
            <strong>Impersonation.</strong> Pretending to be another person, a
            company, or a TechTipsHub editor.
          </li>
          <li>
            <strong>Copyright infringement.</strong> Republishing someone
            else&rsquo;s article, images or code without permission.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "copyright",
    title: "Copyright complaints",
    content: (
      <>
        <p>
          If you own a work and believe it has been published here without
          permission, email{" "}
          <a href={`mailto:${legalConfig.contactEmail}`}>
            {legalConfig.contactEmail}
          </a>{" "}
          with the subject &ldquo;Copyright notice&rdquo; and include:
        </p>
        <ul>
          <li>your name, address and email address;</li>
          <li>a description of the copyrighted work;</li>
          <li>the exact URL of the material you say infringes it;</li>
          <li>
            a statement that you have a good-faith belief the use is not
            authorised by the owner, its agent or the law;
          </li>
          <li>
            a statement that the information in your notice is accurate and that
            you are the owner or authorised to act for them;
          </li>
          <li>your physical or electronic signature.</li>
        </ul>
        <p>
          We review complete notices promptly and remove or disable access to
          material that appears to infringe. We notify the author, who may send a
          counter-notice with the same level of detail explaining why the use is
          lawful. We may restore material if a valid counter-notice is received
          and the complainant does not take the dispute further. Knowingly
          submitting a false notice can create legal liability.
        </p>
      </>
    ),
  },
  {
    id: "reporting",
    title: "Reporting a problem",
    content: (
      <>
        <p>
          Report content that breaks these guidelines to{" "}
          <a href={`mailto:${legalConfig.contactEmail}`}>
            {legalConfig.contactEmail}
          </a>{" "}
          or through the <Link href="/contact">contact form</Link>. Include
          the URL, what rule you believe is broken, and any context that helps us
          assess it. Reports are confidential; we do not tell the reported user
          who raised them.
        </p>
        <p>
          We prioritise threats of violence, child safety, doxxing and account
          compromise. Please do not abuse the report function to target someone
          you disagree with.
        </p>
      </>
    ),
  },
  {
    id: "enforcement",
    title: "Moderation and enforcement",
    content: (
      <>
        <p>
          We may take any of the following steps, depending on the severity and
          history:
        </p>
        <ol>
          <li>
            <strong>Edit or remove content</strong> that breaks these
            guidelines, with a note where practical.
          </li>
          <li>
            <strong>Warn the account</strong> and explain what needs to change.
          </li>
          <li>
            <strong>Restrict features</strong> such as commenting or publishing
            for a period.
          </li>
          <li>
            <strong>Suspend or close the account</strong> for serious or repeated
            breaches.
          </li>
        </ol>
        <p>
          Serious cases &mdash; threats, child sexual abuse material, coordinated
          fraud, or attacks on the service &mdash; may lead to immediate
          suspension while we investigate. Where the law requires it, we report
          content to the relevant authorities.
        </p>
        <p>
          If you believe a decision was wrong, email us within 14 days. A person
          who did not make the original decision will review it once. We may not
          restore content that creates a legal or safety risk.
        </p>
      </>
    ),
  },
  {
    id: "changes",
    title: "Changes to these guidelines",
    content: (
      <>
        <p>
          We update these guidelines as the community grows or new abuse
          patterns appear. The date at the top shows the current version, and
          material changes are announced on the site. Continuing to publish after
          a change means you accept the updated rules.
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
          Questions about these guidelines can go to{" "}
          <a href={`mailto:${legalConfig.contactEmail}`}>
            {legalConfig.contactEmail}
          </a>
          .
        </p>
      </>
    ),
  },
];

const CommunityGuidelinesPage = () => {
  return (
    <LegalPage
      currentHref="/community-guidelines"
      sections={sections}
      summary="The standard we hold articles, comments and profiles to, how we handle copyright complaints, and what happens when a rule is broken."
      title="Community Guidelines"
    />
  );
};

export default CommunityGuidelinesPage;
