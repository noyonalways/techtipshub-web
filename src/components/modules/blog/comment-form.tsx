"use client";

import THForm from "@/components/form/th-from";
import THTextarea from "@/components/form/th-textarea";
import { AuthenticationModal } from "@/components/modals";
import { useUser } from "@/context/user.provider";
import { useCommentOnBlog } from "@/hooks/blog.hook";
import { commentValidationSchema } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@heroui/react";
import { FieldValues, SubmitHandler } from "react-hook-form";
import { LuImagePlus } from "react-icons/lu";
import { useState } from "react";
import { toast } from "sonner";

interface IProps {
  blogId: string;
  slug: string;
}

const CommentForm = ({ blogId, slug }: IProps) => {
  const { user } = useUser();
  const { mutate: commentOnBlog, isPending } = useCommentOnBlog();
  const [selectedImages, setSelectedImages] = useState<File[]>([]);

  const handleImagesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const selectedFiles = Array.from(files);
      if (selectedFiles.length + selectedImages.length > 4) {
        toast.warning("You can only upload a maximum of 4 images.", {
          id: "max-images-warning",
          closeButton: true
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

    // Append each selected image to the "images" field in FormData
    selectedImages.forEach((file) => {
      formData.append("images", file);
    });

    commentOnBlog({ blogId: blogId, payload: formData });
    setSelectedImages([]); // Reset selected images after successful submission
  };

  // Authentication modal button props
  const props = {
    radius: "sm",
    color: "primary",
  };

  return (
    <THForm onSubmit={onSubmit} resolver={zodResolver(commentValidationSchema)}>
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
              htmlFor="images"
              size="sm"
              startContent={<LuImagePlus size={18} />}
            >
              <input
                id="images"
                type="file"
                accept="image/*"
                multiple // Allow multiple files
                className="hidden"
                onChange={handleImagesChange}
              />
            </Button>
          </div>
        </div>
        <div className="flex justify-end">
          {user ? (
            <Button
              isLoading={isPending}
              type="submit"
              variant="solid"
              radius="sm"
              color="primary"
            >
              Comment
            </Button>
          ) : (
            <AuthenticationModal
              redirect={`/blogs/${slug}`}
              buttonContent={"Comment"}
              {...props}
            />
          )}
        </div>
      </div>
    </THForm>
  );
};

export default CommentForm;
