"use client";

import {
  Avatar,
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useId, useRef } from "react";
import { FiChevronDown, FiExternalLink, FiLogOut, FiX } from "react-icons/fi";
import { HiOutlineCog6Tooth, HiOutlinePencilSquare } from "react-icons/hi2";
import {
  TbLayoutSidebarLeftCollapse,
  TbLayoutSidebarLeftExpand,
} from "react-icons/tb";
import { logOutUser } from "@/services/auth";
import { useUser } from "@/context/user.provider";
import {
  ADMIN_GROUPS,
  adminLinks,
  findAdminLink,
  navIcon,
} from "./admin-links";
import { useAdminShell } from "./admin-shell";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const rowBase =
  "group/nav relative flex items-center rounded-[6px] text-sm transition-colors";

/**
 * Admin navigation: a fixed rail at lg and up (collapsible to icons), a focus
 * trapped drawer below it. The rail is the quiet surface; the active screen is
 * the one place the amber appears.
 */
const AdminSidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, setIsLoading: setUserLoading } = useUser();
  const { isNavOpen, closeNav, isRailCollapsed, toggleRail } = useAdminShell();

  const panelRef = useRef<HTMLDivElement>(null);
  const triggerFocusRef = useRef<HTMLElement | null>(null);
  const groupId = useId();

  const current = findAdminLink(pathname);

  useEffect(() => {
    if (!isNavOpen) return;

    const panel = panelRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    triggerFocusRef.current = document.activeElement as HTMLElement | null;

    panel
      ?.querySelector<HTMLElement>('a[href], button:not([tabindex="-1"])')
      ?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeNav();
        return;
      }
      if (event.key !== "Tab" || !panel) return;

      const focusable = Array.from(
        panel.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => element.offsetParent !== null);

      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isNavOpen, closeNav]);

  // Hand focus back to whatever opened the drawer.
  useEffect(() => {
    if (isNavOpen) return;
    const previous = triggerFocusRef.current;
    triggerFocusRef.current = null;
    if (previous && document.contains(previous)) previous.focus();
  }, [isNavOpen]);

  // A route change means the drawer has done its job, so every nav link
  // closes it on click. The rail is untouched by a navigation.

  const handleLogout = async () => {
    await logOutUser();
    setUserLoading(true);
    closeNav();
    router.push("/");
  };

  const brand = (collapsed = false) => (
    <Link
      href="/admin/dashboard"
      className={`flex min-w-0 items-center gap-2.5 rounded-[6px] ${focusRing} ${
        collapsed ? "justify-center" : ""
      }`}
      aria-label="TechTipsHub admin dashboard"
    >
      {/* The mark is the one amber fill at rest, here paired with a small
          section switcher affordance so the rail reads as the panel's own
          header rather than more nav. */}
      <span className="relative shrink-0">
        <span className="flex size-7 items-center justify-center rounded-[6px] bg-primary text-sm font-bold text-primary-foreground">
          T
        </span>
        <span
          aria-hidden
          className="absolute -bottom-px -right-px size-2.5 rounded-full border-2 border-background bg-default-400"
        />
      </span>
      {!collapsed && (
        <span className="flex min-w-0 flex-col leading-none">
          <span className="truncate font-[family-name:var(--type-editorial)] text-[0.9375rem] font-semibold tracking-[-0.01em] text-foreground">
            TechTipsHub
          </span>
          <span className="mt-1 text-[0.6875rem] font-medium text-default-600">
            Admin panel
          </span>
        </span>
      )}
    </Link>
  );

  const navLink = (
    link: (typeof adminLinks)[number],
    collapsed: boolean,
    onNavigate?: () => void,
  ) => {
    const active = link.href === current?.href;

    return (
      <Link
        href={link.href}
        aria-current={active ? "page" : undefined}
        aria-label={collapsed ? link.label : undefined}
        title={collapsed ? link.label : undefined}
        onClick={onNavigate}
        className={`${rowBase} ${
          collapsed
            ? "mx-2 min-h-11 justify-center lg:min-h-10"
            : "min-h-11 gap-2.5 pl-3 pr-2.5"
        } ${focusRing} ${
          active
            ? "bg-default-100 font-medium text-foreground"
            : "text-default-700 hover:bg-default-100/70 hover:text-foreground"
        }`}
      >
        {!collapsed && (
          <span
            aria-hidden
            className={`absolute inset-y-1.5 left-0 w-[3px] rounded-full transition-colors ${
              active ? "bg-primary" : "bg-transparent"
            }`}
          />
        )}
        <span
          aria-hidden
          className={`shrink-0 transition-colors ${
            active
              ? "text-primary-accessible"
              : "text-default-500 group-hover/nav:text-foreground"
          }`}
        >
          {navIcon(link.icon, collapsed ? 20 : 18)}
        </span>
        {!collapsed && <span className="truncate">{link.label}</span>}
      </Link>
    );
  };

  const nav = (collapsed: boolean, onNavigate?: () => void) => (
    <nav
      aria-label="Admin"
      className="flex min-h-0 flex-1 flex-col overflow-y-auto px-3 pb-3 pt-4"
    >
      {ADMIN_GROUPS.map((groupName) => {
        const links = adminLinks.filter((link) => link.group === groupName);
        if (links.length === 0) return null;

        return (
          <div key={groupName} className="pb-1 last:pb-0">
            {collapsed ? (
              <p
                aria-hidden
                className="mx-auto my-2 h-px w-6 rounded bg-default/60 first:mt-0"
              />
            ) : (
              <p className="tth-label-sm px-3 pb-1.5 pt-4 first:pt-1">
                {groupName}
              </p>
            )}
            <ul className="space-y-0.5">
              {links.map((link) => (
                <li key={link.id}>{navLink(link, collapsed, onNavigate)}</li>
              ))}
            </ul>
          </div>
        );
      })}
    </nav>
  );

  const accountTrigger = (collapsed: boolean) => (
    <DropdownTrigger>
      <Button
        isIconOnly={collapsed}
        variant="light"
        aria-label="Account menu"
        className={`flex h-auto w-full items-center gap-2.5 rounded-[6px] p-1.5 text-left data-[hover=true]:bg-default-100 ${focusRing} ${
          collapsed ? "justify-center" : "justify-start"
        }`}
      >
        <Avatar
          src={user?.profilePicture}
          size="sm"
          className="size-8 shrink-0 object-cover"
          name={(user?.name || user?.username || "?").charAt(0).toUpperCase()}
        />
        {!collapsed && (
          <>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-foreground">
                {user?.name || user?.username || "Signed in"}
              </span>
              <span className="block truncate text-xs text-default-600">
                {user?.role ?? "Admin"}
              </span>
            </span>
            <FiChevronDown
              aria-hidden
              className="size-4 shrink-0 text-default-500"
            />
          </>
        )}
      </Button>
    </DropdownTrigger>
  );

  const footer = (collapsed: boolean) => (
    <div className="shrink-0 border-t border-default/60 px-3 py-2">
      <Dropdown placement="right-end" shouldBlockScroll={false}>
        {accountTrigger(collapsed)}
        <DropdownMenu aria-label="Account" classNames={{ base: "min-w-56" }}>
          <DropdownItem
            key="articles"
            as={Link}
            href="/me/blogs"
            startContent={
              <HiOutlinePencilSquare aria-hidden className="size-4" />
            }
          >
            Your articles
          </DropdownItem>
          <DropdownItem
            key="settings"
            as={Link}
            href="/settings"
            startContent={<HiOutlineCog6Tooth aria-hidden className="size-4" />}
          >
            Account settings
          </DropdownItem>
          <DropdownItem
            key="site"
            as={Link}
            href="/"
            startContent={<FiExternalLink aria-hidden className="size-4" />}
          >
            Back to the site
          </DropdownItem>
          <DropdownItem
            key="logout"
            color="danger"
            onPress={handleLogout}
            startContent={<FiLogOut aria-hidden className="size-4" />}
          >
            Log out
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </div>
  );

  return (
    <>
      {isNavOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close admin menu"
            tabIndex={-1}
            onClick={closeNav}
            className="absolute inset-0 cursor-default bg-overlay/50"
          />
          <div
            ref={panelRef}
            id="admin-nav-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Admin menu"
            className="absolute inset-y-0 left-0 flex w-[min(18rem,88vw)] flex-col border-r border-default/60 bg-background shadow-xl"
          >
            <div className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-default/60 px-3">
              {brand()}
              <button
                type="button"
                onClick={closeNav}
                className={`inline-flex size-11 items-center justify-center rounded-[6px] text-default-600 transition-colors hover:bg-default-100 hover:text-foreground ${focusRing}`}
              >
                <FiX aria-hidden className="size-5" />
                <span className="sr-only">Close admin menu</span>
              </button>
            </div>
            {nav(false, closeNav)}
            {footer(false)}
          </div>
        </div>
      )}

      <aside
        id={groupId}
        data-collapsed={isRailCollapsed ? "true" : undefined}
        className={`hidden shrink-0 self-start border-r border-default/60 bg-background/60 lg:sticky lg:top-0 lg:flex lg:h-[100dvh] lg:flex-col ${
          isRailCollapsed ? "lg:w-[4.25rem]" : "lg:w-60"
        }`}
      >
        <div
          className={`flex h-14 shrink-0 items-center border-b border-default/60 ${
            isRailCollapsed ? "justify-center px-2" : "justify-between px-3"
          }`}
        >
          {brand(isRailCollapsed)}
          {!isRailCollapsed && (
            <button
              type="button"
              onClick={toggleRail}
              aria-pressed={isRailCollapsed}
              className={`inline-flex size-9 items-center justify-center rounded-[6px] text-default-500 transition-colors hover:bg-default-100 hover:text-foreground ${focusRing}`}
            >
              <TbLayoutSidebarLeftCollapse
                aria-hidden
                className="size-[18px]"
              />
              <span className="sr-only">Collapse the navigation rail</span>
            </button>
          )}
        </div>

        {nav(isRailCollapsed)}
        {footer(isRailCollapsed)}

        {isRailCollapsed && (
          <div className="flex shrink-0 justify-center border-t border-default/60 py-2">
            <button
              type="button"
              onClick={toggleRail}
              aria-pressed={isRailCollapsed}
              className={`inline-flex size-10 items-center justify-center rounded-[6px] text-default-500 transition-colors hover:bg-default-100 hover:text-foreground ${focusRing}`}
            >
              <TbLayoutSidebarLeftExpand aria-hidden className="size-5" />
              <span className="sr-only">Expand the navigation rail</span>
            </button>
          </div>
        )}
      </aside>
    </>
  );
};

export default AdminSidebar;
