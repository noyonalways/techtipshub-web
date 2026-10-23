import type { ReactNode } from "react";
import { focusRing } from "@/components/modules/admin/kit/tau";

interface IProps {
  title: string;
  description: string;
  action?: ReactNode;
}

/**
 * One-tab-out block for a panel whose request failed. Sits where the real
 * content would be, so the retry is the next stop after the heading. The
 * heading is a paragraph, not a heading element: the panel it replaces usually
 * already has one, and two headings would read the section twice.
 */
const BlockError = ({ title, description, action }: IProps) => (
  <div role="alert" className="px-4 py-8">
    <p className="text-sm font-semibold">{title}</p>
    <p className="mt-1 max-w-md text-sm leading-relaxed text-default-600">
      {description}
    </p>
    {action && (
      <div className="mt-4 flex flex-wrap items-center gap-2">{action}</div>
    )}
  </div>
);

export const RetryButton = ({
  onClick,
  label = "Try again",
  isPending = false,
}: {
  onClick: () => void;
  label?: string;
  isPending?: boolean;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={isPending}
    aria-busy={isPending}
    className={`inline-flex min-h-11 items-center rounded-[6px] border border-default-200 px-3 text-sm font-medium transition-colors hover:bg-default-100 disabled:opacity-60 sm:min-h-9 ${focusRing}`}
  >
    {isPending ? "Trying" : label}
  </button>
);

export default BlockError;
