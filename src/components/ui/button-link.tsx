import {
  button as buttonStyles,
  type ButtonVariantProps,
} from "@heroui/theme";
import Link from "next/link";
import type { ReactNode } from "react";

interface IProps extends Omit<ButtonVariantProps, "disableRipple" | "disableAnimation"> {
  href: string;
  children: ReactNode;
  startContent?: ReactNode;
  endContent?: ReactNode;
  className?: string;
  /** Stretch to the container width, matching HeroUI's `fullWidth`. */
  fullWidth?: boolean;
  /** Renders the link as solid primary in the same box as a HeroUI button. */
  size?: "sm" | "md" | "lg";
}

/**
 * Link styled as a HeroUI button.
 *
 * Server components cannot pass `next/link` to HeroUI's `<Button as={...}>`,
 * because that would hand a function to a client component. This keeps the
 * same visual tokens while staying fully server-renderable, which matters for
 * SEO and for pages that must not hydrate.
 */
const ButtonLink = ({
  href,
  children,
  startContent,
  endContent,
  className = "",
  fullWidth = false,
  size = "md",
  ...variantProps
}: IProps) => {
  // `variant: "bordered"` is rebuilt with the recipe's own default colour
  // slot rather than `color: "primary"`. The primary pairing stamps
  // `text-primary border-primary` on the element, which outraced the
  // overrides on `className` in source order and left the label at 1.9:1 on
  // paper in the light theme. The default slot is transparent, ink text and a
  // neutral hairline: exactly the secondary look used across the site.
  const { variant, ...rest } = variantProps;
  const secondary = variant === "bordered";
  const recipeProps: Parameters<typeof buttonStyles>[0] = secondary
    ? { radius: "lg", variant: "bordered", color: "default" }
    : { radius: "lg", color: "primary", ...rest };
  return (
    <Link
      href={href}
      className={`${buttonStyles(recipeProps)} ${fullWidth ? "w-full" : ""} inline-flex items-center justify-center gap-2 ${
        size === "sm" ? "px-3 py-2 text-sm" : size === "lg" ? "px-6 py-3 text-base" : "px-4 py-2.5 text-sm"
      } font-semibold ${
        // RecipeProps above already carries the ink label and the transparent
        // fill; the hairline swap and hover wash finish the secondary look.
        secondary
          ? "border border-default-300 text-foreground hover:bg-default-100"
          : ""
      } ${className}`}
    >
      {startContent}
      {children}
      {endContent}
    </Link>
  );
};

export default ButtonLink;
