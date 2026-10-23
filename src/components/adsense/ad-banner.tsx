"use client";

import AdSlot from "./adsense-slot";

/**
 * Backward-compatible shim for the old <AdBanner /> call sites. All framing,
 * reserved height and the single AdSense push live in <AdSlot>; this file only
 * maps the legacy props onto it. New code should import AdSlot directly.
 */
type AdBannerProps = {
  placement?: string;
  className?: string;
};

export default function AdBanner({
  placement = "legacy",
  className,
}: AdBannerProps) {
  return (
    <AdSlot variant="display" placement={placement} className={className} />
  );
}
