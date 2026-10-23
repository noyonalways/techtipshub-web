import { AdSlot } from "@/components/adsense";
import FactList, { Fact, FactLink } from "@/components/editorial/fact-list";
import PageHero from "@/components/editorial/page-hero";
import ContactForm from "@/components/modules/contact/contact-form";
import ButtonLink from "@/components/ui/button-link";
import Container from "@/components/ui/container";
import { legalConfig } from "@/config/legal";
import { Metadata } from "next";
import Link from "next/link";
import { BiChevronRight } from "react-icons/bi";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with TechTipsHub about feedback, corrections, writing, or advertising.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact TechTipsHub",
    description:
      "Get in touch with TechTipsHub about feedback, corrections, writing, or advertising.",
    url: "/contact",
  },
};

// Real inbox the contact endpoint delivers to (CONTACT_INBOX, falling back to
// the configured sending address). Override with NEXT_PUBLIC_CONTACT_EMAIL.
const CONTACT_EMAIL = legalConfig.contactEmail;

const reasons = [
  {
    title: "Feedback and corrections",
    body: "Spotted an error in an article? Send the URL and what is wrong. Corrections are made on the page itself.",
  },
  {
    title: "Write with us",
    body: "Pitch a tutorial or explainer. A short outline and a link to something you have written is enough.",
  },
  {
    title: "Advertising",
    body: "Sponsored placements are labelled as advertising. Ask for the current options and rates.",
  },
  {
    title: "Account problems",
    body: "Locked out, or need a profile removed? Write from the address on the account so we can verify it.",
  },
];

const Contact = () => {
  return (
    <div>
      {/* Hero. The same opening as About and Features: the heading on the left,
          the details a reader wants first on the right. */}
      <section className="border-b border-default/60">
        <Container>
          <div className="py-14 lg:py-24">
            <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-20">
              <PageHero
                eyebrow="Contact"
                title={
                  <>
                    Write to the people who{" "}
                    <span className="text-primary-accessible">publish here</span>
                  </>
                }
                lede="Corrections, pitches and account questions all reach the same inbox. A real person reads every message, usually within a couple of business days."
                meta={
                  <div className="flex flex-wrap items-center gap-3">
                    <ButtonLink
                      href="#contact-form"
                      radius="lg"
                      color="primary"
                      endContent={<BiChevronRight />}
                      className="font-semibold"
                    >
                      Send a message
                    </ButtonLink>
                    <ButtonLink
                      href={`mailto:${CONTACT_EMAIL}`}
                      radius="lg"
                      variant="bordered"
                    >
                      Email instead
                    </ButtonLink>
                  </div>
                }
              />

              <aside className="lg:pt-2">
                <h2 className="tth-label">
                  Where to write
                </h2>
                <FactList label="Contact details" className="mt-4">
                  <FactLink term="Email" href={`mailto:${CONTACT_EMAIL}`}>
                    {CONTACT_EMAIL}
                  </FactLink>
                  <Fact term="Form">
                    <Link
                      href="#contact-form"
                      className="text-primary-accessible underline-offset-4 hover:underline"
                    >
                      On this page
                    </Link>
                  </Fact>
                  <Fact term="Reply time">A couple of business days</Fact>
                </FactList>
              </aside>
            </div>
          </div>
        </Container>
      </section>

      <Container>
        {/* What reaches us. A directory of reasons, set the same way as the
            topics list on About. */}
        <section
          aria-labelledby="reasons"
          className="grid gap-10 border-b border-default/60 py-16 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-16"
        >
          <div className="lg:pt-2">
            <h2
              id="reasons"
              className="tth-label leading-6"
            >
              What reaches us
            </h2>
            <p className="mt-3 max-w-[16rem] text-sm leading-relaxed text-default-600">
              If your message fits one of these, say so in the subject so it is
              routed sooner.
            </p>
          </div>

          <ol className="divide-y divide-default/60 border-t border-default/60 md:grid md:grid-cols-2 md:gap-x-12 md:divide-y-0">
            {reasons.map((reason, index) => (
              <li key={reason.title} className="border-b border-default/60 py-6">
                <span className="text-xs font-semibold tabular-nums tracking-wider text-primary-accessible">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-2 font-semibold tracking-tight">
                  {reason.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-default-600">
                  {reason.body}
                </p>
              </li>
            ))}
          </ol>
        </section>

        {/* The form. It is the page's one job, so it gets the full measure. */}
        <section
          aria-labelledby="contact-form"
          className="grid scroll-mt-24 gap-10 border-b border-default/60 py-16 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-16 lg:py-20"
        >
          <div className="lg:pt-2">
            <h2
              id="contact-form"
              className="tth-label leading-6"
            >
              Send a message
            </h2>
            <p className="mt-3 max-w-[16rem] text-sm leading-relaxed text-default-600">
              Every field is required. Replies come from the address you enter.
            </p>
            <p className="mt-4 max-w-[16rem] text-sm leading-relaxed text-default-600">
              Read the{" "}
              <Link
                href="/community-guidelines"
                className="font-medium text-primary-accessible underline-offset-4 hover:underline"
              >
                community guidelines
              </Link>{" "}
              or browse the{" "}
              <Link
                href="/"
                className="font-medium text-primary-accessible underline-offset-4 hover:underline"
              >
                published articles
              </Link>{" "}
              first if the question may already be answered.
            </p>
          </div>

          <div>
            <ContactForm />
          </div>
        </section>

        {/* The form is this page's one job, so the unit sits after it and before
            the sign-up block, never between the form and the hero. */}
        <div className="pb-4">
          <AdSlot variant="display" placement="contact-form-end" />
        </div>

        {/* Close, matching the other editorial pages. */}
        <section className="py-16 lg:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-pretty text-2xl font-semibold tracking-tight md:text-3xl">
              Want to write here instead?
            </h2>
            <p className="mx-auto mt-3 max-w-xl leading-relaxed text-default-600">
              Publishing is open to anyone with an account. The About page
              explains what we publish and the standards every article meets.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <ButtonLink href="/signup" radius="lg" color="primary">
                Create a free account
              </ButtonLink>
              <ButtonLink href="/about" radius="lg" variant="bordered">
                About the publication
              </ButtonLink>
            </div>
          </div>
        </section>
      </Container>
    </div>
  );
};

export default Contact;
