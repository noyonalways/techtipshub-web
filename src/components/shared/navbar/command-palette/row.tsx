"use client";

import Link from "next/link";
import {
  ArticleIcon,
  CategoryIcon,
  CommandIcon,
  PageIcon,
  ProfileIcon,
  ThemeIcon,
} from "./icons";
import { CommandKind, CommandTarget } from "./keys";
import { splitByRanges } from "./match";

const KIND_ICON: Record<CommandKind, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  article: ArticleIcon,
  category: CategoryIcon,
  profile: ProfileIcon,
  page: PageIcon,
  action: CommandIcon,
};

interface RowProps {
  item: CommandTarget;
  active: boolean;
  onHover: () => void;
  onRun: () => void;
}

const Emphasis = ({ label, ranges }: { label: string; ranges?: Array<[number, number]> }) => (
  <>
    {splitByRanges(label, ranges ?? []).map((part, index) =>
      part.match ? (
        <mark
          key={index}
          className="bg-transparent font-semibold text-foreground"
        >
          {part.text}
        </mark>
      ) : (
        <span key={index}>{part.text}</span>
      ),
    )}
  </>
);

/**
 * One result.
 *
 * Rendered as a link when it navigates and a button when it runs a command,
 * so Enter and middle-click behave the way the two things actually are. Both
 * are pulled out of the tab order: keyboard travel through a result list
 * belongs to the arrows, and Tab from the field should leave the dialog
 * rather than walk forty rows.
 *
 * `onMouseMove` rather than `onMouseEnter`: moving the pointer over a row
 * that scrolled under it should move the selection, but a list scrolling
 * itself under a still pointer should not.
 */
export const PaletteRow = ({ item, active, onHover, onRun }: RowProps) => {
  const Icon = KIND_ICON[item.kind] ?? (item.kind === "action" ? ThemeIcon : PageIcon);
  const classes = `flex w-full items-start gap-3 rounded-md px-2.5 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus/70 ${
    active ? "bg-default-100 text-foreground" : "text-default-700"
  }`;

  const inner = (
    <>
      <Icon
        className={`mt-0.5 size-4 shrink-0 ${active ? "text-primary-accessible" : "text-default-500"}`}
      />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm leading-5">
          <Emphasis label={item.label} ranges={item.ranges} />
        </span>
        {item.detail && (
          <span className="mt-0.5 block truncate text-xs leading-4 text-default-600">
            {item.detail}
          </span>
        )}
      </span>
    </>
  );

  if (item.href) {
    return (
      <Link
        href={item.href}
        tabIndex={-1}
        className={classes}
        onClick={onRun}
        onMouseMove={onHover}
      >
        {inner}
      </Link>
    );
  }

  return (
    <button
      type="button"
      tabIndex={-1}
      className={classes}
      onClick={onRun}
      onMouseMove={onHover}
    >
      {inner}
    </button>
  );
};
