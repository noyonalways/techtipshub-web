"use client";

import { useCallback, useEffect, useState } from "react";

export interface ChartTokens {
  /** Axis ticks and lines. */
  axis: string;
  /** Grid lines and the hover cursor. */
  grid: string;
}

/** Read on the client only: `var()` in an SVG attribute is not dependable. */
const SSR_CHART_TOKENS: ChartTokens = {
  axis: "var(--color-default-600)",
  grid: "var(--color-default-200)",
};

const readToken = (token: string, fallback: string) => {
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(token)
    .trim();

  return value || fallback;
};

const readTokens = (): ChartTokens => ({
  axis: readToken("--color-default-600", "currentColor"),
  grid: readToken("--color-default-200", "currentColor"),
});

/**
 * `var(...)` is valid on the `color` property, so a detached probe element
 * resolves it to a concrete `rgb(...)` string recharts can write into `stroke`
 * and `fill`. Anything that is not a CSS variable passes through untouched.
 */
const resolveCssColour = (colour: string) => {
  if (!colour.includes("var(")) return colour;

  const probe = document.createElement("span");
  probe.style.color = "";
  probe.style.color = colour;
  const resolved = probe.style.color.trim();

  return resolved && resolved !== "" ? resolved : colour;
};

/**
 * Chart colours for the current theme. Tokens are read after mount and read
 * again whenever the theme class on `<html>` flips, so light and dark both
 * draw. `resolved` stays false on the first render, which is what tells the
 * chart to hold its frame instead of drawing with unresolved colours.
 */
export function useChartTheme() {
  const [state, setState] = useState<{
    tokens: ChartTokens;
    resolved: boolean;
  }>({ tokens: SSR_CHART_TOKENS, resolved: false });

  useEffect(() => {
    const read = () => setState({ tokens: readTokens(), resolved: true });

    read();

    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "style", "data-theme"],
    });

    return () => observer.disconnect();
  }, []);

  const resolveColour = useCallback(
    (colour: string) => (state.resolved ? resolveCssColour(colour) : colour),
    [state],
  );

  return { tokens: state.tokens, resolved: state.resolved, resolveColour };
}
