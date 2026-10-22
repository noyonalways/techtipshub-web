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
  return (
    <Link
      href={href}
      className={`${buttonStyles({
        radius: "lg",
        color: "primary",
        ...variantProps,
      })} ${fullWidth ? "w-full" : ""} inline-flex items-center justify-center gap-2 ${
        size === "sm" ? "px-3 py-2 text-sm" : size === "lg" ? "px-6 py-3 text-base" : "px-4 py-2.5 text-sm"
      } font-semibold ${className}`}
    >
      {startContent}
      {children}
      {endContent}
    </Link>
  );
};

export default ButtonLink;
