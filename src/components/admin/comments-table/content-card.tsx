"use client";

import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@heroui/modal";
import Link from "next/link";
import { type ReactNode, useId } from "react";
import { focusRing } from "@/components/modules/admin/kit/tau";
import { formatExact, formatRelativeLong } from "@/components/admin/utils";

interface IProps {
  children: ReactNode;
  /** Label of the dialog, e.g. "Comment by Ana Ruiz". */
  title: string;
  /** The full text. Plain text: comments are never rendered as HTML. */
  content: string;
  images?: string[];
  /** Who wrote it and when, under the title. */
  meta?: ReactNode;
  /** Article the comment sits on, as a real link, when the API resolved it. */
  article?: { title: string; slug: string } | null;
  /** `true` when the cell already shows "Read in full". */
  actionLabel: string;
}

/**
 * The full text behind a clamped cell. The clamp is a layout device, not a
 * filter, so the whole value stays reachable: the cell body itself is the
 * button (no nested control inside a table row), and the dialog is where the
 * long text, the images and the actions live.
 *
 * Body text is strings from the API only, never HTML, so a comment cannot
 * inject markup into the admin console.
 */
const ContentCard = ({
  children,
  title,
  content,
  images = [],
  meta,
  article,
  actionLabel,
}: IProps) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const headingId = useId();

  return (
    <>
      <button
        type="button"
        onClick={onOpen}
        aria-haspopup="dialog"
        className={`-mx-1 block w-[calc(100%+0.5rem)] rounded-[6px] px-1 text-left transition-colors hover:bg-default-50 ${focusRing}`}
      >
        {children}
        <span className="sr-only">. {actionLabel}</span>
      </button>

      <Modal
        size="2xl"
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        scrollBehavior="inside"
        aria-labelledby={headingId}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1 pb-2 pt-5">
            <span
              id={headingId}
              className="font-[family-name:var(--type-editorial)] text-lg font-semibold tracking-[-0.01em]"
            >
              {title}
            </span>
            {meta && (
              <span className="text-xs font-normal text-default-600">
                {meta}
              </span>
            )}
          </ModalHeader>

          <ModalBody className="pb-4">
            {content.trim() ? (
              <p className="whitespace-pre-wrap break-words text-[0.9375rem] leading-relaxed">
                {content}
              </p>
            ) : (
              <p className="text-sm text-default-600">
                This comment has no text, only{" "}
                {images.length === 1 ? "one image" : `${images.length} images`}.
              </p>
            )}

            {images.length > 0 && (
              <ul className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {images.map((image, index) => (
                  <li key={`${image}-${index}`}>
                    <a
                      href={image}
                      target="_blank"
                      rel="noreferrer noopener"
                      className={`block overflow-hidden rounded-[10px] border border-default/60 ${focusRing}`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={image}
                        alt={`Image ${index + 1} attached to this comment`}
                        className="aspect-square w-full object-cover"
                        loading="lazy"
                      />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </ModalBody>

          {article?.slug && (
            <ModalFooter className="justify-start gap-3 pb-5">
              <Link
                href={`/blogs/${article.slug}`}
                className={`text-sm font-medium text-primary-accessible underline-offset-4 hover:underline ${focusRing}`}
              >
                Open {article.title || "the article"}
              </Link>
            </ModalFooter>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default ContentCard;

/** "3h ago, 12 Oct 2026, 14:05": the short and the exact time in one string. */
export const readTime = (value?: string) => {
  const relative = formatRelativeLong(value);
  const exact = formatExact(value);
  if (!relative) return exact;
  return exact ? `${relative}, ${exact}` : relative;
};
