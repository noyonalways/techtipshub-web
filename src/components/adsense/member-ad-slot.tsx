"use client";

import AdSlot, { type AdSlotProps } from "./adsense-slot";
import { useCanReadArticle } from "@/components/modules/blog/article-access";

/**
 * An in-article ad inside the member-only half of an article page.
 *
 * The article document is prerendered with the whole body, so this slot is in
 * the mark-up of every cached copy. AdSense must only see it when the reader is
 * actually shown the body: loading a unit into a `display: none` column for
 * every visitor is what turns into policy trouble.
 *
 * So the slot mounts only after the reader has been confirmed as a member —
 * the same answer that reveals the body around it.
 */
const MemberAdSlot = (props: AdSlotProps) => {
  const canRead = useCanReadArticle();
  return canRead ? <AdSlot {...props} /> : null;
};

export default MemberAdSlot;
