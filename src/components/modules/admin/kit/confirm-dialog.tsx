"use client";

import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@heroui/react";
import { useState } from "react";
import {
  cloneElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";
import { focusRing } from "./tau";

interface IProps {
  /** The button that opens the dialog. It receives the open handler. */
  trigger: ReactNode;
  title: string;
  description: string;
  confirmLabel: string;
  tone?: "default" | "danger";
  isPending?: boolean;
  onConfirm: () => void;
}

/**
 * Confirmation step for destructive or irreversible admin actions. HeroUI's
 * modal already traps focus, closes on Escape and restores focus to the
 * trigger; what this adds is the trigger wiring, the danger treatment and the
 * pending state.
 *
 * The confirm action keeps its button busy while `isPending` is true so a
 * double press cannot fire twice, and the dialog stays open until the caller
 * clears it, which means an error message is never lost behind a closed modal.
 */
export default function ConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel,
  tone = "default",
  isPending = false,
  onConfirm,
}: IProps) {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [hasPressed, setHasPressed] = useState(false);

  const danger = tone === "danger";

  const triggerNode = isValidElement(trigger)
    ? cloneElement(
        trigger as ReactElement<{ onPress?: () => void; onClick?: () => void }>,
        { onPress: onOpen },
      )
    : null;

  const close = () => {
    setHasPressed(false);
    onClose();
  };

  return (
    <>
      {triggerNode ?? trigger}

      <Modal
        isOpen={isOpen}
        onOpenChange={(open) => {
          if (!open) setHasPressed(false);
          onOpenChange();
        }}
        radius="lg"
        size="sm"
        hideCloseButton={isPending}
        isDismissable={!isPending}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1 pb-1 pt-5">
            {danger && (
              <span className="tth-label-sm text-danger">
                This cannot be undone
              </span>
            )}
            <span className="font-[family-name:var(--type-editorial)] text-lg font-semibold tracking-[-0.01em]">
              {title}
            </span>
          </ModalHeader>
          <ModalBody>
            <p className="text-sm leading-relaxed text-default-600">
              {description}
            </p>
          </ModalBody>
          <ModalFooter className="gap-2">
            <button
              type="button"
              onClick={close}
              disabled={isPending}
              className={`inline-flex min-h-11 items-center justify-center rounded-[6px] border border-default-200 px-3.5 text-sm font-medium text-foreground transition-colors hover:bg-default-100 disabled:opacity-50 sm:min-h-9 ${focusRing}`}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                setHasPressed(true);
                onConfirm();
              }}
              disabled={isPending}
              aria-busy={isPending}
              className={`inline-flex min-h-11 items-center justify-center rounded-[6px] px-3.5 text-sm font-semibold transition-colors disabled:opacity-60 sm:min-h-9 ${focusRing} ${
                danger
                  ? "bg-danger-600 text-white hover:bg-danger-700 dark:bg-danger dark:text-danger-foreground dark:hover:opacity-90"
                  : "bg-primary text-primary-foreground hover:bg-primary-500"
              }`}
            >
              {isPending && hasPressed ? "Working..." : confirmLabel}
            </button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
