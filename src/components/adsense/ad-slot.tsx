"use client";

import AdSlot, { type AdSlotProps } from "./adsense-slot";

/**
 * Legacy wrapper kept so pages that imported `ad-slot` keep compiling. It no
 * longer nests an <AdBanner>; extra props are passed straight to <AdSlot>.
 * `children` is accepted and ignored, because the old call sites used it.
 */
type AdSlotWrapperProps = Partial<AdSlotProps> & {
  children?: React.ReactNode;
};

export default function AdSlotWrapper({
  variant = "display",
  placement = "legacy",
  className,
}: AdSlotWrapperProps) {
  return <AdSlot variant={variant} placement={placement} className={className} />;
}
