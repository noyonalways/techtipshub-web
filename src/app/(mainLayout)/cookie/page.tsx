import LegalPage, { type ILegalSection } from "@/components/legal/legal-page";
import LegalTable from "@/components/legal/legal-table";
import { legalConfig } from "@/config/legal";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description:
    "The cookies TechTipsHub uses for sign-in, analytics and advertising, how long they last, and how to control them.",
  alternates: { canonical: "/cookie" },
  openGraph: {
    title: "Cookie Policy",
    description:
      "The cookies TechTipsHub uses for sign-in, analytics and advertising, and how to control them.",
    url: "/cookie",
  },
};

const sections: ILegalSection[] = [
  {
    id: "overview",
    title: "What cookies are",
    content: (
      <>
        <p>
          Cookies are small text files that a website asks your browser to store.
          They let the site remember things between page loads &mdash; most
          importantly, that you are signed in. Similar technologies include
          local storage, which this site uses for your theme choice.
        </p>
        <p>
          This policy explains which cookies TechTipsHub sets, which are set by
          third parties such as Google, what each is for, and how you can
          control them. It should be read with our{" "}
          <Link href="/privacy">Privacy Policy</Link>.
        </p>
      </>
    ),
  },
  {
    id: "necessary",
    title: "Strictly necessary cookies",
    content: (
      <>
        <p>
          These cookies keep you signed in and protect the sign-in process. They
          cannot be switched off through the site because it would not work
          without them.
        </p>
        <LegalTable label="Strictly necessary cookies">
          <table>
            <thead>
              <tr>
                <th>Cookie</th>
                <th>Set by</th>
                <th>Purpose</th>
                <th>Duration</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <code>tth_access_token</code>
                </td>
                <td>TechTipsHub</td>
                <td>
                  Holds your signed-in session so you can publish, comment and
                  vote. HTTP-only and secure in production.
                </td>
                <td>1 year</td>
              </tr>
              <tr>
                <td>
                  <code>tth_refresh_token</code>
                </td>
                <td>TechTipsHub</td>
                <td>
                  Renews your session when the access token expires. HTTP-only
                  and secure in production.
                </td>
                <td>1 year</td>
              </tr>
              <tr>
                <td>
                  <code>next-auth.csrf-token</code>
                </td>
                <td>NextAuth</td>
                <td>
                  Protects the social sign-in flow against cross-site request
                  forgery.
                </td>
                <td>Session</td>
              </tr>
              <tr>
                <td>
                  <code>next-auth.callback-url</code>
                </td>
                <td>NextAuth</td>
                <td>Returns you to the right page after signing in.</td>
                <td>Session</td>
              </tr>
              <tr>
                <td>
                  <code>next-auth.session-token</code>
                </td>
                <td>NextAuth</td>
                <td>
                  Short-lived session created while you sign in with Google,
                  Facebook or GitHub. Secure variants are prefixed{" "}
                  <code>__Secure-</code> or <code>__Host-</code>.
                </td>
                <td>Up to 30 days</td>
              </tr>
            </tbody>
          </table>
        </LegalTable>
        <p>
          Signing out or deleting the cookies from your browser ends the
          session. Because these cookies are required, blocking them will
          prevent you from signing in.
        </p>
      </>
    ),
  },
  {
    id: "analytics",
    title: "Analytics cookies",
    content: (
      <>
        <p>
          We use Google Analytics 4, loaded through Google Tag Manager, to count
          visits and understand which articles are read. The reports we see are
          aggregated.
        </p>
        <LegalTable label="Analytics cookies">
          <table>
            <thead>
              <tr>
                <th>Cookie</th>
                <th>Set by</th>
                <th>Purpose</th>
                <th>Duration</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <code>_ga</code>
                </td>
                <td>Google</td>
                <td>Distinguishes one browser from another.</td>
                <td>2 years</td>
              </tr>
              <tr>
                <td>
                  <code>_ga_M37M4689E8</code>
                </td>
                <td>Google</td>
                <td>Keeps the state of your analytics session.</td>
                <td>2 years</td>
              </tr>
              <tr>
                <td>
                  <code>_gid</code>
                </td>
                <td>Google</td>
                <td>Distinguishes visitors for a shorter period.</td>
                <td>24 hours</td>
              </tr>
            </tbody>
          </table>
        </LegalTable>
        <p>
          You can prevent these cookies with the{" "}
          <a
            href="https://tools.google.com/dlpage/gaoptout"
            rel="noopener noreferrer"
            target="_blank"
          >
            Google Analytics opt-out add-on
          </a>
          , a content blocker, or your browser&rsquo;s cookie settings. The site
          continues to work without them.
        </p>
      </>
    ),
  },
  {
    id: "advertising",
    title: "Advertising cookies",
    content: (
      <>
        <p>
          Advertising through Google AdSense keeps TechTipsHub free to read.
          Google and its partners may set cookies to serve ads based on your
          earlier visits to this and other sites, to limit repetition and to
          measure performance.
        </p>
        <LegalTable label="Advertising cookies">
          <table>
            <thead>
              <tr>
                <th>Cookie</th>
                <th>Set by</th>
                <th>Purpose</th>
                <th>Duration</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <code>__gads</code>, <code>__gpi</code>
                </td>
                <td>Google</td>
                <td>
                  Ad measurement, frequency capping and fraud prevention.
                </td>
                <td>Up to 13 months</td>
              </tr>
              <tr>
                <td>
                  <code>IDE</code>
                </td>
                <td>Google (doubleclick.net)</td>
                <td>
                  Selects and measures personalised advertising across sites.
                </td>
                <td>Up to 13 months</td>
              </tr>
              <tr>
                <td>
                  <code>test_cookie</code>
                </td>
                <td>Google (doubleclick.net)</td>
                <td>Checks whether your browser accepts cookies.</td>
                <td>15 minutes</td>
              </tr>
              <tr>
                <td>
                  <code>_gcl_au</code>
                </td>
                <td>Google</td>
                <td>Measures conversions from advertising.</td>
                <td>90 days</td>
              </tr>
            </tbody>
          </table>
        </LegalTable>
        <p>
          You can turn off personalised advertising in{" "}
          <a
            href="https://adssettings.google.com"
            rel="noopener noreferrer"
            target="_blank"
          >
            Google Ads Settings
          </a>
          . You will still see ads, but they will be based on the page rather
          than your browsing history. You can also opt out of many third-party
          vendors at{" "}
          <a
            href="https://www.aboutads.info/choices/"
            rel="noopener noreferrer"
            target="_blank"
          >
            aboutads.info
          </a>{" "}
          or, in Europe, at{" "}
          <a
            href="https://www.youronlinechoices.eu"
            rel="noopener noreferrer"
            target="_blank"
          >
            Your Online Choices
          </a>
          .
        </p>
      </>
    ),
  },
  {
    id: "third-parties",
    title: "Cookies from other services",
    content: (
      <>
        <p>
          Some features load services that may set their own cookies or receive
          limited technical data:
        </p>
        <ul>
          <li>
            <strong>Payments.</strong> TechTipsHub is free and does not run a
            checkout. If you follow a link to a payment or contribution page, or
            are redirected to one while reporting a charge made in error, that
            provider sets its own cookies on its domain under its own cookie and
            privacy policies. We never see your card details.
          </li>
          <li>
            <strong>Social sign-in.</strong> Choosing Google, Facebook or GitHub
            takes you through that provider&rsquo;s sign-in page, where their
            cookies apply.
          </li>
          <li>
            <strong>Images.</strong> Article images are delivered by Cloudinary.
            Delivery requests may include your IP address and browser details in
            standard server logs.
          </li>
        </ul>
        <p>
          We do not control third-party cookies. Please check the relevant
          provider&rsquo;s policy for details and choices.
        </p>
      </>
    ),
  },
  {
    id: "browser-storage",
    title: "Local storage",
    content: (
      <>
        <p>
          We store your light or dark theme preference in your browser&rsquo;s
          local storage under the key <code>theme</code>. It is not sent to our
          servers and does not identify you. Clearing site data in your browser
          resets it to the default theme.
        </p>
      </>
    ),
  },
  {
    id: "managing",
    title: "Managing cookies",
    content: (
      <>
        <p>
          You can control cookies from your browser settings. Most browsers let
          you view, delete and block cookies, and some let you block them for
          specific sites. Useful guides are published by{" "}
          <a
            href="https://www.allaboutcookies.org/manage-cookies/"
            rel="noopener noreferrer"
            target="_blank"
          >
            All About Cookies
          </a>
          .
        </p>
        <p>What happens if you block cookies:</p>
        <ul>
          <li>
            blocking <strong>strictly necessary</strong> cookies prevents
            sign-in, publishing, commenting and voting;
          </li>
          <li>
            blocking <strong>analytics</strong> cookies has no effect on how the
            site works;
          </li>
          <li>
            blocking <strong>advertising</strong> cookies does not remove ads,
            but they become less relevant.
          </li>
        </ul>
        <p>
          We do not currently show our own cookie banner. Where the law requires
          consent before non-essential cookies are set, you can give or withhold
          that consent through the ad consent message presented by Google, or by
          blocking those cookies in your browser or ad settings as described
          above. Strictly necessary cookies are set regardless, because the
          service cannot function without them.
        </p>
        <p>
          Most browsers also send a &ldquo;Do Not Track&rdquo; signal. There is
          still no common standard for how sites should respond, so we do not act
          on it; use the controls above instead.
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
          We will update this policy if we add or remove a cookie, change
          providers, or the law changes. The date at the top shows the current
          version. Material changes will be announced on the site.
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
          If you have a question about cookies or this policy, email{" "}
          <a href={`mailto:${legalConfig.contactEmail}`}>
            {legalConfig.contactEmail}
          </a>{" "}
          or use the <Link href="/contact">contact form</Link>.
        </p>
      </>
    ),
  },
];

const CookiePolicyPage = () => {
  return (
    <LegalPage
      currentHref="/cookie"
      sections={sections}
      summary="A plain-language list of the cookies behind sign-in, analytics and advertising on TechTipsHub, with the controls available to you."
      title="Cookie Policy"
    />
  );
};

export default CookiePolicyPage;
