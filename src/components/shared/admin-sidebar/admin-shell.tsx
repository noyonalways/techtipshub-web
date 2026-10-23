"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

/**
 * State the sidebar and the top bar share: the phone drawer, and the desktop
 * rail width. The rail choice is persisted so the layout does not flip back
 * on every navigation.
 */
interface AdminShellValue {
  isNavOpen: boolean;
  openNav: () => void;
  closeNav: () => void;
  isRailCollapsed: boolean;
  toggleRail: () => void;
}

const AdminShellContext = createContext<AdminShellValue | undefined>(undefined);

export const ADMIN_RAIL_STORAGE_KEY = "tth-admin-rail";

export function AdminShellProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isNavOpen, setIsNavOpen] = useState(false);
  // Read once on mount: the rail choice is a display preference, not screens
  // state, and reading it lazily keeps the server markup stable.
  const [isRailCollapsed, setIsRailCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return (
        window.localStorage.getItem(ADMIN_RAIL_STORAGE_KEY) === "collapsed"
      );
    } catch {
      return false;
    }
  });

  const openNav = useCallback(() => setIsNavOpen(true), []);
  const closeNav = useCallback(() => setIsNavOpen(false), []);

  const toggleRail = useCallback(() => {
    setIsRailCollapsed((current) => {
      const next = !current;
      try {
        window.localStorage.setItem(
          ADMIN_RAIL_STORAGE_KEY,
          next ? "collapsed" : "expanded",
        );
      } catch {
        // The toggle still works for this visit.
      }
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      isNavOpen,
      openNav,
      closeNav,
      isRailCollapsed,
      toggleRail,
    }),
    [isNavOpen, openNav, closeNav, isRailCollapsed, toggleRail],
  );

  return (
    <AdminShellContext.Provider value={value}>
      {children}
    </AdminShellContext.Provider>
  );
}

export function useAdminShell() {
  const context = useContext(AdminShellContext);
  if (!context) {
    throw new Error("useAdminShell must be used inside AdminShellProvider");
  }
  return context;
}
