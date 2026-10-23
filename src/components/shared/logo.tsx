import { siteConfig } from "@/config/site";

const markMetrics = {
  sm: { box: 28, word: "text-[0.9375rem]", gap: "gap-2" },
  md: { box: 32, word: "text-base", gap: "gap-2.5" },
  lg: { box: 44, word: "text-2xl", gap: "gap-3.5" },
} as const;

interface MarkProps {
  size?: keyof typeof markMetrics;
  className?: string;
}

/**
 * The TechTipsHub mark: a square tile with a T carved into it. The square is
 * the code block, the letter is the name. The tile is fixed amber 400 and the
 * T is fixed ink in both themes: the carved letter needs a light tile to keep
 * its edge, and the mark is the one element that must look identical on paper
 * and on charcoal.
 */
export const LogoMark = ({ size = "md", className = "" }: MarkProps) => {
  const { box } = markMetrics[size];

  return (
    <svg
      aria-hidden
      className={className}
      fill="none"
      height={box}
      viewBox="0 0 128 128"
      width={box}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect fill="currentColor" height="128" rx="28" width="128" />
      <path d="M42 44h44v11H75v27H63V55H53v27H42V55z" fill="#141315" />
    </svg>
  );
};

interface LogoProps extends MarkProps {
  /** Show the wordmark next to the mark. */
  wordmark?: boolean;
  /** The small line under the wordmark. Off by default: the header is tight. */
  tagline?: boolean;
  /** `light` for light surfaces, `dark` for dark ones. Defaults to `currentColor`. */
  tone?: "auto" | "light" | "dark";
}

/**
 * Horizontal lockup: mark plus wordmark. The name is live text, so it stays
 * selectable, translates with the page and is readable when the SVG fails.
 */
export const Logo = ({
  size = "md",
  wordmark = true,
  tagline = false,
  tone = "auto",
  className = "",
}: LogoProps) => {
  const m = markMetrics[size];
  const toneClass =
    tone === "light" ? "text-[#1E1B17]" : tone === "dark" ? "text-[#F2EDE4]" : "text-foreground";

  return (
    <span className={`inline-flex items-center ${m.gap} ${toneClass} ${className}`}>
      {/*
        The tile is always amber 400 and the T always ink, in both themes.
        It used to inherit `text-primary-accessible`, which is the *text*
        amber: amber 800 on paper. That put the carved T at 2.37:1, so the
        light-mode logo read as a dull brown blob. Amber 400 keeps the mark
        identical to the wordmark's dark-mode look and the T at 9.3:1.
      */}
      <LogoMark size={size} className="shrink-0 text-primary-400" />
      {wordmark && (
        <span className="flex min-w-0 flex-col justify-center leading-none">
          <span className={`font-[family-name:var(--type-editorial)] font-bold tracking-tight ${m.word}`}>
            TechTips<span className="text-primary-accessible">Hub</span>
          </span>
          {tagline && (
            <span className="mt-1 text-[0.625rem] font-medium text-default-600">
              {siteConfig.tagline}
            </span>
          )}
        </span>
      )}
    </span>
  );
};
