import ButtonLink from "@/components/ui/button-link";
import { FiArrowLeft, FiLogIn } from "react-icons/fi";

interface IProps {
  /** `notFound` when the slug resolves to nothing; `auth` when the body is withheld. */
  kind: "notFound" | "auth";
  loginHref: string;
}

const states = {
  notFound: {
    label: "Article not found",
    title: "We could not find that article",
    line: "It may have been removed, or the link may be wrong.",
    primary: { href: "/", text: "Back to the feed", icon: <FiArrowLeft aria-hidden /> },
    secondary: { href: "/?sort=popular", text: "Read what is popular" },
  },
  auth: {
    label: "Members only",
    title: "Sign in to read this article",
    line: "The full article is open to members. An account is free.",
    primary: { href: "", text: "Log in", icon: <FiLogIn aria-hidden /> },
    secondary: { href: "/signup", text: "Create account" },
  },
} as const;

/**
 * The article column when there is nothing to read: a small label, the one
 * sentence that explains it, and exactly two ways forward. Deliberately not
 * a full page of apology; the site frame stays where it is.
 */
const ArticleState = ({ kind, loginHref }: IProps) => {
  const state = states[kind];
  const primaryHref = kind === "auth" ? loginHref : state.primary.href;

  return (
    <div className="mx-auto max-w-read pt-10 sm:pt-16 print:pt-0">
      <p className="tth-label text-primary-accessible">{state.label}</p>
      <h1 className="mt-3 text-pretty font-[family-name:var(--type-editorial)] text-[1.75rem] font-semibold leading-[1.15] tracking-[-0.015em] sm:text-4xl">
        {state.title}
      </h1>
      <p className="mt-3 max-w-md text-[0.95rem] leading-relaxed text-default-600">
        {state.line}
      </p>
      <div className="mt-7 flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:gap-3">
        <ButtonLink
          href={primaryHref}
          color="primary"
          startContent={state.primary.icon}
          className="min-h-11 w-full sm:w-auto"
        >
          {state.primary.text}
        </ButtonLink>
        <ButtonLink
          href={state.secondary.href}
          variant="bordered"
          className="min-h-11 w-full sm:w-auto"
        >
          {state.secondary.text}
        </ButtonLink>
      </div>
    </div>
  );
};

export default ArticleState;
