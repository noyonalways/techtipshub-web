"use client";

import { button as buttonStyles } from "@heroui/theme";
import { Kbd } from "@heroui/react";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { writeBlogPath } from "@/lib/blog-routes";
import { useUser } from "@/context/user.provider";
import { SearchIcon } from "@/components/icons";
import {
  CommandBlog,
  latestArticles,
  listCategories,
  lookupProfile,
  searchArticles,
} from "./actions";
import { ArrowIcon, CommandIcon, EnterIcon } from "./icons";
import {
  CommandGroup,
  CommandTarget,
  usePaletteKeys,
  useRovingSelection,
} from "./keys";
import { ALL_TERMS, fuzzyScore, matchesQuery, toSearchTerms } from "./match";
import { PaletteRow } from "./row";
import { useTheme } from "next-themes";

const DEBOUNCE_MS = 220;

const pageTargets = (): CommandTarget[] => [
  { id: "page:feed", kind: "page", label: "Latest articles", detail: "The feed", href: "/" },
  { id: "page:following", kind: "page", label: "People you follow", detail: "Following feed", href: "/following" },
  { id: "page:features", kind: "page", label: "What TechTipsHub offers", href: "/features" },
  { id: "page:about", kind: "page", label: "About TechTipsHub", href: "/about" },
  { id: "page:contact", kind: "page", label: "Contact", href: "/contact" },
];

interface IProps {
  open: boolean;
  onClose: () => void;
}

/**
 * The header search, as a palette.
 *
 * It opens where the search field already was and answers three questions in
 * one place: which article, which category, and which control on the site.
 * Results are grouped in the order the decisions are usually made - what was
 * typed first, then where in the site it can be narrowed, then the rest of
 * the site.
 *
 * Everything is a real destination or a real command. Search runs against the
 * same `searchTerm` the feed uses, so a query pressed Enter on lands on the
 * feed showing the same articles.
 */
const CommandPalette = ({ open, onClose }: IProps) => {
  const router = useRouter();
  const { user } = useUser();
  const { theme, setTheme } = useTheme();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState("");

  const [latest, setLatest] = useState<CommandBlog[]>([]);
  const [searched, setSearched] = useState<CommandBlog[]>([]);
  const [articlesFailed, setArticlesFailed] = useState(false);
  const [categories, setCategories] = useState<
    Awaited<ReturnType<typeof listCategories>>["categories"]
  >([]);
  const [profile, setProfile] = useState<
    Awaited<ReturnType<typeof lookupProfile>>["user"]
  >(null);
  const [profileFailed, setProfileFailed] = useState(false);
  const [categoriesFailed, setCategoriesFailed] = useState(false);

  const titleId = useId();
  const hintId = useId();

  useEffect(() => setMounted(true), []);

  const close = useCallback(() => onClose(), [onClose]);

  const go = useCallback(
    (href: string) => {
      // `onClose` unmounts the palette; clearing on open instead of here
      // means a palette reopened before the router commits starts empty.
      close();
      router.push(href);
    },
    [close, router],
  );

  // Focus on open, and hand focus back to whatever opened the palette on
  // close, so a keyboard user is returned to the field they left.
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const frame = requestAnimationFrame(() => inputRef.current?.focus());
    return () => {
      cancelAnimationFrame(frame);
      // Only restore when focus would otherwise land nowhere: a palette
      // reopened inside the same commit (close, open again) must not have
      // the previous cleanup pull focus back out of the new field.
      const active = document.activeElement;
      const nobodyHoldsIt = !active || active === document.body;
      if (nobodyHoldsIt) previous?.focus?.();
    };
  }, [open]);

  // The page behind a dialog must not scroll.
  useEffect(() => {
    if (!open) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
    };
  }, [open]);

  // Categories and the newest articles load once per open, not per keystroke.
  useEffect(() => {
    if (!open) return;
    let live = true;
    listCategories().then((result) => {
      if (!live) return;
      setCategories(result.categories);
      setCategoriesFailed(result.failed);
    });
    latestArticles().then((result) => {
      if (!live) return;
      setLatest(result.blogs);
      setArticlesFailed(result.failed);
    });
    return () => {
      live = false;
    };
  }, [open]);

  // Typing narrows the same list. The debounce is on the request, not the
  // field; the field stays instant. `settledFor` records which query the
  // current articles answer, so the render can tell "still searching" from
  // "searched, this is it" without a second flag to keep in sync.
  const trimmed = query.trim();
  const handle = trimmed.startsWith("@") ? trimmed.slice(1) : "";
  const [settledFor, setSettledFor] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const term = toSearchTerms(query);
    if (term === ALL_TERMS) return;

    let live = true;
    const timer = setTimeout(async () => {
      const result = await searchArticles(query);
      if (!live) return;
      setSearched(result.blogs);
      setArticlesFailed(result.failed);
      setSettledFor(query);
    }, DEBOUNCE_MS);

    return () => {
      live = false;
      clearTimeout(timer);
    };
  }, [open, query]);

  // The end state of a type: the latest list answers an empty query without a
  // request, and the query stays "searching" until its own answer arrives.
  // `latest` is read inside the render, which is the timing a request made
  // for it would have had anyway.
  const answersThisQuery = !trimmed || settledFor === query;
  const articles = trimmed ? searched : latest;
  const searching = !answersThisQuery;
  const failed = answersThisQuery && articlesFailed;

  useEffect(() => {
    if (!open || !handle) return;
    let live = true;
    lookupProfile(handle).then((result) => {
      if (!live) return;
      setProfile(result.user);
      setProfileFailed(result.failed);
    });
    return () => {
      live = false;
    };
  }, [open, handle]);

  // The one profile row belongs to the last handle looked up; once the field
  // moves on, the old row must not sit under a query for someone else.
  const currentProfile =
    profile && profile.username.toLowerCase() === handle.toLowerCase()
      ? profile
      : null;

  const scoreItems = useCallback(
    (items: CommandTarget[], words: string) =>
      items
        .map((item) => ({ item, ...fuzzyScore(`${item.label} ${item.detail ?? ""}`, words) }))
        .filter(({ score, item }) =>
          // A row can carry words that are not shown ("dark mode"), so a
          // plain match on those still counts.
          score > 0 || (!!item.keywords && matchesQuery(item.keywords, words)),
        )
        .sort((a, b) => b.score - a.score)
        .map(({ item, ranges }) => ({ ...item, ranges })), 
    [],
  );

  const groups = useMemo<CommandGroup[]>(() => {
    const actions: CommandTarget[] = [
      {
        id: "action:write",
        kind: "action",
        label: "Write an article",
        detail: user ? "Your drafts and new blogs" : "Sign in when you publish",
        href: writeBlogPath,
        keywords: "compose create blog new",
      },
      {
        // `theme` is undefined until next-themes reads the stored choice, so
        // the label only claims a direction once the current one is known.
        id: "action:theme",
        kind: "action",
        label:
          theme === "dark"
            ? "Switch to light mode"
            : theme === "light"
              ? "Switch to dark mode"
              : "Change the theme",
        keywords: "theme dark light appearance",
        run: () => {
          setTheme(theme === "dark" ? "light" : "dark");
          close();
        },
      },
    ];

    if (!trimmed) {
      const newest = articles.slice(0, 6).map<CommandTarget>((blog) => ({
        id: `article:${blog._id}`,
        kind: "article",
        label: blog.title,
        detail: [blog.category, blog.author && `@${blog.author}`]
          .filter(Boolean)
          .join(" · "),
        href: `/blogs/${blog.slug}`,
      }));

      return [
        ...(newest.length ? [{ id: "newest", label: "Recently published", items: newest }] : []),
        {
          id: "categories",
          label: "Browse a category",
          items: categories.map<CommandTarget>((category) => ({
            id: `category:${category._id}`,
            kind: "category",
            label: category.name,
            detail: `${category.blogCount} ${category.blogCount === 1 ? "article" : "articles"}`,
            href: `/?category=${encodeURIComponent(category.name)}`,
          })),
        },
        { id: "actions", label: "Actions", items: actions },
        { id: "pages", label: "Go to", items: pageTargets() },
      ].filter((group) => group.items.length > 0);
    }

    const result: CommandGroup[] = [];

    // An `@handle` means "find this person". Leaving a feed link labelled
    // "All results for “@name”" next to the profile would be the same query
    // pointed at the wrong page.
    const articlesWanted = !handle;
    const typed = articles.slice(0, 6).map<CommandTarget>((blog) => ({
      id: `article:${blog._id}`,
      kind: "article",
      label: blog.title,
      detail: [blog.category, blog.author && `@${blog.author}`]
        .filter(Boolean)
        .join(" · "),
      href: `/blogs/${blog.slug}`,
    }));

    if (articlesWanted) {
      result.push({
        id: "articles",
        label: "Articles",
        items: [
          ...typed,
          {
            id: "articles:all",
            kind: "article",
            label: `All results for “${trimmed}”`,
            detail: "Open the feed with this search",
            href: `/?search=${encodeURIComponent(trimmed)}`,
          },
        ],
      });
    }

    if (currentProfile) {
      result.push({
        id: "profiles",
        label: "People",
        items: [
          {
            id: `profile:${currentProfile.username}`,
            kind: "profile",
            label: currentProfile.fullName || `@${currentProfile.username}`,
            detail: `@${currentProfile.username} · ${currentProfile.totalBlogs} ${
              currentProfile.totalBlogs === 1 ? "article" : "articles"
            }`,
            href: `/profile/@${currentProfile.username}`,
          },
        ],
      });
    }

    result.push({
      id: "categories",
      label: "Categories",
      items: categories
        .filter((category) => matchesQuery(category.name, trimmed))
        .slice(0, 4)
        .map<CommandTarget>((category) => ({
          id: `category:${category._id}`,
          kind: "category",
          label: category.name,
          detail: `${category.blogCount} ${category.blogCount === 1 ? "article" : "articles"}`,
          href: `/?category=${encodeURIComponent(category.name)}`,
        })),
    });

    result.push({ id: "actions", label: "Actions", items: scoreItems(actions, trimmed) });
    result.push({ id: "pages", label: "Go to", items: scoreItems(pageTargets(), trimmed) });

    return result.filter((group) => group.items.length > 0);
  }, [articles, categories, close, currentProfile, handle, scoreItems, setTheme, theme, trimmed, user]);

  const { items, active, activeIndex, move, moveToEdge, setActiveId } =
    useRovingSelection(groups);

  const run = useCallback(() => {
    if (!active) return;
    if (active.run) {
      active.run();
      return;
    }
    if (active.href) go(active.href);
  }, [active, go]);

  const onKeyDown = usePaletteKeys({
    inputRef,
    onEscape: close,
    onMove: move,
    onEdge: moveToEdge,
    onRun: run,
  });

  const articlesEmpty =
    !handle &&
    !!trimmed &&
    !searching &&
    !failed &&
    !items.some((item) => item.kind === "article" && item.id !== "articles:all");

  // Keep the active row inside the scroll area the list owns.
  useEffect(() => {
    const row = listRef.current?.querySelector<HTMLElement>('[data-active="true"]');
    row?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, items.length]);

  // A hook may not sit behind the early return below, and the portal can only
  // render once there is a document to render into.
  if (!mounted || !open) return null;

  let cursor = -1;

  return createPortal(
    <div className="fixed inset-0 z-[100]">
      <div
        aria-hidden
        className="absolute inset-0 bg-overlay/40 backdrop-blur-[2px]"
        onClick={close}
      />
      <div className="relative mx-auto flex h-full w-full max-w-page justify-center px-4 pt-[12vh] sm:pt-[14vh]">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={hintId}
          onKeyDown={onKeyDown}
          className="flex h-fit max-h-[70vh] w-full max-w-xl flex-col overflow-hidden rounded-xl border border-default-200 bg-content-1 shadow-2xl"
        >
          <div className="flex items-center gap-3 border-b border-default-100 px-4">
            <SearchIcon className="size-4 shrink-0 text-default-500" />
            <h2 id={titleId} className="sr-only">
              Search TechTipsHub
            </h2>
            <input
              ref={inputRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search articles, categories, pages…"
              aria-describedby={hintId}
              autoComplete="off"
              spellCheck={false}
              className="h-14 min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-default-500"
            />
            <Kbd keys={["escape"]} className="hidden shrink-0 sm:inline-flex">
              Esc
            </Kbd>
          </div>

          <p id={hintId} className="sr-only">
            Results update as you type. Press Enter to open the highlighted
            result, arrow keys to move through them, and Escape to close.
          </p>

          <div
            ref={listRef}
            aria-live="polite"
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 py-2"
          >
            {groups.map((group) => (
              <div key={group.id} className="pb-1">
                <p className="px-2.5 pb-1 pt-2 tth-label-sm">{group.label}</p>
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    cursor += 1;
                    return (
                      <div key={item.id} data-active={cursor === activeIndex}>
                        <PaletteRow
                          item={item}
                          active={cursor === activeIndex}
                          onHover={() => setActiveId(item.id)}
                          onRun={run}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {groups.length === 0 && (
              <div className="px-3 py-10 text-center">
                <p className="text-sm font-medium text-foreground">
                  {searching
                    ? "Searching articles…"
                    : failed
                      ? "Search is unavailable"
                      : handle
                        ? "No profile by that name"
                        : "Nothing matched"}
                </p>
                <p className="mx-auto mt-1 max-w-xs text-sm text-default-600">
                  {searching
                    ? "Looking through titles and article text."
                    : failed
                      ? "The search service did not answer. Your connection is the first thing to check, then try again."
                      : handle
                        ? `Nobody uses “@${handle}”, or the profile has not been published.`
                        : `No article, category or page matches “${trimmed}”. Try a shorter word.`}
                </p>
                {!searching && (
                  <button
                    type="button"
                    onClick={() =>
                      go(
                        handle
                          ? `/?search=${encodeURIComponent(handle)}`
                          : `/?search=${encodeURIComponent(trimmed)}`,
                      )
                    }
                    className="mt-4 text-sm font-medium text-primary-accessible underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus/70"
                  >
                    {handle ? "Search articles for this name" : "Search the feed instead"}
                  </button>
                )}
              </div>
            )}

            {articlesEmpty && (
              <p className="px-2.5 py-2 text-xs text-default-600">
                {groups.some(
                  (group) =>
                    group.id !== "articles" && group.id !== "profiles",
                )
                  ? "No article matched. The categories and pages below still do."
                  : "No article matched. “All results” searches the whole feed, not just titles."}
              </p>
            )}

            {profileFailed && (
              <p className="px-2.5 py-2 text-xs text-default-600">
                Could not load @{handle}. Showing the rest of the results.
              </p>
            )}

            {categoriesFailed && (
              <p className="px-2.5 py-2 text-xs text-default-600">
                Categories could not be loaded. Articles and pages still work.
              </p>
            )}
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-default-100 px-4 py-2.5">
            <span className="hidden items-center gap-3 text-xs text-default-600 sm:flex">
              <span className="flex items-center gap-1">
                <Kbd>↑</Kbd>
                <Kbd>↓</Kbd>
                to move
              </span>
              <span className="flex items-center gap-1">
                <EnterIcon className="size-3.5" />
                to open
              </span>
            </span>
            {active?.href ? (
              <a
                href={active.href}
                className={`${buttonStyles({
                  color: "primary",
                  radius: "full",
                  size: "sm",
                })} gap-1.5 font-medium`}
                onClick={(event) => {
                  event.preventDefault();
                  run();
                }}
              >
                Open
                <ArrowIcon className="size-3.5" />
              </a>
            ) : (
              <span className="flex items-center gap-1.5 text-xs text-default-600">
                <CommandIcon className="size-3.5" />
                <Kbd keys={["command"]}>K</Kbd>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default CommandPalette;
