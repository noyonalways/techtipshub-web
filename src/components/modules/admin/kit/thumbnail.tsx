"use client";

import { HiOutlinePhoto } from "react-icons/hi2";
import { useState } from "react";

interface IProps {
  src?: string;
  /** Empty for a decorative cover; the row's title carries the label. */
  alt?: string;
  size?: number;
  className?: string;
}

/**
 * Article cover in a table row. A plain img rather than next/image: the hosts
 * are not in `next.config`, and next/image throws at render for a missing
 * host. A failed load shows a neutral placeholder, not a broken-image glyph.
 */
const Thumbnail = ({ src, alt = "", size = 40, className = "" }: IProps) => {
  const [failed, setFailed] = useState(false);
  const box =
    "shrink-0 overflow-hidden rounded-[6px] bg-default-100 ring-1 ring-inset ring-default/60 " +
    className;

  if (!src || failed) {
    return (
      <span
        aria-hidden
        className={`${box} flex items-center justify-center text-default-500`}
        style={{ width: size, height: size }}
      >
        <HiOutlinePhoto className="size-4" />
      </span>
    );
  }

  return (
    <span className={box} style={{ width: size, height: size }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        aria-hidden={alt === "" ? true : undefined}
        loading="lazy"
        decoding="async"
        width={size}
        height={size}
        onError={() => setFailed(true)}
        className="size-full object-cover"
      />
    </span>
  );
};

export default Thumbnail;
