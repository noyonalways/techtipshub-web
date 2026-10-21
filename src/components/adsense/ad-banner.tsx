"use client";

import { useEffect } from "react";

type AdBannerProps = {
  dataAdSlot?: string;
  dataAdFormat?: string;
  dataFullWidthResponsive?: boolean;
};

const AdBanner = ({
  dataAdFormat = "auto",
  dataAdSlot = "9749465109",
  dataFullWidthResponsive = true,
}: AdBannerProps) => {

  useEffect(() => {
    try {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push(
        {}
      );
    } catch (error: any) {
      console.log(error.message);
    }
  }, []);
  

  return (
    <ins
      className="adsbygoogle"
      style={{ display: "block" }}
      data-ad-client="ca-pub-6721594154492556"
      data-ad-slot={dataAdSlot}
      data-ad-format={dataAdFormat}
      data-full-width-responsive={dataFullWidthResponsive.toString()}
    ></ins>
  );
};

export default AdBanner;