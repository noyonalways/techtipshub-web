"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * The width of a box, measured.
 *
 * A day chart has to decide how many x-axis labels its plot can hold, and that
 * number is a property of the pixels it was given, not of the viewport: the
 * dashboard and the analytics chart sit in different columns at the same screen
 * width. `width` stays 0 until the first measurement, which is the signal to
 * hold the frame instead of drawing with a guessed tick count.
 */
export function useElementWidth<T extends HTMLElement>() {
  const [width, setWidth] = useState(0);
  const observer = useRef<ResizeObserver | null>(null);

  const ref = useCallback((node: T | null) => {
    observer.current?.disconnect();
    observer.current = null;

    if (!node) return;

    if (typeof ResizeObserver === "undefined") {
      setWidth(node.getBoundingClientRect().width);
      return;
    }

    const measure = (next: number) => {
      // Round down so a sub-pixel resize does not re-render every frame.
      setWidth((current) =>
        Math.abs(current - next) < 1 ? current : Math.floor(next),
      );
    };

    measure(node.getBoundingClientRect().width);

    const resize = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) measure(entry.contentRect.width);
    });

    resize.observe(node);
    observer.current = resize;
  }, []);

  useEffect(() => () => observer.current?.disconnect(), []);

  return { ref, width };
}
