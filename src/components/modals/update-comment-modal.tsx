"use client";

import { LuImagePlus } from "react-icons/lu";
import { FieldValues, SubmitHandler } from "react-hook-form";
import { ChangeEvent, useState } from "react";
import { toast } from "sonner";
import { useUpdateCommentByUser } from "@/hooks/blog.hook";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  useDisclosure,
} from "@heroui/react";
import { MdModeEdit } from "react-icons/md";
import THForm from "../form/th-from";
import THTextarea from "../form/th-textarea";

interface IProps {
  commentId: string;
  content: string;
}

const CommentUpdateModal = ({commentId, content}: IProps) => {
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { mutate: updateComment, isPending } = useUpdateCommentByUser();

  const handleNewImagesChange = (event: ChangeEvent<HTMLInputElement>) => {
    console.log("called...")
    const files = event.target.files;
    if (files) {
      const selectedFiles = Array.from(files);
      if (selectedFiles.length + selectedImages.length > 4) {
        toast.warning("You can only upload a maximum of 4 images.", {
          id: "max-images-warning",
          closeButton: true,
        });
        return;
      }
      setSelectedImages((prevImages) =>
        [...prevImages, ...selectedFiles].slice(0, 4)
      );
    }
  };

  const onSubmit: SubmitHandler<FieldValues> = (values) => {
    const formData = new FormData();
    formData.append("data", JSON.stringify(values));

    selectedImages.forEach((file) => {
      formData.append("images", file);
    });

    updateComment({ commentId, payload: formData });
    setSelectedImages([]); 
    onOpenChange();
  };
  return (
    <>
      <Button
        isLoading={isPending}
        onClick={onOpen}
        className="text-primary-accessible"
        variant="light"
        size="sm"
        radius="full"
        isIconOnly
        color="primary"
      >
        <MdModeEdit size={16} />
      </Button>
      <Modal size="lg" isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Edit Comment
              </ModalHeader>
              <ModalBody>
                <THForm
                  onSubmit={onSubmit}
                  defaultValues={{ content: content }}
                >
                  <div className="space-y-4">
                    <div className="relative">
                      <THTextarea
                        id="comment-field"
                        name="content"
                        placeholder="Write comment here..."
                        size="lg"
                        radius="sm"
                        variant="bordered"
                      />
                      <div className="absolute top-2 right-2">
                        <Button
                          as={"label"}
                          type="button"
                          isIconOnly
                          radius="full"
                          variant="light"
                          htmlFor="newImages"
                          size="sm"
                          startContent={<LuImagePlus size={18} />}
                        >
                          <input
                            id="newImages"
                            type="file"
                            accept="image/*"
                            multiple // Allow multiple files
                            className="hidden"
                            onChange={handleNewImagesChange}
                          />
                        </Button>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        variant="solid"
                        radius="sm"
                        color="primary"
                      >
                        Update
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

export default CommentUpdateModal;
