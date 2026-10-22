import AdBanner from "@/components/adsense/ad-banner";
import ContactForm from "@/components/modules/contact/contact-form";
import Container from "@/components/ui/container";
import { Metadata } from "next";
import Link from "next/link";
import { BiEnvelope } from "react-icons/bi";
import { BsChatSquareText } from "react-icons/bs";
import { FiBookOpen } from "react-icons/fi";

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
const CONTACT_EMAIL =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL || "noyonrahman2003@gmail.com";

const reasons = [
  {
    icon: <BsChatSquareText className="size-5" />,
    title: "Feedback and corrections",
    description:
      "Spotted an error in an article? Tell us and we will fix it on the page.",
  },
  {
    icon: <FiBookOpen className="size-5" />,
    title: "Write with us",
    description:
      "Pitch a tutorial or explainer. We are always looking for practitioners.",
  },
  {
    icon: <BiEnvelope className="size-5" />,
    title: "Advertising",
    description:
      "Sponsored placements are labelled. Ask for the current options.",
  },
];

const ContactUsPage = () => {
  return (
    <div>
      {/* Hero */}
      <section className="border-b border-default/60">
        <Container>
          <div className="mx-auto max-w-3xl py-16 lg:py-20">
            <p className="text-sm font-medium uppercase tracking-wider text-primary">
              Contact
            </p>
            <h1 className="mt-4 text-pretty text-4xl font-bold leading-tight tracking-tight md:text-5xl">
              Say hello
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-default-600">
              Questions, corrections and pitches all land in the same inbox. Use
              the form below, or email us directly — whichever is easier.
            </p>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="mt-6 inline-flex items-center gap-2 rounded-lg border border-default/60 px-3.5 py-2 text-sm font-medium transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
            >
              <BiEnvelope className="size-4" aria-hidden />
              {CONTACT_EMAIL}
            </a>
          </div>
        </Container>
      </section>

      <Container>
        <div className="grid gap-12 py-14 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-16">
          {/* Form */}
          <section aria-labelledby="contact-form-heading">
            <h2
              id="contact-form-heading"
              className="text-xl font-bold tracking-tight"
            >
              Send a message
            </h2>
            <p className="mt-1.5 text-sm text-default-500">
              Every field is required. We reply from the address you enter here.
            </p>
            <div className="mt-7">
              <ContactForm />
            </div>
          </section>

          {/* What we handle */}
          <aside className="lg:pt-1">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-default-500">
              What we can help with
            </h2>
            <ul className="mt-4 space-y-5">
              {reasons.map((reason) => (
                <li key={reason.title} className="flex gap-3">
                  <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    {reason.icon}
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold">{reason.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-default-600">
                      {reason.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-8 border-t border-default/60 pt-5">
              <p className="text-sm leading-relaxed text-default-600">
                Looking for something you can answer yourself? Check the{" "}
                <Link
                  href="/"
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  published articles
                </Link>{" "}
                first — most questions are covered there.
              </p>
            </div>
          </aside>
        </div>

        {/* Existing ad unit — position preserved. */}
        <div className="pb-10">
          <AdBanner />
        </div>
      </Container>
    </div>
  );
};

export default ContactUsPage;
