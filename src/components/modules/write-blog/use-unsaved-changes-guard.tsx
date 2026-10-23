"use client";

import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@heroui/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * The event an in-app link asks before navigating away from the editor.
 *
 * It is cancelable: `preventDefault()` on the dispatched event means "keep the
 * writer here", which is what happens when there are unsaved changes and the
 * writer decides to stay.
 */
export const EDITOR_LEAVE_EVENT = "tth:editor:leave";

/**
 * Asks before unsaved work is thrown away.
 *
 * Three ways out, all covered: closing or reloading the tab (the browser's own
 * warning), clicking an in-app link (`shouldLeave`, used by the editor's back
 * links), and the browser's back button (a history guard that only listens
 * while there is something to lose).
 *
 * `discard` is what "Leave without saving" runs. Leaving for another site goes
 * through the caller's callback; leaving inside the app goes back.
 */
export const useUnsavedChangesGuard = ({
  dirty,
  discard,
  onLeave,
  title = "Leave without saving?",
  description = "Your unsaved changes will be lost.",
}: {
  dirty: boolean;
  discard: () => void;
  /** Where "Leave" goes. Defaults to the previous screen. */
  onLeave?: () => void;
  title?: string;
  description?: string;
}) => {
  const prompt = useDisclosure();
  const router = useRouter();
  const pathname = usePathname();
  const dirtyRef = useRef(dirty);
  const leaveRef = useRef<() => void>(() => {});

  // The listeners below outlive a render, so they read the latest values from
  // refs written in an effect rather than during render.
  useEffect(() => {
    dirtyRef.current = dirty;
    leaveRef.current = () => {
      discard();
      if (onLeave) onLeave();
      else router.back();
    };
  });

  // Reload or close the tab.
  useEffect(() => {
    if (!dirty) return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  // A link inside the app (the navbar, "My articles", the logo).
  useEffect(() => {
    const handler = (event: Event) => {
      if (!dirtyRef.current) return;
      event.preventDefault();
      prompt.onOpen();
    };
    window.addEventListener(EDITOR_LEAVE_EVENT, handler);
    return () => window.removeEventListener(EDITOR_LEAVE_EVENT, handler);
  }, [prompt]);

  // The browser's back button cannot be cancelled, so while there is something
  // to lose the editor puts a history entry in front of itself and re-arms it
  // whenever the writer tries to go back, then asks.
  useEffect(() => {
    if (!dirty) return;
    const arm = () => window.history.pushState({ tthEditorGuard: pathname }, "");
    arm();
    const onPop = () => {
      if (!dirtyRef.current) return;
      arm();
      prompt.onOpen();
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [dirty, pathname, prompt]);

  return {
    /** Opens the prompt (for the page bar's "leave" control). */
    askToLeave: prompt.onOpen,
    /** The dialog to render. */
    prompt: (
      <Modal
        isOpen={prompt.isOpen}
        onOpenChange={prompt.onOpenChange}
        backdrop="opaque"
        size="md"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">{title}</ModalHeader>
              <ModalBody>
                <p className="text-sm leading-relaxed text-default-600">
                  {description}
                </p>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Keep editing
                </Button>
                <Button
                  color="danger"
                  onPress={() => {
                    onClose();
                    leaveRef.current();
                  }}
                >
                  Leave
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    ),
  };
};
