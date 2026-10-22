import AdSlot from "@/components/adsense/ad-slot";
import AdBanner from "@/components/adsense/ad-banner";
import FactList, { FactLink } from "@/components/editorial/fact-list";
import PageHero from "@/components/editorial/page-hero";
import ContactForm from "@/components/modules/contact/contact-form";
import Container from "@/components/ui/container";
import { legalConfig } from "@/config/legal";
import { Metadata } from "next";
import Link from "next/link";
import { BiEnvelope } from "react-icons/bi";
import { FiArrowUpRight } from "react-icons/fi";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with TechTips Hub about feedback, corrections, writing, or advertising.",
  openGraph: {
    title: "Contact Us",
    description:
      "Get in touch with TechTips Hub about feedback, corrections, writing, or advertising.",
    url: "https://techtipshub.vercel.app/contact-us",
  },
};

// Real inbox the contact endpoint delivers to (CONTACT_INBOX, falling back to
// the configured sending address). Override with NEXT_PUBLIC_CONTACT_EMAIL.
const CONTACT_EMAIL = legalConfig.contactEmail;

const reasons = [
  {
    title: "Feedback and corrections",
    body: "Spotted an error in an article? Tell us the URL and what is wrong — we fix it on the page.",
  },
  {
    title: "Write with us",
    body: "Pitch a tutorial or explainer. Send a one-paragraph outline and a link to something you have written.",
  },
  {
    title: "Advertising",
    body: "Sponsored placements are labelled. Ask for the current options and rates.",
  },
  {
    title: "Account problems",
    body: "Locked out, or need a profile removed? Email from the address on the account so we can verify it.",
  },
];

const ContactUsPage = () => {
  return (
    <main>
      <section className="border-b border-default/60">
        <Container>
          <div className="py-14 lg:py-20">
            <PageHero
              eyebrow="Contact"
              title="Say hello"
              lede="Questions, corrections and pitches all land in the same inbox. Use the form below, or email us directly — whichever is easier."
            />
          </div>
        </Container>
      </section>

      <Container>
        <div className="grid gap-12 py-14 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-16 lg:py-16">
          {/* Form */}
          <section aria-labelledby="contact-form-heading">
            <h2
              id="contact-form-heading"
              className="text-xs font-semibold uppercase tracking-[0.14em] text-default-500"
            >
              Send a message
            </h2>
            <p className="mt-3 max-w-lg text-pretty text-xl leading-relaxed tracking-tight">
              Tell us what you need. A real person reads every message, usually
              within a couple of business days.
            </p>
            <div className="mt-8 max-w-xl">
              <ContactForm />
            </div>
          </section>

          {/* Direct details and what we handle */}
          <aside className="space-y-8">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-default-500">
                Direct
              </h2>
              <FactList label="Contact details" className="mt-4">
                <FactLink term="Email" href={`mailto:${CONTACT_EMAIL}`}>
                  {CONTACT_EMAIL}
                </FactLink>
                <FactLink term="Form" href="/contact-us">
                  On this page
                </FactLink>
              </FactList>
            </div>

            <div>
              <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-default-500">
                What we can help with
              </h2>
              <ul className="mt-2 divide-y divide-default/60">
                {reasons.map((reason) => (
                  <li key={reason.title} className="py-4">
                    <h3 className="text-sm font-semibold">{reason.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-default-600">
                      {reason.body}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-default/60 p-5">
              <BiEnvelope aria-hidden className="size-4 text-primary" />
              <p className="mt-2 text-sm leading-relaxed text-default-600">
                Many questions are answered in the{" "}
                <Link
                  href="/"
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  published articles
                </Link>{" "}
                or the{" "}
                <Link
                  href="/community-guidelines"
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  community guidelines
                </Link>
                .
              </p>
              <Link
                href="/about-us"
                className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary underline-offset-4 hover:underline"
              >
                About the publication
                <FiArrowUpRight aria-hidden className="size-3.5" />
              </Link>
            </div>
          </aside>
        </div>

        {/* Existing ad unit — position preserved. */}
        <div className="pb-10">
          <AdSlot>
            <AdBanner />
          </AdSlot>
        </div>
      </Container>
    </main>
  );
};

export default ContactUsPage;
