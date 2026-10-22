"use client";

import { EditorToolbar, EditorSurface, useComposerEditor } from "@/components/editor/rich-text-editor";
import { ARTICLE_EDIT_LEAVE_EVENT } from "@/components/modules/edit-blog/back-to-articles";
import AutoGrowTextarea from "@/components/modules/write-blog/auto-grow-textarea";
import CoverUpload from "@/components/modules/write-blog/cover-upload";
import TagInput from "@/components/modules/write-blog/tag-input";
import { useUpdatePostByUserUsingId } from "@/hooks/post.hook";
import { getAllCategories } from "@/services/category";
import { ICategory, IPost } from "@/types";
import {
  Button,
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
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  LuChevronDown,
  LuEye,
  LuRotateCcw,
  LuSave,
  LuTriangleAlert,
} from "react-icons/lu";
import { toast } from "sonner";
/** Words added to every tag list, so an edit does not have to retype them. */
const COMMON_TAGS = [
  "javascript",
  "typescript",
  "react",
  "nextjs",
  "nodejs",
  "css",
  "tailwindcss",
  "mongodb",
  "express",
  "tutorial",
  "beginners",
  "webdev",
];

interface IForm {
  title: string;
  content: string;
  category: string;
  tags: string[];
}

type DirtyField = keyof IForm | "cover";

/**
 * The text fields the post had when the page opened, as a comparable string.
 *
 * The cover is deliberately left out: it is tracked by whether a replacement
 * file is still pending, because the API has no way to delete a stored one and
 * a pending removal is not something "Save" can act on.
 */
const snapshotOf = (values: IForm) => JSON.stringify(values);

/** Plain words in the body, for the live word count. */
const countWords = (html: string) => {
  const text = html
    .replace(/<(style|script)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .trim();
  return text ? text.split(/\s+/).length : 0;
};

const validate = (values: IForm) => {
  const errors: Partial<Record<keyof IForm, string>> = {};

  if (!values.title.trim()) errors.title = "Give the article a title.";
  else if (values.title.trim().length < 4)
    errors.title = "The title needs at least 4 characters.";

  if (countWords(values.content) === 0) errors.content = "Write some content.";

  if (!values.category) errors.category = "Choose a category.";

  if (!values.tags.length) errors.tags = "Add at least one tag.";

  return errors;
};

/** Builds the multipart body `PUT /posts/:id` validates (`update` schema). */
const buildPayload = (values: IForm, coverImage: File | null) => {
  const formData = new FormData();

  // Only the fields the update schema accepts: it is `.strict()`, so any extra
  // key (an `id`, a `description`) fails the whole request with a 400.
  formData.append(
    "data",
    JSON.stringify({
      title: values.title.trim(),
      content: values.content,
      category: values.category,
      tags: values.tags,
      contentType: "html",
    }),
  );

  // Appending the file is what tells the API to replace the stored cover;
  // omitting it leaves the current one alone.
  if (coverImage) formData.append("image", coverImage);

  return formData;
};

/**
 * Article editor for a published post.
 *
 * Same shape as the composer, so writing and editing feel like one tool: the
 * cover and title are the page, the body is the writing surface with a sticky
 * toolbar, and category and tags sit below the piece. The differences are all
 * about being safe to edit live: changes are tracked against the saved post,
 * the save button says what state it is in, and leaving with unsaved changes
 * asks first.
 */
const EditBlog = ({ post }: { post: IPost }) => {
  const router = useRouter();
  const { mutate: updatePost, isPending } = useUpdatePostByUserUsingId();
  const preview = useDisclosure();
  const leavePrompt = useDisclosure();

  const initial = useMemo<IForm>(
    () => ({
      title: post.title ?? "",
      content: post.content ?? "",
      category: post.category?._id ?? "",
      tags: post.tags ?? [],
    }),
    [post],
  );

  const [values, setValues] = useState<IForm>(initial);
  const [savedSnapshot, setSavedSnapshot] = useState(() => snapshotOf(initial));
  const [coverImage, setCoverImage] = useState<File | null>(null);
  // The API has no way to delete a stored cover, so "remove" only hides the
  // image on this screen and the field says so. A replacement is a real change.
  const [coverRemoved, setCoverRemoved] = useState(false);
  // The post's cover as the server has it, or as this session just saved it.
  const [savedCoverPreview, setSavedCoverPreview] = useState<string | null>(
    typeof post.coverImage === "string" ? post.coverImage : null,
  );

  // The cover to show right now: the picked file, else the saved one.
  const filePreview = useMemo(
    () => (coverImage ? URL.createObjectURL(coverImage) : null),
    [coverImage],
  );
  useEffect(() => {
    if (!filePreview) return;
    return () => URL.revokeObjectURL(filePreview);
  }, [filePreview]);
  const displayedCover = coverRemoved
    ? null
    : filePreview ?? savedCoverPreview;
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [errors, setErrors] = useState<Partial<Record<keyof IForm, string>>>({});
  const [detailsOpen, setDetailsOpen] = useState(false);

  const titleRef = useRef<HTMLTextAreaElement>(null);
  // Object URLs made for a just-saved cover; released when the page unmounts.
  const savedPreviewUrls = useRef<string[]>([]);
  useEffect(
    () => () => {
      for (const url of savedPreviewUrls.current) URL.revokeObjectURL(url);
    },
    [],
  );

  const update = useCallback(
    <K extends keyof IForm>(key: K, value: IForm[K]) => {
      setValues((current) => ({ ...current, [key]: value }));
    },
    [],
  );

  const onChange = useCallback(
    (html: string) => update("content", html),
    [update],
  );

  // Seeds the editor with the stored body and keeps it in step if the page is
  // re-rendered from the server with new content.
  const editor = useComposerEditor({ value: values.content, onChange });

  /* ---------------------------------------------------------------- effects */

  useEffect(() => {
    getAllCategories()
      .then((data) => setCategories((data?.data as ICategory[]) ?? []))
      .catch(() => setCategories([]));
  }, []);

  // A pending removal is not saveable, so it is not part of the dirty check;
  // only a replacement file is. The string snapshot covers the text fields.
  const currentSnapshot = JSON.stringify({ ...values });
  const dirty =
    currentSnapshot !== savedSnapshot || Boolean(coverImage);

  const dirtyFields = useMemo(() => {
    const fields: Partial<Record<DirtyField, boolean>> = {};
    if (values.title.trim() !== initial.title.trim()) fields.title = true;
    if (values.content !== initial.content) fields.content = true;
    if (values.category !== initial.category) fields.category = true;
    if (values.tags.join(",") !== initial.tags.join(",")) fields.tags = true;
    if (coverImage) fields.cover = true;
    return fields;
  }, [values, initial, coverImage]);

  const dirtyLabels = useMemo(
    () =>
      (Object.keys(dirtyFields) as DirtyField[]).map((field) => {
        if (field === "cover") return "cover image";
        return field;
      }),
    [dirtyFields],
  );

  // The preview needs the cover being edited, whichever one that is.
  const previewCover = displayedCover;

  // Leaving with unsaved work warns instead of discarding it silently.
  useEffect(() => {
    const handler = (event: BeforeUnloadEvent) => {
      if (isPending || !dirty) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty, isPending]);

  // In-app links (e.g. "All articles") ask before navigating away, so a click
  // cannot silently drop unsaved work. Only a dirty form cancels the click.
  useEffect(() => {
    const handler = (event: Event) => {
      if (!dirty || isPending) return;
      event.preventDefault();
      leavePrompt.onOpen();
    };
    window.addEventListener(ARTICLE_EDIT_LEAVE_EVENT, handler);
    return () => window.removeEventListener(ARTICLE_EDIT_LEAVE_EVENT, handler);
  }, [dirty, isPending, leavePrompt]);

  /* ---------------------------------------------------------------- actions */

  const focusField = (field: keyof IForm) => {
    if (field === "content") {
      editor?.chain().focus().run();
      window.scrollTo({ top: 260, behavior: "smooth" });
      return;
    }

    if (field === "category" || field === "tags") {
      if (!detailsOpen) setDetailsOpen(true);
      window.setTimeout(() => {
        if (field === "category") {
          const trigger = document.getElementById("edit-category");
          trigger?.scrollIntoView({ behavior: "smooth", block: "center" });
          trigger?.focus();
          trigger?.click();
          return;
        }
        document.getElementById("edit-tags")?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        document.getElementById("edit-tags")?.focus();
      }, 120);
      return;
    }

    titleRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    titleRef.current?.focus();
  };

  const save = () => {
    const found = validate(values);
    setErrors(found);

    const first = (["title", "content", "category", "tags"] as const).find(
      (field) => found[field],
    );
    if (first) {
      focusField(first);
      toast.error(found[first], { id: "edit-check" });
      return;
    }

    updatePost(
      { postId: post._id, payload: buildPayload(values, coverImage) },
      {
        onSuccess: (data) => {
          if (!data?.success) return;

          // The text fields are the baseline; the cover is tracked by whether a
          // file is still pending. A saved cover keeps its own preview URL, so
          // it survives `coverImage` being cleared (whose cleanup revokes the
          // pending preview) and stays on screen until the refreshed page
          // delivers the stored image.
          if (coverImage) {
            const savedPreview = URL.createObjectURL(coverImage);
            setSavedCoverPreview(savedPreview);
            savedPreviewUrls.current.push(savedPreview);
          }
          setSavedSnapshot(JSON.stringify({ ...values }));
          setCoverImage(null);

          // The API writes a new slug from the title, so the address changes
          // with it. Carry the reader across instead of leaving the old one in
          // the URL.
          const nextSlug = data?.data?.slug;
          if (nextSlug && nextSlug !== post.slug) {
            router.replace(`/settings/edit/${nextSlug}`);
          }

          router.refresh();
        },
      },
    );
  };

  const discard = () => {
    setValues(initial);
    setErrors({});
    setCoverImage(null);
    setCoverRemoved(false);
    setSavedCoverPreview(
      typeof post.coverImage === "string" ? post.coverImage : null,
    );
    setTagInput("");
    editor?.commands.setContent(initial.content || "", { emitUpdate: false });
    toast("Reverted to the published version", { id: "edit-discard" });
  };

  const tags = useMemo(
    () => Array.from(new Set([...values.tags, ...COMMON_TAGS])),
    [values.tags],
  );

  const words = countWords(values.content);
  const categoryName = categories.find((c) => c._id === values.category)?.name;
  const errorCount = Object.values(errors).filter(Boolean).length;
  const publishedAt = new Date(post.createdAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  /* ----------------------------------------------------------------- render */

  return (
    <div className="relative">
      {isPending && (
        <div className="fixed inset-0 z-[1111] flex items-center justify-center bg-background/60 backdrop-blur-sm">
          <div className="flex items-center gap-3 rounded-xl border border-default-200 bg-content1 px-4 py-3 text-sm shadow-lg">
            <Spinner size="sm" />
            Saving your changes…
          </div>
        </div>
      )}

      {/* Preview ------------------------------------------------------- */}
      <Modal
        scrollBehavior="inside"
        size="3xl"
        backdrop="opaque"
        isOpen={preview.isOpen}
        onOpenChange={preview.onOpenChange}
        classNames={{
          backdrop: "bg-black/60 backdrop-blur-sm",
          base: "bg-content1",
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex items-center gap-2 text-sm font-medium text-default-500">
                <LuEye className="size-4" />
                Preview
              </ModalHeader>
              <ModalBody className="pb-8">
                <article className="mx-auto w-full max-w-2xl">
                  {previewCover && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={previewCover}
                      alt=""
                      className="mb-8 aspect-[16/8] w-full rounded-xl object-cover"
                    />
                  )}
                  <h1 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                    {values.title || "Untitled"}
                  </h1>
                  <div className="mt-8">
                    {words > 0 ? (
                      // The published article's own typography.
                      <div
                        className="prose dark:prose-invert max-w-none tth-prose"
                        dangerouslySetInnerHTML={{ __html: values.content }}
                      />
                    ) : (
                      <p className="text-default-400">Nothing written yet.</p>
                    )}
                  </div>
                  {values.tags.length > 0 && (
                    <div className="mt-10 flex flex-wrap gap-2">
                      {values.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-md bg-default-100 px-2 py-1 text-xs text-default-600"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </article>
              </ModalBody>
              <ModalFooter className="border-t border-default-200">
                <Button variant="light" onPress={onClose}>
                  Close preview
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Leave prompt -------------------------------------------------- */}
      <Modal
        isOpen={leavePrompt.isOpen}
        onOpenChange={leavePrompt.onOpenChange}
        backdrop="opaque"
        size="md"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Leave without saving?
              </ModalHeader>
              <ModalBody>
                <p className="text-sm leading-relaxed text-default-600">
                  Your unsaved edits will be lost. The published article keeps
                  its current version.
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
                    router.push("/settings/manage-blogs");
                  }}
                >
                  Leave
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Sticky action bar --------------------------------------------- */}
      <div className="sticky top-16 z-30 -mx-2 mb-6 border-b border-default-200 bg-background/85 px-2 py-2 backdrop-blur-md lg:-mx-0">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <div className="min-w-0 flex-1 [&_.tth-toolbar]:border-0 [&_.tth-toolbar]:px-0 max-sm:[&_.tth-toolbar]:mt-0 sm:[&_.tth-toolbar]:-mb-1">
            <EditorToolbar editor={editor}>
              <span
                className="mr-1 hidden whitespace-nowrap px-1 text-xs tabular-nums text-default-500 lg:inline"
                aria-live="polite"
              >
                {words} {words === 1 ? "word" : "words"}
              </span>
            </EditorToolbar>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <Button
              size="sm"
              variant="bordered"
              startContent={<LuEye className="size-3.5" />}
              onPress={preview.onOpen}
            >
              <span className="hidden sm:inline">Preview</span>
            </Button>
            <Button
              size="sm"
              color="primary"
              startContent={isPending ? null : <LuSave className="size-3.5" />}
              isDisabled={isPending || !dirty}
              isLoading={isPending}
              onPress={save}
            >
              {isPending ? "Saving" : "Save changes"}
            </Button>
          </div>
        </div>

        {/* State ------------------------------------------------------- */}
        <div className="mx-auto mt-0.5 flex flex-wrap items-center gap-2 text-xs">
          {errorCount > 0 ? (
            <span className="inline-flex items-center gap-1 font-medium text-danger" role="alert">
              <LuTriangleAlert aria-hidden className="size-3.5" />
              {errorCount} {errorCount === 1 ? "field needs" : "fields need"} attention
            </span>
          ) : (
            <span
              className={
                dirty
                  ? "font-medium text-warning-600 dark:text-warning"
                  : "text-default-500"
              }
              aria-live="polite"
              data-testid="edit-status"
            >
              {dirty ? "Unsaved changes" : `Published ${publishedAt}`}
            </span>
          )}
          {dirty && (
            <>
              <span aria-hidden className="text-default-300">
                ·
              </span>
              <span className="text-default-500">{dirtyLabels.join(", ")}</span>
            </>
          )}
        </div>
      </div>

      {/* Navigation ---------------------------------------------------- */}
      {dirty && (
        <div className="mx-auto mb-1 flex max-w-3xl justify-end">
          <button
            type="button"
            onClick={discard}
            className="inline-flex items-center gap-1.5 text-sm text-default-500 transition-colors hover:text-danger"
          >
            <LuRotateCcw aria-hidden className="size-3.5" />
            Discard changes
          </button>
        </div>
      )}

      {/* The piece ----------------------------------------------------- */}
      <div className="mx-auto max-w-3xl">
        <CoverUpload
          file={coverImage}
          onChange={(file) => {
            setCoverImage(file);
            // Choosing a replacement clears a pending removal; clearing it
            // again re-adds the reminder below.
            if (file) setCoverRemoved(false);
          }}
          onRemoveExisting={() => {
            setCoverImage(null);
            setCoverRemoved(true);
          }}
          // The component prefers the pending file over this, so it only ever
          // shows once no replacement is picked.
          existing={coverRemoved ? null : savedCoverPreview}
        />

        {coverRemoved && (
          <p className="mt-2 flex items-start gap-1.5 text-xs text-warning-600 dark:text-warning" role="status">
            <LuTriangleAlert aria-hidden className="mt-px size-3.5 shrink-0" />
            Removing a cover is not supported yet - this article keeps its
            current image. Choose a new file to replace it instead.
          </p>
        )}

        <div className="mt-8">
          <label htmlFor="edit-title" className="sr-only">
            Title
          </label>
          <AutoGrowTextarea
            id="edit-title"
            ref={titleRef}
            value={values.title}
            onChange={(value) => {
              update("title", value);
              if (errors.title) {
                setErrors((current) => ({ ...current, title: undefined }));
              }
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                editor?.chain().focus("start").run();
              }
            }}
            maxLength={140}
            placeholder="Article title"
            aria-invalid={Boolean(errors.title)}
            className={`w-full bg-transparent text-3xl font-semibold tracking-tight text-foreground placeholder:text-default-300 focus:outline-none sm:text-4xl md:text-[2.75rem] md:leading-[1.15] ${
              errors.title ? "rounded-md ring-1 ring-danger" : ""
            }`}
          />
          <div className="mt-2 flex items-start justify-between gap-3">
            {errors.title ? (
              <p className="text-xs text-danger" role="alert">
                {errors.title}
              </p>
            ) : (
              <span />
            )}
            <span className="shrink-0 text-xs tabular-nums text-default-400">
              {values.title.length}/140
            </span>
          </div>

          <div
            className={`mt-4 tth-writing-surface ${
              errors.content ? "tth-editor-invalid" : ""
            }`}
            onFocusCapture={() => {
              if (errors.content) {
                setErrors((current) => ({ ...current, content: undefined }));
              }
            }}
          >
            <EditorSurface
              editor={editor}
              hasError={Boolean(errors.content)}
            />
          </div>
          {errors.content && (
            <p className="mt-1 text-xs text-danger" role="alert">
              {errors.content}
            </p>
          )}
        </div>
      </div>

      {/* Publishing details ------------------------------------------- */}
      <div className="mx-auto mt-12 max-w-3xl border-t border-default-200 pt-6">
        <button
          type="button"
          onClick={() => setDetailsOpen((open) => !open)}
          aria-expanded={detailsOpen}
          aria-controls="edit-details"
          className="flex w-full items-center justify-between gap-3 text-left"
        >
          <span>
            <span className="block text-sm font-medium text-foreground">
              Publishing details
            </span>
            <span className="mt-0.5 block text-sm text-default-500">
              {[
                categoryName,
                values.tags.length
                  ? `${values.tags.length} tag${values.tags.length > 1 ? "s" : ""}`
                  : null,
              ]
                .filter(Boolean)
                .join(" · ") || "Choose a category and add tags"}
            </span>
          </span>
          <span className="flex items-center gap-2">
            {(errors.category || errors.tags) && (
              <span className="rounded-md bg-danger-50 px-2 py-0.5 text-xs text-danger">
                Needs attention
              </span>
            )}
            <LuChevronDown
              className={`size-4 text-default-500 transition-transform ${
                detailsOpen ? "rotate-180" : ""
              }`}
            />
          </span>
        </button>

        {detailsOpen && (
          <div id="edit-details" className="mt-5 grid gap-6 sm:grid-cols-2">
            <div>
              <label
                htmlFor="edit-category"
                className="mb-1.5 block text-sm font-medium text-foreground"
              >
                Category
              </label>
              <Select
                id="edit-category"
                aria-label="Category"
                placeholder="Choose a category"
                selectedKeys={values.category ? [values.category] : []}
                onSelectionChange={(keys) => {
                  const [key] = Array.from(keys as Set<string>);
                  update("category", key ?? "");
                  if (key) {
                    setErrors((current) => ({
                      ...current,
                      category: undefined,
                    }));
                  }
                }}
                isInvalid={Boolean(errors.category)}
                errorMessage={errors.category}
                variant="bordered"
                radius="sm"
              >
                {categories.map((category) => (
                  <SelectItem key={category._id}>
                    {category.name}
                  </SelectItem>
                ))}
              </Select>
            </div>

            <div>
              <label
                htmlFor="edit-tags"
                className="mb-1.5 block text-sm font-medium text-foreground"
              >
                Tags
              </label>
              <TagInput
                id="edit-tags"
                tags={values.tags}
                onChange={(next) => {
                  update("tags", next);
                  if (next.length) {
                    setErrors((current) => ({ ...current, tags: undefined }));
                  }
                }}
                onTagsRejected={(_raw, rejected) => {
                  if (rejected.length) {
                    toast.error(`Add up to 8 tags - kept the first 8.`, {
                      id: "edit-tags-limit",
                    });
                  }
                }}
                input={tagInput}
                onInputChange={setTagInput}
                suggestions={tags}
                invalid={Boolean(errors.tags)}
              />
              {errors.tags && (
                <p className="mt-1.5 text-xs text-danger" role="alert">
                  {errors.tags}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Last chance at the bottom ------------------------------------- */}
      <div className="mx-auto mt-10 flex max-w-3xl flex-col gap-3 border-t border-default-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-default-500">
          {dirty
            ? "Changes stay on this screen until you save them."
            : "This is the version readers see right now."}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="bordered"
            startContent={<LuEye className="size-4" />}
            onPress={preview.onOpen}
          >
            Preview
          </Button>
          <Button
            color="primary"
            startContent={isPending ? null : <LuSave className="size-4" />}
            isDisabled={isPending || !dirty}
            onPress={save}
          >
            Save changes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditBlog;
