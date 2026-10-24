/**
 * AdSense account facts and slot ids, in one place.
 *
 * Only these slots exist on the account. A second responsive display unit is
 * the same slot id with a different `placement` label; creating new slot ids
 * here would ask AdSense for units that were never built in the account.
 *
 * Three unit types are in use, one per snippet in the account:
 * - `display` and `inArticle` reserve height, because a banner either arrives
 *   at a known size or collapses.
 * - `multiplex` never reserves height. Google decides the row and column count
 *   from the container width, so any guessed height would be a hole on the
 *   page. It also must not sit in a height-capped box.
 *
 * `enabled` is read from NEXT_PUBLIC_ADSENSE_ENABLED so local work can drop
 * every ad frame without touching components. Anything other than the string
 * "false" keeps ads on.
 */
type AdVariant = "display" | "inArticle" | "multiplex";

type AdsConfig = {
  readonly client: string;
  readonly slots: {
    readonly display: string;
    readonly inArticle: string;
    readonly multiplex: string;
  };
  readonly enabled: boolean;
  /** Reserved height while an ad is loading, per variant. */
  readonly minHeight: Record<AdVariant, number>;
};

const enabled = process.env.NEXT_PUBLIC_ADSENSE_ENABLED !== "false";

export const adsConfig: AdsConfig = {
  client: "ca-pub-6721594154492556",
  slots: {
    display: "9749465109",
    inArticle: "9132518391",
    multiplex: "3690358132",
  },
  enabled,
  minHeight: {
    display: 280,
    inArticle: 180,
    multiplex: 0,
  },
} as const;

export type { AdVariant };
