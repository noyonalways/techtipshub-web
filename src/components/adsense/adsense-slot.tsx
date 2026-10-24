"use client";

import { useEffect, useId, useRef, useState } from "react";
import clsx from "clsx";
import { adsConfig, type AdVariant } from "@/config/ads";

export type AdSlotProps = {
  /**
   * "display" is the responsive 970/300 unit, "inArticle" the fluid one,
   * "multiplex" the recommendation grid.
   */
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

/** How long to wait for the loader to install its queue before seeding one. */
const LOADER_WAIT_MS = 4000;
const LOADER_POLL_MS = 150;

/**
 * How long a multiplex grid may stay `unfilled` before the page treats it as
 * declined. The timer only decides when to collapse the frame; the unit stays
 * mounted for the whole page load, because AdSense can fill it after the
 * first verdict or on a later resize.
 */
const MULTIPLEX_SETTLE_MS = 15000;
/** Grace period before trusting the loader's first `unfilled` verdict. */
const MULTIPLEX_GRACE_MS = 5000;

/**
 * AdSense serves one multiplex request per page load, so a grid that comes
 * back empty means the rest of this page load will not serve one either.
 */
const multiplexTimers = new WeakMap<Element, number[]>();

/** Page-load scope: the flag clears on reload, where a fresh request is fair. */
function multiplexDeclined(): boolean {
  return multiplexDeclinedNow;
}

let multiplexDeclinedNow = false;

function markMultiplexDeclined(ins: Element) {
  multiplexDeclinedNow = true;
  ins.setAttribute(SETTLED_ATTR, "true");
  ins.setAttribute("data-ad-status", "unfilled");
}

function scheduleMultiplexSettle(ins: Element) {
  clearMultiplexSettle(ins);
  const timers = [
    // First pass: the loader reports `unfilled` before it fills the grid, so
    // only collapse if it is still empty after a short grace period.
    window.setTimeout(() => {
      if (ins.getAttribute("data-ad-status") !== "filled") {
        ins.setAttribute(SETTLED_ATTR, "true");
      }
    }, MULTIPLEX_GRACE_MS),
    // Final pass: nothing arrived. Treat the page load as declined so later
    // articles in this render do not reserve space for a grid that cannot fill.
    window.setTimeout(() => {
      if (ins.getAttribute("data-ad-status") !== "filled") {
        markMultiplexDeclined(ins);
      }
    }, MULTIPLEX_SETTLE_MS),
  ];
  multiplexTimers.set(ins, timers);
}

function clearMultiplexSettle(ins: Element) {
  const timers = multiplexTimers.get(ins);
  if (timers) {
    timers.forEach((timer) => window.clearTimeout(timer));
    multiplexTimers.delete(ins);
  }
}

let warned = false;

function warnOnce(message: string, error: unknown) {
  if (warned) return;
  warned = true;
  console.warn(`[adsense] ${message}`, error);
}

type AdsQueue = Array<Record<string, never>>;

function adsbygoogleQueue(): AdsQueue | undefined {
  const w = window as Window & { adsbygoogle?: AdsQueue };
  // Not `Array.isArray`: once the loader runs, `adsbygoogle` is an object with
  // a `push`, not the plain array the snippet in ads.txt uses.
  if (!w.adsbygoogle || typeof w.adsbygoogle.push !== "function") {
    return undefined;
  }
  return w.adsbygoogle;
}

function pushOnce(ins: AdSlotElement, queue: AdsQueue) {
  if (ins.getAttribute(PUSHED_ATTR) === "true") return;
  if (ins.getAttribute("data-ad-status")) {
    ins.setAttribute(PUSHED_ATTR, "true");
    return;
  }
  try {
    queue.push({});
    ins.setAttribute(PUSHED_ATTR, "true");
  } catch (error) {
    warnOnce("push failed", error);
  }
}

function waitForQueue(): Promise<AdsQueue> {
  return new Promise((resolve) => {
    const started = Date.now();
    const poll = () => {
      const queue = adsbygoogleQueue();
      if (queue) {
        resolve(queue);
        return;
      }
      if (Date.now() - started >= LOADER_WAIT_MS) {
        // Loader blocked or slower than us. The push cannot reach Google now,
        // but the loader scans `ins.adsbygoogle` when it finally arrives, so
        // give it a queue that accepts the push instead of an array it never
        // drains.
        const w = window as Window & { adsbygoogle?: AdsQueue };
        const seeded = [] as unknown as AdsQueue;
        (seeded as { push: (item: Record<string, never>) => number }).push = () => 0;
        w.adsbygoogle = seeded;
        resolve(seeded);
        return;
      }
      window.setTimeout(poll, LOADER_POLL_MS);
    };
    poll();
  });
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
  const isMultiplex = variant === "multiplex";
  const isDisplay = variant === "display";
  const isMultiplexUnit = isMultiplex;

  useEffect(() => {
    const ins = insRef.current;
    if (!ins) return;

    let cancelled = false;
    const push = (queue: AdsQueue) => {
      if (cancelled) return;
      pushOnce(ins, queue);
    };

    const queue = adsbygoogleQueue();
    if (queue) {
      push(queue);
    } else {
      // The effect runs on the first mount, before the afterInteractive loader
      // (or a client navigation on a page that already holds it) has set up
      // `adsbygoogle`. Pushing into a bare array is lost, so wait for it.
      void waitForQueue().then(push);
    }

    const read = () => {
      const status = ins.getAttribute("data-ad-status");
      if (status === "filled") {
        setFill("filled");
        return true;
      }
      if (status === "unfilled" && !isMultiplexUnit) {
        // AdSense collapses a rejected or empty unit to zero height. Settle
        // once it has measured so a late "filled" is not missed.
        if (ins.getAttribute(SETTLED_ATTR) === "true" || ins.offsetHeight === 0) {
          setFill("unfilled");
          return true;
        }
        return false;
      }
      if (isMultiplexUnit && ins.getAttribute(SETTLED_ATTR) === "true") {
        // Only the settle timers set this, never the loader's first verdict.
        setFill("unfilled");
        return true;
      }
      return false;
    };

    const observer = new MutationObserver(() => {
      if (read()) observer.disconnect();
    });
    observer.observe(ins, {
      attributes: true,
      attributeFilter: ["data-ad-status", "style", "height"],
    });

    if (read()) {
      observer.disconnect();
    } else if (isMultiplexUnit) {
      // The loader reports `unfilled` right away for a multiplex unit and can
      // fill the grid later. Tearing down on that first verdict would unmount
      // the <ins> mid-load and lose the grid, so the timers decide instead.
      scheduleMultiplexSettle(ins);
    }

    const cleanup = () => {
      cancelled = true;
      observer.disconnect();
      clearMultiplexSettle(ins);
    };
    return cleanup;
  }, [variant, isMultiplexUnit]);

  if (!adsConfig.enabled) return null;

  // A multiplex grid that already came back empty this page load stays out of
  // the page instead of reserving space for a request that cannot be served.
  if (isMultiplex && fill === "pending" && multiplexDeclined()) return null;

  const slot = isMultiplex
    ? adsConfig.slots.multiplex
    : isDisplay
      ? adsConfig.slots.display
      : adsConfig.slots.inArticle;
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
        // quiet line rather than staying as tall as a missing ad. Print and
        // unfilled units also drop out of the flow entirely, which is what
        // Google recommends for an unfilled <ins>.
        <p className="pb-1 text-[11px] leading-4 text-default-500">
          No ad in this placement right now.
        </p>
      ) : (
        <div
          className={clsx(
            fill === "pending" && !isMultiplex
              ? isDisplay
                ? "min-h-[250px] py-2 sm:min-h-[280px]"
                : "min-h-[180px] py-2"
              : "min-h-0",
            // A multiplex grid is as tall as the rows Google decides to
            // show. Never cap it: a capped container returns a blank unit.
            isMultiplex && "pb-2",
          )}
        >
          <ins
            ref={insRef}
            id={insId}
            className="adsbygoogle block w-full"
            style={{ display: "block", minHeight }}
            data-ad-client={adsConfig.client}
            data-ad-slot={slot}
            {...(isMultiplex
              ? { "data-ad-format": "autorelaxed" }
              : isDisplay
                ? { "data-ad-format": "auto", "data-full-width-responsive": "true" }
                : { "data-ad-layout": "in-article", "data-ad-format": "fluid" })}
          />
        </div>
      )}
    </aside>
  );
}
