const { heroui } = require("@heroui/theme");

/*
 * TechTipsHub theme.
 *
 * One accent: amber, used only for actions, current state, links and focus.
 * Everything else is a warm neutral, so the page reads like paper and ink
 * rather than a blue-tinted dashboard. Values are hex; HeroUI converts them
 * to the HSL channel variables its classes consume.
 */

/** @typedef {{50:string,100:string,200:string,300:string,400:string,500:string,600:string,700:string,800:string,900:string,DEFAULT:string,foreground:string}} ColorScale */

/** @type {ColorScale} */
const amber = {
  50: "#FEF6E7",
  100: "#FCE9C4",
  200: "#F8D79B",
  300: "#F4C06A",
  400: "#F2A93B",
  500: "#E3961F",
  600: "#C57C10",
  700: "#9C600C",
  800: "#754809",
  900: "#4F3006",
  DEFAULT: "#F2A93B",
  foreground: "#1E1B17",
};

// The dark theme keeps the hue and flips the ramp: amber 400 is the readable
// one on charcoal, so light amber is what dark theme has to use for text.
/** @type {ColorScale} */
const amberDark = {
  50: "#2A2118",
  100: "#3A2C1B",
  200: "#4F3A1E",
  300: "#8A5B10",
  400: "#F2A93B",
  500: "#F4BD63",
  600: "#F8D79B",
  700: "#FCE9C4",
  800: "#FEF6E7",
  900: "#FFFAF0",
  DEFAULT: "#F2A93B",
  foreground: "#1E1B17",
};

/** @type {ColorScale} */
const warm = {
  50: "#FAF7F2",
  100: "#F2EDE4",
  200: "#E4DED2",
  300: "#CFC7B9",
  400: "#A79E90",
  500: "#7C7367",
  600: "#625A50",
  700: "#4A443C",
  800: "#322E29",
  900: "#211E1B",
  DEFAULT: "#CFC7B9",
  foreground: "#1E1B17",
};

/** @type {ColorScale} */
const warmDark = {
  DEFAULT: "#211E1B",
  foreground: "#FCFAF6",
};

// Dark theme flips the neutral ramp so `default-50` stays the quietest surface
// and `default-900` the most prominent, matching how light mode is used.
/** @type {ColorScale} */
const warmDarkRamp = {
  50: "#1B1917",
  100: "#242220",
  200: "#302C29",
  300: "#3D3935",
  400: "#57524C",
  500: "#8A8178",
  600: "#A9A096",
  700: "#C8C0B5",
  800: "#E2DCD2",
  900: "#F5F1EA",
  DEFAULT: "#302C29",
  foreground: "#FCFAF6",
};

const ink = {
  DEFAULT: "#101010",
  foreground: "#1E1B17",
};

const paper = {
  background: "#FCFAF6",
  foreground: "#1E1B17",
};

// Status hues borrow the amber ramp only for the steps they do not override;
// their 600 and 900 are kept explicit so a status colour never drifts amber.
/** @type {ColorScale} */
const successLight = { ...amber, DEFAULT: "#2F7D4F", foreground: "#FFFFFF", 600: "#3F9A64", 900: "#1C5B37" };
/** @type {ColorScale} */
const warningLight = { ...amber, DEFAULT: "#9A5F08", foreground: "#FFFFFF", 600: "#B8730C", 900: "#7A4A05" };
/** @type {ColorScale} */
const dangerLight = { ...amber, DEFAULT: "#B3261E", foreground: "#FFFFFF", 600: "#D14A40", 900: "#8A1C16" };
/** @type {ColorScale} */
const dangerDark = { ...amberDark, DEFAULT: "#E4635A", foreground: "#1E0F0E", 600: "#E4635A", 900: "#7A2B26" };
/** @type {ColorScale} */
const successDark = { ...amberDark, DEFAULT: "#4FA97A", foreground: "#0D1F15", 600: "#4FA97A", 900: "#1D4A33" };
/** @type {ColorScale} */
const warningDark = { ...amberDark, DEFAULT: "#F2A93B", foreground: "#1E1B17", 600: "#F2A93B", 900: "#6E4708" };

const themes = {
  light: {
    colors: {
      background: paper.background,
      foreground: paper.foreground,
      focus: amber[600],
      overlay: "#1E1B17",
      divider: "rgba(30, 27, 23, 0.12)",
      content1: "#FFFFFF",
      content2: "#F5F0E8",
      content3: "#EBE4D8",
      content4: "#DDD4C5",
      default: warm,
      primary: amber,
      secondary: ink,
      success: successLight,
      warning: warningLight,
      danger: dangerLight,
    },
  },
  dark: {
    colors: {
      background: "#141315",
      foreground: "#F2EDE4",
      focus: amber.DEFAULT,
      overlay: "#000000",
      divider: "rgba(242, 237, 228, 0.14)",
      content1: "#211F1F",
      content2: "#2A2727",
      content3: "#353131",
      content4: "#443F3F",
      default: warmDarkRamp,
      primary: amberDark,
      secondary: ink,
      success: successDark,
      warning: warningDark,
      danger: dangerDark,
    },
  },
};

const heroUI = {
  defaultTheme: /** @type {"dark"} */ ("dark"),
  layout: {
    radius: { small: "6px", medium: "10px", large: "12px" },
    dividerWeight: "1px",
  },
  themes,
};

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
        display: ["var(--font-fraunces)", "Georgia", "serif"],
      },
      typography: {
        // Editors set colour through prose modifiers, so the serif only has to
        // supply the face and the heading weight, not a palette.
        DEFAULT: {
          css: {
            "h1, h2, h3, h4": {
              fontFamily: "var(--font-fraunces), Georgia, serif",
              fontWeight: "600",
              letterSpacing: "-0.01em",
            },
          },
        },
      },
    },
  },
  plugins: [heroui(heroUI)],
};
