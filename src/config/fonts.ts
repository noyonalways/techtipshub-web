import { Fira_Code as FontMono, Fraunces, Inter as FontSans } from "next/font/google";

/** Interface text. Legible at 13 to 15px, which is where most of the site lives. */
export const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const fontMono = FontMono({
  subsets: ["latin"],
  variable: "--font-mono",
});

/**
 * Display face for headings, the wordmark and pull quotes. Fraunces is a
 * variable serif with a soft-once-large optical size: it gives the editorial
 * pages a voice that a geometric sans does not have, while staying quiet at
 * body sizes because body text stays in Inter.
 *
 * The family is registered as `--font-fraunces` on `<body>` by next/font, but
 * `globals.css` names the family literally in `--type-editorial`. Referencing
 * the next/font variable from inside a custom property resolves to nothing in
 * Chromium, which silently left every headline in Inter.
 */
export const fontDisplay = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["SOFT", "WONK", "opsz"],
  weight: "variable",
});
