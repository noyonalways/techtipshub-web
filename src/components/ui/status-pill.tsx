"use client";

import Link from "next/link";
import type { ReactNode } from "react";

type Tone = "neutral" | "success" | "warning" | "danger" | "primary";

const tones: Record<Tone, string> = {
  neutral: "border-default/60 bg-default-50 text-default-600",
  success: "border-success/30 bg-success/10 text-success",
  warning: "border-warning/30 bg-warning/10 text-warning",
  danger: "border-danger/30 bg-danger/10 text-danger",
  primary: "border-primary/30 bg-primary/10 text-primary",
};

interface IProps {
  children: ReactNode;
  tone?: Tone;
  /** A dot reads as "live state"; omit for static labels. */
  dot?: boolean;
  href?: string;
  className?: string;
}

/** Small, flat status marker used across the dense admin screens. */
const StatusPill = ({
  children,
  tone = "neutral",
  dot = false,
  href,
  className = "",
}: IProps) => {
  const classes = `inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium tabular-nums ${tones[tone]} ${className}`;

  const content = (
    <>
      {dot && (
        <span
          aria-hidden
          className="size-1.5 rounded-full bg-current"
        />
      )}
      {children}
    </>
  );

  return href ? (
    <Link href={href} className={`${classes} transition-opacity hover:opacity-80`}>
      {content}
    </Link>
  ) : (
    <span className={classes}>{content}</span>
  );
};

export default StatusPill;
