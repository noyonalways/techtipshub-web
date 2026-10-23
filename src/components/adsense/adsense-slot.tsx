"use client";

import { useEffect, useId, useRef, useState } from "react";
import clsx from "clsx";
import { adsConfig, type AdVariant } from "@/config/ads";

export type AdSlotProps = {
  /** "display" is the responsive 970/300 unit, "inArticle" the fluid one. */
  variant?: AdVariant;
  /** Optional extra class on the outer <aside>. */
  className?: string;
  /** Where the slot sits, used for the accessible name and a data attribute. */
  placement: string;
};

type FillState = "pending" | "filled" | "unfilled";

type AdSlotElement = HTMLModElement & { adsbygoogle?: Record<string, never> };

/** Marks an <ins> as pushed so a remount of the same node cannot push again. */
const PUSHED_ATTR = "data-tth-pushed";
const SETTLED_ATTR = "data-tth-settled";

let warned = false;

function warnOnce(message: string, error: unknown) {
  if (warned) return;
  warned = true;
  console.warn(`[adsense] ${message}`, error);
}

function adsbygoogleQueue(): Array<Record<string, never>> | undefined {
  const w = window as Window & {
    adsbygoogle?: Array<Record<string, never>>;
  };
  if (!Array.isArray(w.adsbygoogle)) {
    // The loader has not run yet (blocked, or afterInteractive still pending).
    // Pushing into a plain array would be discarded when the real script
    // installs its own queue, so wait for the next mount or navigation.
    return undefined;
  }
  return w.adsbygoogle;
}

function pushOnce(ins: AdSlotElement) {
  if (ins.getAttribute(PUSHED_ATTR) === "true") return;
  if (ins.getAttribute("data-ad-status")) {
    ins.setAttribute(PUSHED_ATTR, "true");
    return;
  }
  const queue = adsbygoogleQueue();
  if (!queue) return;
  try {
    queue.push({});
    ins.setAttribute(PUSHED_ATTR, "true");
  } catch (error) {
    warnOnce("push failed", error);
  }
}

/**
 * One AdSense unit, framed as a footnote rather than a card: a hairline, a
 * small label and reserved height. The <ins> is the only element AdSense is
 * told about, and it is pushed exactly once per mounted node.
 */
export default function AdSlot({
  variant = "display",
  className,
  placement,
}: AdSlotProps) {
  const insRef = useRef<AdSlotElement | null>(null);
  const [fill, setFill] = useState<FillState>("pending");
  const domId = useId();
  const insId = `adsense-${variant}-${domId.replace(/[^a-zA-Z0-9_-]/g, "")}`;

  useEffect(() => {
    const ins = insRef.current;
    if (!ins) return;

    pushOnce(ins);

    const read = () => {
      const status = ins.getAttribute("data-ad-status");
      if (status === "filled") {
        setFill("filled");
        return true;
      }
      if (status === "unfilled") {
        // AdSense reports unfilled and keeps a collapsed container. Settle
        // once the container is measurable so a late "filled" is not missed.
        if (ins.getAttribute(SETTLED_ATTR) === "true") {
          setFill("unfilled");
          return true;
        }
        return false;
      }
      return false;
    };

    if (read()) return;

    const observer = new MutationObserver(() => {
      if (read()) observer.disconnect();
    });
    observer.observe(ins, {
      attributes: true,
      attributeFilter: ["data-ad-status", "style", "height"],
    });
    return () => observer.disconnect();
  }, []);

  if (!adsConfig.enabled) return null;

  const isDisplay = variant === "display";
  const slot = isDisplay ? adsConfig.slots.display : adsConfig.slots.inArticle;
  const minHeight = adsConfig.minHeight[variant];

  // Default: a rule and its label, so the unit reads as a footnote on the
  // page. Pages that want the boxed treatment (a rail, a panel) pass
  // `className="rounded-[10px] border border-default/60 bg-default-50/30 p-3"`.
  return (
    <aside
      aria-label={`Advertisement, ${placement}`}
      data-ad-placement={placement}
      data-ad-variant={variant}
      data-ad-state={fill}
      className={clsx(
        "not-prose mt-10 w-full max-w-full overflow-hidden border-t border-default/60 pt-1",
        className,
      )}
    >
      <p className="flex items-center justify-between gap-3 py-1.5 text-[11px] font-medium leading-4 text-default-600">
        Advertisement
        <span className="sr-only">{placement}</span>
      </p>

      {fill === "unfilled" ? (
        // No creative arrived: the frame collapses to the label plus one
        // quiet line rather than staying as tall as a missing ad.
        <p className="pb-1 text-[11px] leading-4 text-default-500">
          No ad in this placement right now.
        </p>
      ) : (
        <div
          className={clsx(
            fill === "pending"
              ? isDisplay
                ? "min-h-[250px] py-2 sm:min-h-[280px]"
                : "min-h-[180px] py-2"
              : "min-h-0",
          )}
        >
          <ins
            ref={insRef}
            id={insId}
            className="adsbygoogle block w-full"
            style={{ display: "block", minHeight }}
            data-ad-client={adsConfig.client}
            data-ad-slot={slot}
            {...(isDisplay
              ? { "data-ad-format": "auto", "data-full-width-responsive": "true" }
              : { "data-ad-layout": "in-article", "data-ad-format": "fluid" })}
          />
        </div>
      )}
    </aside>
  );
}
