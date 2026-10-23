"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(max-width: 40rem)";

function subscribe(onChange: () => void) {
  const query = window.matchMedia(QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function getSnapshot() {
  return window.matchMedia(QUERY).matches;
}

function getServerSnapshot() {
  return false;
}

/** True below the `40rem` breakpoint; false on the server so SSR markup is stable. */
export function useIsNarrow() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
