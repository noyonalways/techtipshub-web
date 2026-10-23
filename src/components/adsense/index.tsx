import Script from "next/script";

type AdSenseProps = {
  pubId: string;
};

/**
 * The AdSense loader. Mounted once in the root layout: a second copy of this
 * script on the page makes AdSense warn and can double count impressions.
 * Units themselves come from <AdSlot>.
 */
const AdSense = ({ pubId }: AdSenseProps) => {
  return (
    <Script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${pubId}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
};

export default AdSense;
export { default as AdSlot } from "./adsense-slot";
export type { AdSlotProps } from "./adsense-slot";
