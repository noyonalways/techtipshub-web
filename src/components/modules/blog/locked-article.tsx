import ButtonLink from "@/components/ui/button-link";
import { FiLock } from "react-icons/fi";

interface IProps {
  loginHref: string;
}

/**
 * A guest reached a real article whose body the API withheld. The header above
 * already shows who wrote it; this block is the single thing to do about it.
 */
const LockedArticle = ({ loginHref }: IProps) => {
  // Only what the member area actually offers; no invented benefits.
  const nextSteps = [
    "Read the full body of this article.",
    "Comment on it and vote on whether it helped.",
    "Follow the writer and keep up with what they publish next.",
  ];

  return (
    <section
      aria-label="Sign in to keep reading"
      className="mt-12 border-t border-default/60 pt-6"
    >
      <p className="tth-label text-primary-accessible">
        <FiLock aria-hidden className="mr-1.5 inline size-3.5 align-[-2px]" />
        Members read the full article
      </p>

      <p
        id="locked-article"
        className="mt-3 font-[family-name:var(--type-editorial)] text-2xl font-semibold leading-[1.2] tracking-[-0.01em]"
      >
        Sign in to keep reading
      </p>

      <p className="mt-2 max-w-md text-[0.95rem] leading-relaxed text-default-600">
        This article is available to members of TechTipsHub.
      </p>

      <ul className="mt-5 max-w-md space-y-2 text-sm leading-relaxed text-default-700">
        {nextSteps.map((step) => (
          <li key={step} className="flex gap-2.5">
            <span aria-hidden className="mt-[0.6em] h-px w-3 shrink-0 bg-default-400" />
            {step}
          </li>
        ))}
      </ul>

      <div className="mt-7 flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:gap-3">
        <ButtonLink
          href={loginHref}
          color="primary"
          className="min-h-11 w-full sm:w-auto"
        >
          Log in
        </ButtonLink>
        <ButtonLink
          href="/signup"
          variant="bordered"
          className="min-h-11 w-full sm:w-auto"
        >
          Create a free account
        </ButtonLink>
      </div>
    </section>
  );
};

export default LockedArticle;
