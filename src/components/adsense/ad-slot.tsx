import type { ReactNode } from "react";

/**
 * Frame for an ad unit inside editorial pages.
 *
 * AdSense renders a white creative regardless of theme, so an unframed `<ins>`
 * reads as a glitch on a dark page. The label plus hairline border declares the
 * space as advertising and keeps it visually contained. The child keeps its own
 * height (AdSense controls it), so the frame grows with the slot.
 */
const AdSlot = ({ children }: { children: ReactNode }) => (
  <aside
    aria-label="Advertisement"
    className="overflow-hidden rounded-xl border border-default/60 bg-default-50/40"
  >
    <p className="border-b border-default/60 px-3 py-1.5 text-[0.625rem] font-semibold uppercase tracking-wider text-default-400">
      Advertisement
    </p>
    <div className="bg-background">{children}</div>
  </aside>
);

export default AdSlot;
