import type { SVGProps } from "react";

/**
 * Icons for the search palette.
 *
 * Drawn on the same grid as the navbar's other glyphs (20 box, 1.25 stroke,
 * round joins) so a palette row and a nav item read as the same set. Each one
 * names the kind of result it sits next to; nothing here is decorative.
 */

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  fill: "none",
  height: 20,
  viewBox: "0 0 20 20",
  width: 20,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  strokeWidth: 1.25,
  "aria-hidden": true,
} as const;

export const ArticleIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <path d="M5 3.5h7l3 3v10H5z" />
    <path d="M8 9h4M8 12h4" />
  </svg>
);

export const CategoryIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <path d="M3.5 8.5v-4a1 1 0 0 1 1-1h4l8 8-5 5-8-8Z" />
    <circle cx="6.75" cy="6.75" r=".9" />
  </svg>
);

export const ProfileIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <circle cx="10" cy="7" r="2.75" />
    <path d="M4.5 16.5c.9-2.6 3-4 5.5-4s4.6 1.4 5.5 4" />
  </svg>
);

export const PageIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <path d="M4.5 3.5h11v13h-11z" />
    <path d="M7.5 10.5l1.75 1.75 3.25-3.5" />
  </svg>
);

export const ThemeIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <path d="M10 3.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13Z" />
    <path d="M10 3.5v13" />
  </svg>
);

export const CommandIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <path d="M7 3.5a2 2 0 1 0 0 4h6M7 16.5a2 2 0 1 0 0-4h6M13 3.5a2 2 0 1 1 0 4H7M13 16.5a2 2 0 1 1 0-4H7" />
  </svg>
);

export const ArrowIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <path d="M4.5 10h11M11.5 6l4 4-4 4" />
  </svg>
);

export const EnterIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <path d="M15.5 4.5v5a2 2 0 0 1-2 2h-9" />
    <path d="M7.5 8.5l-3 3 3 3" />
  </svg>
);
