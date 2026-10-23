"use client";

import { useUpdateBlogByAdmin } from "@/hooks/blog.hook";
import { getAllCategories } from "@/services/category";
import { ICategory, IBlog } from "@/types";
import {
  Button,
  Image,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  useDisclosure,
} from "@heroui/react";
import { useEffect, useState } from "react";
import { FiEdit3 } from "react-icons/fi";
import RichTextEditor from "@/components/editor/rich-text-editor";

interface IProps {
  blog: IBlog;
  refetchBlogs: () => void;
}

const UpdateBlogModal = ({ blog, refetchBlogs }: IProps) => {
  const [title, setTitle] = useState(blog?.title);
  const [content, setContent] = useState(blog?.content);
  const [category, setCategory] = useState(blog.category?._id);
  const [tags, setTags] = useState(blog.tags?.join(", ") || "");
  const [categories, setCategories] = useState<
    { key: string; label: string }[]
  >([]);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState(blog.coverImage);
  const [isOpen, setIsOpen] = useState(false);
  const { isOpen: modalIsOpen, onOpen, onOpenChange } = useDisclosure();

  const { mutate: updateBlog, isPending } = useUpdateBlogByAdmin();

  const fetchCategories = async () => {
    try {
      const categoryData = await getAllCategories();
      const data = categoryData?.data as ICategory[];
      const modifiedCategories = data.map((category) => ({
        key: category._id,
        label: category.name,
      }));
      setCategories(modifiedCategories);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  // Fetch categories only when the modal is opened
  const handleOpen = () => {
    if (!categories.length) {
      fetchCategories();
    }
    onOpen();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdate = async () => {
    const tagsArray = tags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag !== "");

    const formData = new FormData();
    const values = {
      userId: blog.author._id,
      title,
      content,
      category,
      tags: tagsArray,
    };

    formData.append("data", JSON.stringify(values));

    if (coverImage) {
      formData.append("image", coverImage);
    }


    updateBlog({blogId: blog._id, payload: formData}, {
      onSuccess: () => {
        refetchBlogs();
      },
    })
    onOpenChange();
  };

  return (
    <>
      <Button
        isIconOnly
        aria-label="Edit article"
        isLoading={isPending}
        color="primary"
        size="sm"
        radius="lg"
        variant="flat"
        onClick={handleOpen}
      >
        {isPending ? null : <FiEdit3 className="size-4" aria-hidden />}
      </Button>

      <Modal
        size="3xl"
        isOpen={modalIsOpen}
        scrollBehavior="inside"
        onOpenChange={onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Update Blog
              </ModalHeader>
              <ModalBody>
                <div className="relative mb-4">
                  <Image className="w-full" src={coverImagePreview} />
                  <Button
                    variant="faded"
                    color="default"
                    radius="full"
                    size="sm"
                    className="absolute top-4 z-10 right-5"
                    onClick={() =>
                      document.getElementById("coverImageInput")?.click()
                    }
                  >
                    Change Image
                  </Button>
                  <input
                    id="coverImageInput"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </div>

                <Input
                  className="mb-4"
                  size="lg"
                  radius="sm"
                  variant="bordered"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Blog Title"
                />

                {blog.contentType === "html" && (
                  <div className="mb-4">
                    <RichTextEditor value={content} onChange={setContent} />
                  </div>
                )}

                <div className="mb-4">
                  <Select
                    aria-label="category-select"
                    onChange={(e) => setCategory(e.target.value)}
                    size="lg"
                    radius="sm"
                    variant="bordered"
                    isOpen={isOpen}
                    defaultSelectedKeys={[category]}
                    onOpenChange={(open) => setIsOpen(open)}
                  >
                    {categories.map((cate) => (
                      <SelectItem key={cate.key}>{cate.label}</SelectItem>
                    ))}
                  </Select>
                </div>

                <Input
                  size="lg"
                  radius="sm"
                  variant="bordered"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="Tags (comma-separated)"
                />

                <ModalFooter className="px-0">
                  <Button onClick={handleUpdate} radius="full" color="primary">
                    Update
                  </Button>
                </ModalFooter>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default UpdateBlogModal;
