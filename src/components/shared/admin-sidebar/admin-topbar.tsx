"use client";

import {
  Avatar,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { FiExternalLink, FiLogOut, FiSearch } from "react-icons/fi";
import { HiOutlineCog6Tooth, HiOutlinePencilSquare } from "react-icons/hi2";
import { MdMenu } from "react-icons/md";
import { ThemeSwitch } from "@/components/ui/theme-switch";
import { useUser } from "@/context/user.provider";
import { useAdminSearch } from "@/hooks/admin";
import { logOutUser } from "@/services/auth";
import { findAdminLink } from "./admin-links";
import { useAdminShell } from "./admin-shell";

interface SearchResult {
  key: string;
  group: string;
  href: string;
  title: string;
  detail?: string;
  avatar?: string;
}

interface SearchPayload {
  blogs?: { _id?: string; title?: string; slug?: string }[];
  members?: {
    _id?: string;
    fullName?: string;
    username?: string;
    email?: string;
    profilePicture?: string;
  }[];
  categories?: { _id?: string; name?: string }[];
}

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const EDITABLE_TAGS = new Set(["INPUT", "TEXTAREA", "SELECT"]);

const isTypingTarget = (target: EventTarget | null) => {
  const element = target as HTMLElement | null;
  if (!element) return false;
  return EDITABLE_TAGS.has(element.tagName) || element.isContentEditable;
};

/**
 * Search state lives in a component keyed by the path, so arriving on a new
 * screen closes the panel and empties the field without an effect that would
 * reset state after a render.
 */
function AdminSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [picked, setPicked] = useState(0);

  const baseId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const trimmed = query.trim();
  const { data, isFetching, isError } = useAdminSearch(trimmed);
  const payload = (data as { data?: SearchPayload } | undefined)?.data;

  const results = useMemo<SearchResult[]>(() => {
    const items: SearchResult[] = [];

    (payload?.blogs ?? []).forEach((blog, index) => {
      if (!blog?.slug || !blog?.title) return;
      items.push({
        key: `blog-${blog._id ?? index}`,
        group: "Articles",
        href: `/blogs/${blog.slug}`,
        title: blog.title,
      });
    });

    (payload?.members ?? []).forEach((member) => {
      if (!member?._id) return;
      items.push({
        key: `member-${member._id}`,
        group: "Members",
        href: `/admin/manage-users/${member._id}`,
        title:
          member.fullName ||
          member.username ||
          member.email ||
          "Unnamed member",
        detail: member.username ? `@${member.username}` : member.email,
        avatar: member.profilePicture,
      });
    });

    (payload?.categories ?? []).forEach((category) => {
      if (!category?._id || !category?.name) return;
      items.push({
        key: `category-${category._id}`,
        group: "Categories",
        href: `/admin/categories?q=${encodeURIComponent(category.name)}`,
        title: category.name,
        detail: "Open in Categories",
      });
    });

    return items;
  }, [payload]);

  // Clamped rather than stored-and-reset: a late answer for an older query
  // can never leave the highlight pointing past the end of the list.
  const activeIndex = Math.min(picked, Math.max(results.length - 1, 0));

  const closeSearch = useCallback(() => setIsOpen(false), []);

  // Ctrl K opens from anywhere; "/" opens when the caret is not in a field.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const isShortcut =
        (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";
      const isSlash =
        event.key === "/" &&
        !isTypingTarget(event.target) &&
        !event.metaKey &&
        !event.ctrlKey;

      if (!isShortcut && !isSlash) return;
      event.preventDefault();
      setIsOpen(true);
      window.requestAnimationFrame(() => inputRef.current?.focus());
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const onPointerDown = (event: PointerEvent) => {
      if (rootRef.current?.contains(event.target as Node)) return;
      closeSearch();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      closeSearch();
      triggerRef.current?.focus();
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, closeSearch]);

  const goToResult = (result: SearchResult) => {
    setQuery("");
    closeSearch();
    router.push(result.href);
  };

  const onInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (results.length) setPicked((activeIndex + 1) % results.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      if (results.length) {
        setPicked((activeIndex - 1 + results.length) % results.length);
      }
    } else if (event.key === "Enter" && results[activeIndex]) {
      event.preventDefault();
      goToResult(results[activeIndex]);
    }
  };

  const field = (
    <input
      ref={inputRef}
      type="search"
      value={query}
      role="combobox"
      aria-label="Search the admin"
      aria-expanded={isOpen}
      aria-autocomplete="list"
      aria-controls={`${baseId}-results`}
      aria-activedescendant={
        isOpen && results.length ? `${baseId}-option-${activeIndex}` : undefined
      }
      onChange={(event) => {
        setQuery(event.target.value);
        setPicked(0);
        setIsOpen(true);
      }}
      onFocus={() => setIsOpen(true)}
      onKeyDown={onInputKeyDown}
      placeholder="Search articles, members, categories"
      className={`h-9 w-full rounded-[6px] border border-default-200 bg-background pl-8 pr-16 text-sm text-foreground transition-colors placeholder:text-default-600 hover:border-default-300 focus:border-default-400 ${focusRing}`}
    />
  );

  return (
    <div ref={rootRef} className="flex min-w-0 flex-1 sm:flex-none">
      <div className="relative hidden w-full max-w-md items-center sm:flex">
        <FiSearch
          aria-hidden
          className="pointer-events-none absolute left-2.5 size-4 text-default-600"
        />
        {field}
        <kbd
          aria-hidden
          className="pointer-events-none absolute right-2 hidden rounded border border-default-200 bg-default-50 px-1.5 py-0.5 text-[0.6875rem] font-medium text-default-600 md:block"
        >
          Ctrl K
        </kbd>
      </div>

      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-controls={`${baseId}-popover`}
        className={`inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-md text-default-700 transition-colors hover:bg-default-100 hover:text-foreground sm:hidden ${focusRing}`}
      >
        <FiSearch aria-hidden className="size-5" />
        <span className="sr-only">Search the admin</span>
      </button>

      {isOpen && (
        <div
          id={`${baseId}-popover`}
          className="absolute inset-x-3 top-[calc(100%+0.25rem)] z-40 overflow-hidden rounded-[10px] border border-default/60 bg-content-1 shadow-lg sm:left-1/2 sm:right-auto sm:w-[min(30rem,calc(100vw-3rem))] sm:-translate-x-1/2 lg:inset-x-auto lg:right-6 lg:translate-x-0"
        >
          <div className="relative flex items-center border-b border-default/60 p-2 sm:hidden">
            <FiSearch
              aria-hidden
              className="pointer-events-none absolute left-4 size-4 text-default-600"
            />
            {field}
          </div>

          <div className="max-h-80 overflow-y-auto py-1">
            {trimmed.length === 0 ? (
              <p className="px-3 py-3 text-xs leading-relaxed text-default-600">
                Search articles, members and categories. Press Ctrl K or / to
                come back here.
              </p>
            ) : trimmed.length < 2 ? (
              <p className="px-3 py-3 text-xs text-default-600">
                Keep typing: two characters is the minimum.
              </p>
            ) : isFetching && results.length === 0 ? (
              <p className="px-3 py-3 text-xs text-default-600" role="status">
                Searching for “{trimmed}”...
              </p>
            ) : isError ? (
              <p
                className="px-3 py-3 text-xs leading-relaxed text-danger"
                role="alert"
              >
                Search is unavailable right now: the admin API did not answer.
                Try again in a moment.
              </p>
            ) : results.length === 0 ? (
              <p className="px-3 py-3 text-xs leading-relaxed text-default-600">
                Nothing matches “{trimmed}”. Try part of a title, an email or a
                category name.
              </p>
            ) : (
              <ul
                id={`${baseId}-results`}
                role="listbox"
                aria-label="Search results"
              >
                {results.map((result, index) => {
                  const showGroup =
                    index === 0 || results[index - 1].group !== result.group;
                  return (
                    <li key={result.key}>
                      {showGroup && (
                        <p className="tth-label-sm px-3 pb-1 pt-2" aria-hidden>
                          {result.group}
                        </p>
                      )}
                      <Link
                        href={result.href}
                        id={`${baseId}-option-${index}`}
                        role="option"
                        aria-selected={index === activeIndex}
                        onClick={() => goToResult(result)}
                        onMouseEnter={() => setPicked(index)}
                        className={`flex min-h-11 items-center gap-2.5 px-3 text-sm ${
                          index === activeIndex
                            ? "bg-default-100 text-foreground"
                            : "text-default-700"
                        }`}
                      >
                        {result.avatar !== undefined ? (
                          <Avatar
                            src={result.avatar || undefined}
                            size="sm"
                            className="size-7 shrink-0"
                          />
                        ) : (
                          <span
                            aria-hidden
                            className="h-4 w-0.5 shrink-0 bg-default-300"
                          />
                        )}
                        <span className="min-w-0">
                          <span className="block truncate font-medium">
                            {result.title}
                          </span>
                          {result.detail && (
                            <span className="block truncate text-xs text-default-600">
                              {result.detail}
                            </span>
                          )}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * One thin bar at every width: where you are, the global search, the theme
 * switch (the only one in the shell), and the account menu. Below lg the
 * first slot is the drawer trigger instead of the breadcrumb, so no row ever
 * carries two copies of a control.
 */
export default function AdminTopbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, setIsLoading: setUserLoading } = useUser();
  const { openNav, isNavOpen } = useAdminShell();

  const current = findAdminLink(pathname);
  const group = current?.group ?? "Overview";
  const label = current?.label ?? "Admin";

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logOutUser();
    setUserLoading(true);
    router.push("/");
  };

  const avatarName = (user?.name || user?.username || "?")
    .charAt(0)
    .toUpperCase();

  return (
    <header className="relative z-30 sticky top-0 border-b border-default/60 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="flex h-14 items-center gap-2 px-3 sm:gap-3 sm:px-5 lg:px-6">
        <button
          type="button"
          onClick={openNav}
          aria-expanded={isNavOpen}
          aria-controls="admin-nav-panel"
          className={`inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-md px-2 text-sm font-medium text-default-700 transition-colors hover:bg-default-100 hover:text-foreground lg:hidden ${focusRing}`}
        >
          <MdMenu aria-hidden className="size-5" />
          Menu
        </button>

        <nav aria-label="Breadcrumb" className="hidden min-w-0 lg:block">
          <ol className="flex min-w-0 items-center gap-1.5 text-[0.8125rem]">
            <li className="shrink-0 text-default-600">{group}</li>
            <li aria-hidden className="shrink-0 text-default-300">
              /
            </li>
            <li
              aria-current="page"
              className="truncate font-medium text-foreground"
            >
              {label}
            </li>
          </ol>
        </nav>

        <div className="flex min-w-0 flex-1 justify-end sm:justify-center lg:justify-end">
          <AdminSearch key={pathname} />
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <span
            aria-hidden
            className="mx-0.5 hidden h-5 w-px bg-default/60 sm:block"
          />
          <ThemeSwitch
            className="flex min-h-11 min-w-11 items-center justify-center sm:min-h-9 sm:min-w-9"
            classNames={{ wrapper: "size-8" }}
          />

          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <button
                type="button"
                aria-label="Account menu"
                className={`inline-flex min-h-11 items-center gap-1.5 rounded-md px-1 text-default-700 transition-colors hover:bg-default-100 sm:min-h-9 ${focusRing}`}
              >
                <Avatar
                  src={user?.profilePicture}
                  size="sm"
                  className="size-8 shrink-0 object-cover"
                  name={avatarName}
                />
              </button>
            </DropdownTrigger>
            <DropdownMenu
              aria-label="Account"
              disabledKeys={isLoggingOut ? ["logout"] : undefined}
              classNames={{ base: "min-w-56" }}
            >
              <DropdownItem
                key="who"
                isReadOnly
                className="opacity-100 data-[hover=true]:bg-transparent"
              >
                <p className="text-sm font-medium text-foreground">
                  {user?.name || user?.username || "Signed in"}
                </p>
                <p className="truncate text-xs text-default-600">
                  {user?.role ?? "Admin"}
                  {user?.email ? ` · ${user.email}` : ""}
                </p>
              </DropdownItem>
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
                startContent={
                  <HiOutlineCog6Tooth aria-hidden className="size-4" />
                }
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
                {isLoggingOut ? "Logging out..." : "Log out"}
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>
    </header>
  );
}
