"use client";

import { useLayoutEffect } from "react";

const SUFFIX = "Admin | TechTipsHub";

/**
 * Document title for an admin screen. Client pages cannot export `metadata`,
 * so each page names itself here and the format lives in one place: the same
 * `<page> | Admin | TechTipsHub` shape the layout's template produced.
 *
 * A layout effect rather than an effect: the title lands with the paint, so a
 * client navigation never flashes the previous screen's name in the tab. The
 * cleanup runs on unmount, when the next page's title is already applied.
 */
export const useAdminTitle = (title: string) => {
  useLayoutEffect(() => {
    document.title = `${title} | ${SUFFIX}`;
  }, [title]);
};
