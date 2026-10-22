import { Button } from "@heroui/button";
import { Modal, ModalBody, ModalContent, ModalHeader, useDisclosure } from "@heroui/modal";
import THForm from "../form/th-from";
import THTextarea from "../form/th-textarea";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDeletePostByAdminUsingId, useUpdatePostByUserUsingId } from "@/hooks/post.hook";

interface IProps {
  id: string;
  refetchPosts: () => void;
}

const deleteBlogValidationSchema = z.object({
  reason: z
    .string({
      error: "Reason is required",
    })
    .min(1, "Reason is required"),
});

const AdminDeleteBlogModal = ({ id, refetchPosts }: IProps) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { mutate: deleteBlog, isPending } = useDeletePostByAdminUsingId();

  const onSubmit: SubmitHandler<FieldValues> = (values) => {
    deleteBlog(
      { postId: id, reason: values.reason },
      {
        onSuccess() {
          refetchPosts();
        },
      }
    );
    onOpenChange();
  };

  return (
    <>
      <Button
        isLoading={isPending}
        color="danger"
        size="sm"
        radius="sm"
        variant="flat"
        onPress={onOpen}
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
                <THForm
                  onSubmit={onSubmit}
                  resolver={zodResolver(deleteBlogValidationSchema)}
                >
                  <div className="space-y-4">
                    <THTextarea
                      label="Reason"
                      placeholder="Describe the reason why you're deleting the blog"
                      name="reason"
                      isRequired
                      variant="bordered"
                    />
                    <div className="flex justify-end">
                      <Button type="submit" color="danger" radius="sm">
                        Confirm
                      </Button>
                    </div>
                  </div>
                </THForm>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default AdminDeleteBlogModal;
