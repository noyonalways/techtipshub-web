/**
 * AdSense account facts and slot ids, in one place.
 *
 * Only two slots exist on the account. A second responsive display unit is
 * the same slot id with a different `placement` label; creating new slot ids
 * here would ask AdSense for units that were never built in the account.
 *
 * `enabled` is read from NEXT_PUBLIC_ADSENSE_ENABLED so local work can drop
 * every ad frame without touching components. Anything other than the string
 * "false" keeps ads on.
 */
type AdVariant = "display" | "inArticle";

type AdsConfig = {
  readonly client: string;
  readonly slots: {
    readonly display: string;
    readonly inArticle: string;
  };
  readonly enabled: boolean;
  readonly minHeight: Record<AdVariant, number>;
};

const enabled = process.env.NEXT_PUBLIC_ADSENSE_ENABLED !== "false";

export const adsConfig: AdsConfig = {
  client: "ca-pub-6721594154492556",
  slots: {
    display: "9749465109",
    inArticle: "9132518391",
  },
  enabled,
  minHeight: {
    display: 280,
    inArticle: 180,
  },
} as const;

export type { AdVariant };
