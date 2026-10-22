"use client";

import {
  Button,
  Checkbox,
  Image,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  Spinner,
  useDisclosure,
} from "@heroui/react";
import RichTextEditor from "@/components/editor/rich-text-editor";
import { useState, useRef, useEffect } from "react";
import { GoImage } from "react-icons/go";
import { RiCloseLargeFill } from "react-icons/ri";
import { useForm, Controller, FieldValues } from "react-hook-form";
import { getAllCategories } from "@/services/category";
import { ICategory, IUser } from "@/types";
import { getProfileInfo } from "@/services/auth";
import { useCreatePost } from "@/hooks/post.hook";
import { useRouter } from "next/navigation";

interface BlogFormData {
  title: string;
  content: string;
  category: string;
  tags: string[];
}

const WriteBlog = () => {
  const {
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BlogFormData>({
    defaultValues: {
      title: '',
      content: '',
      category: '',
      tags: [],
    }
  });

  const router = useRouter()

  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [currentUser, setCurrentUser] = useState<IUser>();
  const {
    mutate: handleCreatePost,
    isPending,
  } = useCreatePost();

  const [tagInput, setTagInput] = useState("");

  const getUser = async () => {
    const profileData = await getProfileInfo();
    const user = (profileData.data as IUser) ?? {};
    setCurrentUser(user);
  };

  useEffect(() => {
    getUser();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoryData = await getAllCategories();
        const data = categoryData?.data as ICategory[];
        setCategories(data);
      } catch (error) {
        console.log("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setCoverImageFile(file);
    }
  };

  const handleAddCoverClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleRemoveImage = () => {
    setCoverImageFile(null);
  };

  const onSubmit = (data: FieldValues) => {
    const formData = new FormData();
    if (coverImageFile) {
      formData.append("image", coverImageFile);
    }

    const postData = {
      ...data,
      contentType: "html",
      tags: data.tags, // tags are already an array now
      isPremium: false,
    };

    formData.append("data", JSON.stringify(postData));

    handleCreatePost(formData, {
      onSuccess: () => {
        router.push(`/?new=${data?.title}`)
      }
    });
    reset();
    setCoverImageFile(null);
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const currentTags = watch('tags');
      if (!currentTags.includes(tagInput.trim())) {
        setValue('tags', [...currentTags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const currentTags = watch('tags');
    setValue('tags', currentTags.filter(tag => tag !== tagToRemove));
  };

  return (
    <>
      {/* Preview Modal */}
      <Modal
        scrollBehavior="inside"
        size="full"
        backdrop="opaque"
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        classNames={{
          backdrop:
            "bg-gradient-to-t from-zinc-900 to-zinc-900/10 backdrop-opacity-20",
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Blog Preview</ModalHeader>
              <ModalBody className="mx-auto max-w-5xl">
                {coverImageFile && (
                  <Image
                    src={URL.createObjectURL(coverImageFile)}
                    alt="Cover Preview"
                    className="w-full mb-4 rounded mx-auto"
                  />
                )}
                <h3 className="text-xl font-bold mb-2">
                  {watch("title") || "Untitled"}
                </h3>
                <div className="prose dark:prose-invert max-w-full">
                  <div dangerouslySetInnerHTML={{ __html: watch("content") }} />
                </div>
                <div className="flex gap-2 flex-wrap">
                  {watch("tags")?.map((tag: string) => (
                    <span
                      key={tag}
                      className="bg-default-200 rounded text-xs px-2 py-1"
                    >
                      {tag}
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

      <>
        {isPending ? (
          <div className="flex justify-center py-16 min-h-[500px]">
            <Spinner size="lg" />
          </div>
        ) : (
          <>
            <div className="flex items-center justify-end space-x-2 mb-4">
              <Button
                type="button"
                radius="sm"
                variant="ghost"
                onClick={onOpen}
              >
                Preview
              </Button>
              <Button
                radius="sm"
                color="primary"
                variant="solid"
                onClick={handleSubmit(onSubmit)}
              >
                Publish
              </Button>
            </div>
            <div className="flex justify-start mb-4 relative">
              {!coverImageFile ? (
                <div
                  className="w-full h-48 border-2 border-dashed border-default-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors"
                  onClick={handleAddCoverClick}
                >
                  <GoImage className="text-4xl text-default-400" />
                  <p className="text-default-500 mt-2">Click to add cover image</p>
                  <p className="text-xs text-default-400 mt-1">Drag and drop your image here</p>
                </div>
              ) : (
                <>
                  <img
                    src={URL.createObjectURL(coverImageFile)}
                    alt="Cover Preview"
                    className="w-full object-cover rounded"
                  />
                  <Button
                    isIconOnly
                    variant="faded"
                    radius="sm"
                    className="absolute top-4 right-4"
                    onClick={handleRemoveImage}
                  >
                    <RiCloseLargeFill />
                  </Button>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Controller
                  name="title"
                  control={control}
                  rules={{ required: "Title is required" }}
                  render={({ field }) => (
                    <>
                      <Input
                        {...field}
                        radius="sm"
                        size="lg"
                        variant="flat"
                        isRequired
                        label="Blog Title"
                      />
                      {errors.title?.message && (
                        <p className="text-red-500 text-sm mt-2">
                          {String(errors.title.message)}
                        </p>
                      )}
                    </>
                  )}
                />
              </div>

              <div>
                <Controller
                  name="content"
                  control={control}
                  rules={{ required: "Content is required" }}
                  render={({ field }) => (
                    <>
                      <RichTextEditor
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        hasError={!!errors.content}
                      />
                      {errors.content?.message && (
                        <p className="text-red-500 text-sm mt-2">
                          {String(errors.content.message)}
                        </p>
                      )}
                    </>
                  )}
                />
              </div>

              <div>
                <Controller
                  name="category"
                  control={control}
                  rules={{ required: "Category is required" }}
                  render={({ field }) => (
                    <>
                      <Select {...field} label="Category" isRequired>
                        {categories?.map((category) => (
                          <SelectItem key={category._id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </Select>
                      {errors.category?.message && (
                        <p className="text-red-500 text-sm mt-2">
                          {String(errors.category.message)}
                        </p>
                      )}
                    </>
                  )}
                />
              </div>

              <div>
                <Controller
                  name="tags"
                  control={control}
                  rules={{ required: "At least one tag is required" }}
                  render={({ field: { value } }) => (
                    <div className="space-y-2">
                      <Input
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleAddTag}
                        radius="sm"
                        label="Enter tags (press Enter to add)"
                        placeholder="Type and press Enter"
                        isRequired
                      />
                      <div className="flex flex-wrap gap-2 mt-2">
                        {value?.map((tag: string) => (
                          <Button
                            key={tag}
                            size="sm"
                            radius="sm"
                            variant="flat"
                            color="primary"
                            endContent={
                              <RiCloseLargeFill
                                className="cursor-pointer"
                                onClick={() => handleRemoveTag(tag)}
                              />
                            }
                          >
                            {tag}
                          </Button>
                        ))}
                      </div>
                      {errors.tags && (
                        <p className="text-red-500 text-sm">
                          {String(errors.tags.message)}
                        </p>
                      )}
                    </div>
                  )}
                />
              </div>
            </form>
          </>
        )}
      </>
    </>
  );
};

export default WriteBlog;
