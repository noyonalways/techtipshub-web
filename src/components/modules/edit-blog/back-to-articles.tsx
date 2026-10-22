"use client";

import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";

/**
 * The event the editor listens for before letting this link navigate away.
 *
 * It is cancelable: `preventDefault()` on the dispatched event means "keep the
 * writer here", which is what the editor does when there are unsaved changes
 * and the writer decides to stay.
 */
export const ARTICLE_EDIT_LEAVE_EVENT = "tth:article-edit:leave";

/**
 * Back to the article list.
 *
 * Keeps plain link behaviour (new tab, middle click, keyboard) while asking the
 * editor first when the click navigates this tab: an accidental click must not
 * throw away unsaved work.
 */
const BackToArticles = () => (
  <Link
    href="/settings/manage-blogs"
    onClick={(event) => {
      // Let the browser handle modified clicks itself.
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) {
        return;
      }
      const proceed = window.dispatchEvent(
        new CustomEvent(ARTICLE_EDIT_LEAVE_EVENT, { cancelable: true }),
      );
      if (!proceed) event.preventDefault();
    }}
    className="inline-flex items-center gap-1.5 text-sm font-medium text-default-500 transition-colors hover:text-primary"
  >
    <FiArrowLeft aria-hidden className="size-3.5" />
    All articles
  </Link>
);

export default BackToArticles;
