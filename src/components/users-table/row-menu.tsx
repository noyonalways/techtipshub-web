"use client";

import { focusRing } from "@/components/modules/admin/kit/tau";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { FiChevronDown } from "react-icons/fi";

const MENU_WIDTH = 208;

interface IProps {
  /** Accessible name, e.g. "Actions for Ada Lovelace". */
  label: string;
  children: ReactNode;
}

/**
 * Compact hover target that keeps a menu open to the right. It is a button
 * with `aria-haspopup`, not a hover-only reveal, so touch and keyboard reach
 * the same items: Enter or Space opens, arrows move, Escape closes and returns
 * focus. Item rows from the caller use `role="menuitem"` and close on click.
 *
 * The panel is anchored to the right edge of the trigger instead of the table
 * cell: the table scrolls inside its frame, so an absolutely positioned menu
 * would be clipped at the last column.
 */
export default function RowMenu({ label, children }: IProps) {
  const [open, setOpen] = useState(false);
  const [flipUp, setFlipUp] = useState(false);
  const [offsetRight, setOffsetRight] = useState(0);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;

    const button = buttonRef.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    const panelHeight = panelRef.current?.offsetHeight ?? 0;
    const roomBelow = window.innerHeight - rect.bottom;

    setFlipUp(panelHeight > 0 && roomBelow < panelHeight + 12);
    setOffsetRight(
      Math.max(
        0,
        Math.min(rect.right, window.innerWidth) - window.innerWidth + 8,
      ),
    );

    const item =
      panelRef.current?.querySelector<HTMLElement>('[role="menuitem"]');
    item?.focus({ preventScroll: true });

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (
        !panelRef.current?.contains(target) &&
        !buttonRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    };

    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        buttonRef.current?.focus({ preventScroll: true });
      }
    };

    const onResize = () => setOpen(false);

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onResize, true);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onResize, true);
    };
  }, [open]);

  const onPanelKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const items = Array.from(
      panelRef.current?.querySelectorAll<HTMLElement>(
        '[role="menuitem"]:not([disabled]):not([aria-disabled="true"])',
      ) ?? [],
    );
    if (items.length === 0) return;

    const index = items.indexOf(document.activeElement as HTMLElement);

    if (event.key === "ArrowDown") {
      event.preventDefault();
      items[(index + 1 + items.length) % items.length].focus();
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      items[(index - 1 + items.length) % items.length].focus();
    } else if (event.key === "Home") {
      event.preventDefault();
      items[0].focus();
    } else if (event.key === "End") {
      event.preventDefault();
      items[items.length - 1].focus();
    } else if (event.key === "Tab") {
      setOpen(false);
    }
  };

  return (
    <div className="relative inline-flex justify-end">
      <button
        ref={buttonRef}
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((current) => !current)}
        className={`inline-flex size-11 items-center justify-center rounded-md text-default-600 transition-colors hover:bg-default-100 hover:text-foreground aria-expanded:bg-default-100 aria-expanded:text-foreground sm:size-8 ${focusRing}`}
      >
        <FiChevronDown aria-hidden className="size-4" />
      </button>

      {open && (
        <div
          ref={panelRef}
          id={menuId}
          role="menu"
          aria-label={label}
          onKeyDown={onPanelKeyDown}
          onClick={() => setOpen(false)}
          onContextMenu={(event) => event.preventDefault()}
          style={{
            width: MENU_WIDTH,
            right: offsetRight,
            ...(flipUp
              ? { bottom: "calc(100% + 4px)" }
              : { top: "calc(100% + 4px)" }),
          }}
          className="absolute z-30 rounded-md border border-default/70 bg-content-1 py-1 shadow-[0_6px_20px_rgba(20,19,21,0.12)] dark:shadow-[0_6px_20px_rgba(0,0,0,0.5)]"
        >
          {children}
        </div>
      )}
    </div>
  );
}
