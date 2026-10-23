"use client";

import CommentCard from "@/components/comment-card";
import AuthenticationModal from "@/components/modals/authentication-modal";
import THForm from "@/components/form/th-from";
import THTextarea from "@/components/form/th-textarea";
import { useUser } from "@/context/user.provider";
import { useCommentOnBlog } from "@/hooks/blog.hook";
import { commentValidationSchema } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { Avatar } from "@heroui/avatar";
import { Button } from "@heroui/react";
import Link from "next/link";
import { useState } from "react";
import { FieldValues, SubmitHandler } from "react-hook-form";
import { AiOutlineComment } from "react-icons/ai";
import { LuImagePlus, LuX } from "react-icons/lu";
import { toast } from "sonner";
import type { IComment } from "@/types/comment.type";

interface IProps {
  blogId: string;
  comments: IComment[];
  /** Visible comments in total; may exceed the ones passed in. */
  totalComments: number;
  /** Where a guest is sent after signing in to comment. */
  redirectPath: string;
}

/**
 * The article's discussion: a composer for signed-in readers, then the thread.
 *
 * A guest sees a single "Sign in to comment" call to action instead of a
 * disabled form, and an empty thread explains itself rather than rendering an
 * empty gap.
 */
const BlogComments = ({
  blogId,
  comments,
  totalComments,
  redirectPath,
}: IProps) => {
  const { user } = useUser();
  const { mutate: commentOnBlog, isPending } = useCommentOnBlog();
  const [selectedImages, setSelectedImages] = useState<File[]>([]);

  const handleImagesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const selectedFiles = Array.from(files);
    if (selectedFiles.length + selectedImages.length > 4) {
      toast.warning("You can only upload a maximum of 4 images.", {
        id: "max-images-warning",
        closeButton: true,
      });
      return;
    }

    setSelectedImages((prev) => [...prev, ...selectedFiles].slice(0, 4));
  };

  const onSubmit: SubmitHandler<FieldValues> = (values) => {
    const formData = new FormData();
    formData.append("data", JSON.stringify(values));
    selectedImages.forEach((file) => formData.append("images", file));

    commentOnBlog(
      { blogId, payload: formData },
      { onSuccess: () => setSelectedImages([]) },
    );
  };

  return (
    <section id="comments" className="scroll-mt-24 space-y-6 print:hidden">
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-default/60 pb-3">
        <h2 className="flex items-center gap-2 text-xl font-semibold tracking-tight">
          <AiOutlineComment aria-hidden className="text-primary-accessible" />
          Discussion
        </h2>
        <p className="text-sm tabular-nums text-default-600">
          {totalComments === 0
            ? "No comments yet"
            : `${totalComments.toLocaleString()} ${
                totalComments === 1 ? "comment" : "comments"
              }`}
        </p>
      </div>

      {user ? (
        <div className="flex gap-3">
          <Avatar
            className="mt-1 hidden size-9 shrink-0 sm:flex"
            src={user.profilePicture}
            name={user.name || user.email}
          />
          <div className="min-w-0 flex-1">
            <THForm
              onSubmit={onSubmit}
              resolver={zodResolver(commentValidationSchema)}
            >
              <div className="space-y-3">
                <div className="relative">
                  <THTextarea
                    id="comment-field"
                    name="content"
                    placeholder="Add to the discussion: what worked for you, or what you want to ask."
                    minRows={3}
                    radius="lg"
                    variant="bordered"
                    classNames={{
                      input: "text-sm",
                      inputWrapper: "bg-default-50/60",
                    }}
                  />
                  <Button
                    as="label"
                    htmlFor="images"
                    type="button"
                    isIconOnly
                    radius="full"
                    variant="light"
                    size="sm"
                    aria-label="Attach images"
                    className="absolute bottom-2 right-2"
                  >
                    <LuImagePlus aria-hidden className="size-4" />
                    <input
                      id="images"
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleImagesChange}
                    />
                  </Button>
                </div>

                {selectedImages.length > 0 && (
                  <ul className="flex flex-wrap gap-2">
                    {selectedImages.map((file, index) => (
                      <li
                        key={`${file.name}-${index}`}
                        className="flex items-center gap-1.5 rounded-full bg-default-100 py-1 pl-3 pr-1.5 text-xs text-default-600"
                      >
                        <span className="max-w-40 truncate">{file.name}</span>
                        <button
                          type="button"
                          aria-label={`Remove ${file.name}`}
                          className="rounded-full p-0.5 hover:bg-default-200"
                          onClick={() =>
                            setSelectedImages((prev) =>
                              prev.filter((_, i) => i !== index),
                            )
                          }
                        >
                          <LuX className="size-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs text-default-600">
                    Be kind. Comments are public.
                  </p>
                  <Button
                    isLoading={isPending}
                    type="submit"
                    radius="lg"
                    color="primary"
                  >
                    Comment
                  </Button>
                </div>
              </div>
            </THForm>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-start gap-4 border-t border-default/60 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-medium">Join the discussion</p>
            <p className="mt-0.5 text-sm text-default-600">
              Sign in to comment on this article. It takes a moment.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <Button
              as={Link}
              href={`/login?redirect=${redirectPath}`}
              radius="lg"
              color="primary"
            >
              Log in
            </Button>
            <div className="[&_button]:!rounded-lg [&_button]:!border-1 [&_button]:!border-default-300 [&_button]:!bg-transparent [&_button]:!text-foreground">
              <AuthenticationModal
                redirect={redirectPath}
                buttonContent="Create account"
              />
            </div>
          </div>
        </div>
      )}

      {comments.length > 0 ? (
        <ol className="space-y-4">
          {comments.map((comment) => (
            <li key={comment._id}>
              <CommentCard {...comment} />
            </li>
          ))}
        </ol>
      ) : (
        <div className="border-t border-default/60 px-1 py-8 text-center">
          <p className="text-sm font-medium">Be the first to comment</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-default-600">
            Questions and field notes are welcome. Help the next reader who
            finds this article.
          </p>
        </div>
      )}
    </section>
  );
};

export default BlogComments;
