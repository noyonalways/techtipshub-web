"use client";

import { useDeletePostByUserUsingId, useUpdatePostByUserUsingId } from "@/hooks/post.hook";
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
}

const UserDeleteBlogModal = ({ id }: IProps) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { mutate: deletePost, isPending } = useDeletePostByUserUsingId();
  const router = useRouter()

  const handleDelete = () => {
    deletePost(id);
    onOpenChange();
    router.push(`/settings/manage-blogs?id=${id}`);
  };

  return (
    <>
      <Button
        isLoading={isPending}
        onPress={onOpen}
        size="sm"
        variant="light"
        color="danger"
        startContent={<FiTrash2 className="text-lg text-red-500" />}
      >
        {isPending ? "Deleting..." : "Delete"}
      </Button>

      <Modal size="md" isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Delete the Blog?
              </ModalHeader>
              <ModalBody>
                <p>Are your sure, You want to delete this blog?</p>
              </ModalBody>
              <ModalFooter>
                <div className="flex justify-end">
                  <Button onClick={handleDelete} color="danger" radius="sm">
                    Confirm
                  </Button>
                </div>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default UserDeleteBlogModal;
