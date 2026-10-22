"use client";

import Loading from "@/components/loading";
import { useUpdatePostByUserUsingId } from "@/hooks/post.hook";
import { getAllCategories } from "@/services/category";
import { ICategory, IPost } from "@/types";
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
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import "react-quill/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false }) as any;

interface IProps {
  post: IPost;
}

const UpdateBlog = ({ post }: IProps) => {
  const [title, setTitle] = useState(post?.title);
  const [content, setContent] = useState(post?.content);
  const [category, setCategory] = useState(post.category?._id);
  const [tags, setTags] = useState(post.tags?.join(", ") || "");
  const [categories, setCategories] = useState<
    { key: string; label: string }[]
  >([]);
  const [coverImage, setCoverImage] = useState<File | null>(null); // Store as File type
  const [coverImagePreview, setCoverImagePreview] = useState(post.coverImage); // Preview image
  const [isOpen, setIsOpen] = useState(false);

  const { mutate: updatePost, isPending, data } = useUpdatePostByUserUsingId();
  const { isOpen: modalIsOpen, onOpen, onOpenChange } = useDisclosure();
  const router = useRouter()


  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoryData = await getAllCategories();
        const data = categoryData?.data as ICategory[];
        const modifiedCategories = data?.map((category) => ({
          key: category._id,
          label: category.name,
        }));
        setCategories(modifiedCategories);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImage(file); // Store the file object
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImagePreview(reader.result as string); // Update the preview
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
      title,
      content,
      category,
      tags: tagsArray,
    };

    formData.append("data", JSON.stringify(values));

    if (coverImage) {
      formData.append("image", coverImage); // Append the image file
    }
    

    updatePost({ postId: post._id, payload: formData });

  };

  if(!isPending && data?.success){
    router.push(`/settings/update/${data?.data?.slug}`);
  }

  return (
    <>
      {isPending && <Loading />}

      <Modal
        scrollBehavior="inside"
        size="3xl"
        backdrop="opaque"
        isOpen={modalIsOpen}
        onOpenChange={onOpenChange}
        classNames={{
          backdrop:
            "bg-gradient-to-t from-zinc-900 to-zinc-900/10 backdrop-opacity-20",
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Blog Preview
              </ModalHeader>
              <ModalBody className="w-full">
                <Image
                  src={
                    coverImage
                      ? URL.createObjectURL(coverImage)
                      : coverImagePreview
                  }
                  alt="Cover Preview"
                  className="w-full mb-4 object-cover rounded-md"
                />

                <div className="flex justify-end">
                  <Button radius="full" size="sm" variant="flat">
                    {categories?.find((c) => c.key === category)?.label}
                  </Button>
                </div>
                <h3 className="text-xl font-bold mb-2">{title}</h3>
                <ReactQuill
                  readOnly
                  modules={{ toolbar: false }}
                  theme="snow"
                  value={content}
                />
                <div className="flex gap-2 flex-wrap">
                  {tags?.split(",").map((tag: string) => (
                    <span
                      key={tag}
                      className="bg-default-200 rounded-sm text-xs px-2 py-1"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <div className="">
        <div className="relative mb-4">
          <Image className="w-full" src={coverImagePreview} />
          <Button
            variant="faded"
            color="default"
            radius="full"
            size="sm"
            className="absolute top-4 z-10 right-5"
            onClick={() => document.getElementById("coverImageInput")?.click()}
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

        {post.contentType === "html" && (
          <ReactQuill
            className="mb-4"
            value={content}
            onChange={setContent}
            required
            placeholder="Write your blog here..."
            modules={{
              toolbar: [
                [{ header: [1, 2, false] }],
                [
                  "bold",
                  "italic",
                  "underline",
                  "strike",
                  "blockquote",
                  "code-block",
                ],
                [
                  { list: "ordered" },
                  { list: "bullet" },
                  { indent: "-1" },
                  { indent: "+1" },
                ],
                ["link"],
                ["clean"],
              ],
            }}
            theme="snow"
          />
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
            onOpenChange={(open) => open !== isOpen && setIsOpen(open)}
      
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

        <div className="space-x-2 absolute top-0 right-2 lg:right-0">
          <Button radius="full" variant="bordered" onClick={onOpen}>
            Preview
          </Button>
          <Button onClick={handleUpdate} radius="full" color="primary">
            Update
          </Button>
        </div>
      </div>
    </>
  );
};

export default UpdateBlog;
