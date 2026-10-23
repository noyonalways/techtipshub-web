"use client";

import { useDeleteBlogByUserUsingId } from "@/hooks/blog.hook";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@heroui/react";
import { useRouter } from "next/navigation";

import { FiTrash2 } from "react-icons/fi";

interface IProps {
  id: string;
  title?: string;
}

const UserDeleteBlogModal = ({ id, title }: IProps) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { mutate: deleteBlog, isPending } = useDeleteBlogByUserUsingId();
  const router = useRouter();

  const handleDelete = () => {
    deleteBlog(id, {
      onSuccess: (data) => {
        if (!data?.success) return;
        // Let the list drop the row now; the refresh below reconciles with the
        // server a moment later.
        window.dispatchEvent(
          new CustomEvent("blog:deleted", { detail: { id } }),
        );
        router.refresh();
      },
    });
    onOpenChange();
  };

  return (
    <>
      <button
        type="button"
        onClick={onOpen}
        disabled={isPending}
        className="inline-flex items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium text-default-600 transition-colors hover:bg-danger/10 hover:text-danger focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-300 disabled:opacity-60"
      >
        <FiTrash2 aria-hidden className="size-3.5" />
        {isPending ? "Deleting…" : "Delete"}
        <span className="sr-only">{title ? ` “${title}”` : ""}</span>
      </button>

      <Modal size="md" isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Delete this article?
              </ModalHeader>
              <ModalBody>
                <p className="text-sm leading-relaxed text-default-600">
                  {title ? (
                    <>
                      <span className="font-medium text-foreground">
                        “{title}”
                      </span>{" "}
                      will be removed from your profile and the feed. Its views
                      and comments go with it.
                    </>
                  ) : (
                    "This article will be removed from your profile and the feed."
                  )}{" "}
                  This cannot be undone.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" radius="lg" onPress={onClose}>
                  Keep it
                </Button>
                <Button
                  color="danger"
                  radius="lg"
                  isLoading={isPending}
                  onPress={handleDelete}
                >
                  Delete article
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default UserDeleteBlogModal;
