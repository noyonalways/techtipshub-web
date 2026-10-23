"use client";

import {
  formatExact,
  formatRelative,
  isoDate,
  safeEmail,
} from "@/components/admin/utils";
import { focusRing } from "@/components/modules/admin/kit/tau";
import type { TContact, TContactStatus } from "@/types/admin.type";
import type { RefObject } from "react";
import { FiArrowLeft, FiCopy, FiCornerUpLeft } from "react-icons/fi";
import { STATUS_DOT, STATUS_LABEL, senderName } from "./message-list";

interface IProps {
  message?: TContact;
  isLoading: boolean;
  failed: boolean;
  failedMessage?: string;
  onRetry: () => void;
  replyLink: string | null;
  onCopy: () => void;
  onStatusChange: (status: TContactStatus) => void;
  isUpdating: boolean;
  onBack: () => void;
  showBack: boolean;
  backRef?: RefObject<HTMLButtonElement | null>;
}

const ACTION =
  "inline-flex min-h-11 items-center justify-center gap-1.5 rounded-[6px] border px-3 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 sm:min-h-9";

const QUIET = `${ACTION} border-default-300 bg-content-1 text-foreground hover:bg-default-100 disabled:hover:bg-content-1`;

const FILLED = `${ACTION} border-primary bg-primary text-primary-foreground hover:bg-primary/90 disabled:hover:bg-primary`;

/** The next status buttons, in the order an inbox is usually worked. */
const NEXT_ACTIONS: TContactStatus[] = ["read", "archived", "new"];

const LABEL: Record<TContactStatus, string> = {
  read: "Mark as read",
  archived: "Archive",
  new: "Back to unread",
};

const MessageDetail = ({
  message,
  isLoading,
  failed,
  failedMessage,
  onRetry,
  replyLink,
  onCopy,
  onStatusChange,
  isUpdating,
  onBack,
  showBack,
  backRef,
}: IProps) => {
  if (isLoading) {
    return (
      <div className="space-y-4 p-5 sm:p-6" aria-busy="true">
        <div className="h-9 w-40 animate-pulse rounded-[6px] bg-default-100" />
        <div className="h-7 w-3/4 animate-pulse rounded bg-default-100" />
        <div className="space-y-2 pt-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-3 animate-pulse rounded bg-default-100"
              style={{ width: `${92 - index * 7}%` }}
            />
          ))}
        </div>
        <p className="sr-only" role="status">
          Loading the message
        </p>
      </div>
    );
  }

  if (failed || !message) {
    return (
      <div className="px-5 py-14 text-center">
        <p className="font-[family-name:var(--type-editorial)] text-lg font-semibold tracking-[-0.015em]">
          {failed ? "This message did not load" : "That message is gone"}
        </p>
        <p className="mx-auto mt-1 max-w-sm text-sm leading-relaxed text-default-600">
          {failed
            ? failedMessage ||
              "The request to the API failed. Try again, and if it keeps failing check that the API is reachable."
            : "It was removed, or the link points at a message that no longer exists. Pick another from the list."}
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {failed && (
            <button
              type="button"
              onClick={onRetry}
              className={`${QUIET} ${focusRing}`}
            >
              Try again
            </button>
          )}
          {/* On a phone the list is still one step away; on a wide screen it
              is already visible, so a second "back" would do nothing. */}
          {showBack && (
            <button
              type="button"
              onClick={onBack}
              className={`${QUIET} ${focusRing}`}
            >
              Back to the list
            </button>
          )}
        </div>
      </div>
    );
  }

  const name = senderName(message);
  const subject = message.subject || "(no subject)";
  const options = NEXT_ACTIONS.filter((status) => status !== message.status);
  const primaryStatus = options[0];
  const rest = options.slice(1);
  const replyAddress = safeEmail(message.email);

  return (
    <article
      aria-labelledby="message-subject"
      className="flex min-h-full flex-col"
    >
      <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-default/60 bg-content-1/95 px-3 py-2 backdrop-blur sm:px-5">
        {showBack ? (
          <button
            type="button"
            ref={backRef}
            onClick={onBack}
            className={`inline-flex min-h-11 items-center gap-1.5 rounded-[6px] px-2 text-sm font-medium text-default-800 transition-colors hover:bg-default-100 ${focusRing}`}
          >
            <FiArrowLeft aria-hidden className="size-4" />
            Inbox
          </button>
        ) : (
          <span className="tth-label">Message</span>
        )}

        <span className="flex items-center gap-1.5 text-xs font-medium text-default-700">
          <span
            aria-hidden
            className={`size-1.5 rounded-full ${STATUS_DOT[message.status]}`}
          />
          {STATUS_LABEL[message.status]}
        </span>
      </div>

      <header className="border-b border-default/60 px-4 py-5 sm:px-6">
        <h2
          id="message-subject"
          className="text-balance font-[family-name:var(--type-editorial)] text-[1.375rem] font-semibold leading-snug tracking-[-0.015em] break-words sm:text-2xl"
        >
          {subject}
        </h2>

        <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
          <span className="font-medium">{name}</span>
          <span aria-hidden className="text-default-400">
            ·
          </span>
          <a
            href={replyAddress ? `mailto:${replyAddress}` : undefined}
            aria-disabled={replyAddress ? undefined : true}
            className={`break-all rounded-sm text-default-700 underline-offset-4 hover:text-foreground hover:underline ${focusRing}`}
          >
            {message.email}
          </a>
        </div>

        {!replyAddress && (
          <p className="mt-1 max-w-[60ch] text-xs leading-relaxed text-default-600">
            This address does not look like a plain email, so it is shown as
            text only rather than linked.
          </p>
        )}

        <p className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-default-600">
          <time
            dateTime={isoDate(message.createdAt)}
            title={formatExact(message.createdAt)}
          >
            {formatExact(message.createdAt) || "Date unknown"}
            {formatRelative(message.createdAt) && (
              <span className="text-default-500">
                {" "}
                ({formatRelative(message.createdAt)})
              </span>
            )}
          </time>
          {message.handledAt && (
            <>
              <span aria-hidden>·</span>
              <span title={formatExact(message.handledAt)}>
                {message.handledBy?.fullName
                  ? `${message.handledBy.fullName} set the status`
                  : "Status set"}{" "}
                {formatRelative(message.handledAt)}
              </span>
            </>
          )}
        </p>
      </header>

      <div className="min-w-0 flex-1 px-4 py-5 sm:px-6">
        {/* Plain text only: contact messages are never rendered as HTML. */}
        <p className="max-w-[68ch] whitespace-pre-wrap break-words text-[0.9375rem] leading-relaxed">
          {message.message || (
            <span className="italic text-default-600">
              The form arrived with an empty body.
            </span>
          )}
        </p>
      </div>

      <div className="mt-auto border-t border-default/60 px-4 py-3 sm:px-6">
        <div className="flex flex-wrap items-center gap-2">
          {replyLink && (
            <a href={replyLink} className={`${FILLED} ${focusRing}`}>
              <FiCornerUpLeft aria-hidden className="size-4" />
              Reply by email
            </a>
          )}

          {primaryStatus && (
            <button
              type="button"
              onClick={() => onStatusChange(primaryStatus)}
              disabled={isUpdating}
              aria-busy={isUpdating || undefined}
              className={`${replyLink ? QUIET : FILLED} ${focusRing}`}
            >
              {LABEL[primaryStatus]}
            </button>
          )}

          {rest.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => onStatusChange(status)}
              disabled={isUpdating}
              aria-busy={isUpdating || undefined}
              className={`${QUIET} ${focusRing}`}
            >
              {LABEL[status]}
            </button>
          ))}

          <button
            type="button"
            onClick={onCopy}
            className={`${QUIET} ${focusRing} sm:ml-auto`}
          >
            <FiCopy aria-hidden className="size-4" />
            Copy address
          </button>
        </div>

        {!replyLink && (
          <p className="mt-2 text-xs text-default-600">
            The sender address does not look like an email, so there is no reply
            link. Copy it if you need to reach them another way.
          </p>
        )}

        {isUpdating && (
          <p className="sr-only" role="status">
            Saving the status
          </p>
        )}
      </div>
    </article>
  );
};

export default MessageDetail;
