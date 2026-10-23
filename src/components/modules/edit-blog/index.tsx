"use client";

import { useComposerEditor } from "@/components/editor/rich-text-editor";
import { useUpdateBlogByUserUsingId } from "@/hooks/blog.hook";
import {
  editBlogPath,
  manageBlogsPath,
} from "@/lib/blog-routes";
import { getAllCategories } from "@/services/category";
import { ICategory, IBlog } from "@/types";
import { Button } from "@heroui/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LuEye, LuRotateCcw, LuTriangleAlert } from "react-icons/lu";
import { toast } from "sonner";
import {
  BlogFormData,
  DraftField,
  buildUpdatePayload,
  describeFailure,
  validateDraft,
  wordCount,
} from "../write-blog/composer-utils";
import CoverUpload from "../write-blog/cover-upload";
import {
  BottomActions,
  COMMON_TAGS,
  ComposerToolbar,
  EditorBody,
  EditorShell,
  PreviewModal,
  PublishingDetails,
  SavingOverlay,
  StatusMark,
  WritingPane,
  categoryName,
} from "../write-blog/editor-shell";
import { useObjectUrl, useStoredUpload } from "../write-blog/use-stored-upload";
import { useUnsavedChangesGuard } from "../write-blog/use-unsaved-changes-guard";

/**
 * What the server says a blog currently is.
 *
 * The summary is not stored by the API (the Blog model has no field for it),
 * so an edit starts with none and the field is kept out of the comparison:
 * adding one never makes the form look dirty, and never gets saved.
 */
const initialValues = (blog: IBlog): BlogFormData => ({
  title: blog.title ?? "",
  content: blog.content ?? "",
  category: blog.category?._id ?? "",
  tags: blog.tags ?? [],
  description: "",
});

/** The fields a save actually writes, for the "unsaved" check. */
const editableFingerprint = (values: BlogFormData) =>
  JSON.stringify({
    title: values.title,
    content: values.content,
    category: values.category,
    tags: values.tags,
  });

/**
 * The article editor, at `/me/blogs/<slug>/edit`.
 *
 * Same tool as the composer — `EditorShell`, `WritingPane`, the same details
 * panel — so moving between writing and editing is moving between pages of one
 * editor. What differs is all about being safe to edit something readers can
 * already see: changes are measured against the saved blog, the primary button
 * says whether there is anything to save, and leaving asks first.
 */
const EditBlog = ({ blog }: { blog: IBlog }) => {
  const router = useRouter();
  const { mutate: updateBlog, isPending } = useUpdateBlogByUserUsingId();

  const initial = useMemo(() => initialValues(blog), [blog]);

  const [values, setValues] = useState<BlogFormData>(initial);
  const [savedFingerprint, setSavedFingerprint] = useState(() =>
    editableFingerprint(initial),
  );
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [errors, setErrors] = useState<Partial<Record<DraftField, string>>>({});
  const [previewOpen, setPreviewOpen] = useState(false);

  // A cover picked here is only stored once the save succeeds, so abandoning an
  // edit cannot leave a replacement image behind.
  const { file: coverImage, setFile: setCoverImage, sync: syncCover } =
    useStoredUpload(`blog:${blog._id}`, { remember: false });
  const pickedCoverUrl = useObjectUrl(coverImage);

  // The blog's cover as the server has it, or as this session just saved it.
  const [savedCover, setSavedCover] = useState<string | null>(
    typeof blog.coverImage === "string" ? blog.coverImage : null,
  );
  // The API cannot delete a stored cover, so "remove" only hides it on screen.
  const [coverRemoved, setCoverRemoved] = useState(false);

  const displayedCover = coverRemoved
    ? null
    : pickedCoverUrl ?? savedCover;

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
    <K extends keyof BlogFormData>(key: K, value: BlogFormData[K]) => {
      setValues((current) => ({ ...current, [key]: value }));
      // Clear a field's error as soon as it holds something valid again.
      if (key === "tags") {
        if (Array.isArray(value) && value.length) {
          setErrors((current) => ({ ...current, tags: undefined }));
        }
        return;
      }
      if (typeof value === "string" && value.trim()) {
        setErrors((current) => ({ ...current, [key]: undefined }));
      }
    },
    [],
  );

  const editor = useComposerEditor({
    value: values.content,
    onChange: (html) => update("content", html),
  });

  /* ---------------------------------------------------------------- effects */

  useEffect(() => {
    getAllCategories()
      .then((data) => setCategories((data?.data as ICategory[]) ?? []))
      .catch(() => setCategories([]));
  }, []);

  const dirty = editableFingerprint(values) !== savedFingerprint || Boolean(coverImage);

  const dirtyLabels = useMemo(() => {
    const labels: string[] = [];
    if (values.title.trim() !== initial.title.trim()) labels.push("title");
    if (values.content !== initial.content) labels.push("body");
    if (values.category !== initial.category) labels.push("category");
    if (values.tags.join(",") !== initial.tags.join(",")) labels.push("tags");
    if (coverImage) labels.push("cover image");
    return labels;
  }, [values, initial, coverImage]);

  /* ---------------------------------------------------------------- actions */

  const focusField = (field: DraftField) => {
    if (field === "content") {
      editor?.chain().focus().run();
      window.scrollTo({ top: 260, behavior: "smooth" });
      return;
    }

    if (field === "category" || field === "tags") {
      if (field === "category") {
        const trigger = document.getElementById("editor-category");
        trigger?.scrollIntoView({ behavior: "smooth", block: "center" });
        trigger?.focus();
        trigger?.click();
        return;
      }
      document.getElementById("editor-tags")?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      document.getElementById("editor-tags")?.focus();
      return;
    }

    titleRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    titleRef.current?.focus();
  };

  const save = (options?: { stay?: boolean }) => {
    // An existing blog already has a cover, so only a newly chosen file has to
    // be there for the update payload.
    const found = validateDraft(values, Boolean(coverImage || savedCover));
    setErrors(found);

    const first = (["title", "content", "category", "tags"] as DraftField[]).find(
      (field) => found[field],
    );
    if (first) {
      focusField(first);
      toast.error(found[first], { id: "edit-check" });
      return;
    }

    updateBlog(
      { blogId: blog._id, payload: buildUpdatePayload(values, coverImage) },
      {
        onSuccess: (data) => {
          if (!data?.success) {
            toast.error(data?.message || "The changes were not saved.", {
              id: "edit-failed",
            });
            return;
          }

          // The text fields are the baseline; the cover is tracked by whether a
          // file is still pending. A saved cover keeps its own preview URL, so
          // it survives `coverImage` being cleared and stays on screen until the
          // refreshed page delivers the stored image.
          if (coverImage) {
            const savedPreview = URL.createObjectURL(coverImage);
            setSavedCover(savedPreview);
            savedPreviewUrls.current.push(savedPreview);
            setCoverImage(null);
            setCoverRemoved(false);
            void syncCover(null);
          }
          setSavedFingerprint(editableFingerprint(values));

          // The API writes a new slug from the title, so the address changes
          // with it. Carry the reader across instead of leaving the old one in
          // the URL, and only then refresh from the server.
          const nextSlug = data?.data?.slug as string | undefined;
          if (nextSlug && nextSlug !== blog.slug) {
            router.replace(editBlogPath(nextSlug));
            return;
          }

          // A long article leaves the writer at the bottom; show them the top,
          // where the state line now says the change is live.
          window.scrollTo({ top: 0, behavior: "smooth" });
          router.refresh();
          if (options?.stay) {
            toast.success("Saved", { id: "edit-saved" });
          }
        },
        onError: (error) => {
          toast.error(
            describeFailure(error, "The changes were not saved."),
            {
              id: "edit-failed",
              description: "Your edits are still on this screen.",
            },
          );
        },
      },
    );
  };

  const discard = () => {
    setValues(initial);
    setErrors({});
    setCoverImage(null);
    setCoverRemoved(false);
    setSavedCover(typeof blog.coverImage === "string" ? blog.coverImage : null);
    setTagInput("");
    editor?.commands.setContent(initial.content || "", { emitUpdate: false });
    toast("Reverted to the published version", { id: "edit-discard" });
  };

  const { prompt, askToLeave } = useUnsavedChangesGuard({
    dirty,
    discard,
    onLeave: () => router.push(manageBlogsPath),
    title: "Leave without saving?",
    description:
      "Your unsaved edits will be lost. The published article keeps its current version.",
  });
  /* ----------------------------------------------------------------- render */

  const tagSuggestions = useMemo(
    () => Array.from(new Set([...values.tags, ...COMMON_TAGS])),
    [values.tags],
  );

  const words = wordCount(values.content);
  const errorCount = Object.values(errors).filter(Boolean).length;
  const publishedAt = new Date(blog.createdAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <EditorShell
      onLeave={() => {
        if (!dirty) {
          router.push(manageBlogsPath);
          return;
        }
        askToLeave();
      }}
      leaveLabel="My articles"
      eyebrow={
        <>
          Editing
          {blog.slug && (
            <>
              {" "}
              <a
                href={`/blogs/${blog.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden font-normal underline-offset-4 hover:text-foreground hover:underline sm:inline"
              >
                {blog.title}
              </a>
            </>
          )}
        </>
      }
      status={
        errorCount > 0 ? (
          <span className="font-medium text-danger">
            {errorCount} {errorCount === 1 ? "field needs" : "fields need"}{" "}
            attention
          </span>
        ) : dirty ? (
          <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1 font-medium text-warning-600 dark:text-warning">
            <StatusMark tone="warn" />
            Unsaved changes
            {dirtyLabels.length > 0 && (
              <span className="font-normal text-default-600">
                ({dirtyLabels.join(", ")})
              </span>
            )}
          </span>
        ) : (
          <span className="inline-flex items-center gap-2 text-default-600">
            <StatusMark tone="ok" />
            Live since {publishedAt}
            <span aria-hidden className="text-default-300">
              ·
            </span>
            <span className="tabular-nums">
              {words.toLocaleString()} {words === 1 ? "word" : "words"}
            </span>
          </span>
        )
      }
      actions={
        <>
          <Button
            size="sm"
            variant="bordered"
            startContent={<LuEye className="size-3.5" />}
            onPress={() => setPreviewOpen(true)}
          >
            Preview
          </Button>
          <Button
            size="sm"
            color="primary"
            isDisabled={isPending || !dirty}
            onPress={() => save()}
          >
            Save
          </Button>
        </>
      }
      sidebar={
        <PublishingDetails
          idPrefix="editor"
          categories={categories}
          category={values.category}
          onCategoryChange={(value) => update("category", value)}
          categoryError={errors.category}
          tags={values.tags}
          onTagsChange={(next) => update("tags", next)}
          tagInput={tagInput}
          onTagInputChange={setTagInput}
          tagSuggestions={tagSuggestions}
          tagsError={errors.tags}
          onTagsRejected={(_raw, rejected) => {
            if (rejected.length) {
              toast.error("Add up to 8 tags, kept the first 8.", {
                id: "edit-tags-limit",
              });
            }
          }}
          footer={
            dirty ? (
              <button
                type="button"
                onClick={discard}
                className="mt-6 flex items-center gap-1.5 border-t border-default-200 pt-4 text-[0.8125rem] font-medium text-default-600 transition-colors hover:text-danger focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-300"
              >
                <LuRotateCcw aria-hidden className="size-3.5" />
                Discard changes
              </button>
            ) : null
          }
        />
      }
    >
      <WritingPane
        titleId="editor-title"
        titleRef={titleRef}
        title={values.title}
        titlePlaceholder="Title of your article"
        titleHint="Changing the title changes the article's address."
        onTitleChange={(value) => update("title", value)}
        titleError={errors.title}
        onTitleEnter={() => editor?.chain().focus("start").run()}
        coverLabel="Cover image"
        cover={
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
            existing={coverRemoved ? null : savedCover}
          />
        }
        coverNote={
          coverRemoved ? (
            <p
              className="mt-2 flex items-start gap-1.5 text-xs text-warning-600 dark:text-warning"
              role="status"
            >
              <LuTriangleAlert
                aria-hidden
                className="mt-px size-3.5 shrink-0"
              />
              Removing a cover is not supported yet. This article keeps its
              current image, so choose a new file to replace it instead.
            </p>
          ) : null
        }
        toolbar={<ComposerToolbar editor={editor} />}
        body={
          <div
            onFocusCapture={() => {
              if (errors.content) {
                setErrors((current) => ({ ...current, content: undefined }));
              }
            }}
          >
            <EditorBody editor={editor} invalid={Boolean(errors.content)} />
          </div>
        }
        bodyError={errors.content}
        bodyFooter={
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-default-200 pt-3 text-xs text-default-600">
            <span>
              Readers see the saved version until you save your changes.
            </span>
            <span className="tabular-nums">
              {words.toLocaleString()} {words === 1 ? "word" : "words"}
            </span>
          </div>
        }
      />

      <BottomActions
        note={
          dirty
            ? "Your changes are not live yet."
            : "This is the version readers see now."
        }
        previewHref={
          blog.slug
            ? { href: `/blogs/${blog.slug}`, label: "View live" }
            : undefined
        }
        onPreview={() => setPreviewOpen(true)}
        primary={
          <Button
            color="primary"
            isDisabled={isPending || !dirty}
            onPress={() => save()}
          >
            Save changes
          </Button>
        }
      />

      <PreviewModal
        isOpen={previewOpen}
        onOpenChange={setPreviewOpen}
        blog={{
          title: values.title,
          content: values.content,
          tags: values.tags,
          category: categoryName(blog, categories),
          coverUrl: displayedCover,
          authorName: blog.author?.fullName,
          createdAt: blog.createdAt,
          totalViews: blog.totalViews,
          totalComments: blog.totalComments,
        }}
      />

      {isPending && <SavingOverlay label="Saving your changes…" />}
      {prompt}
    </EditorShell>
  );
};

export default EditBlog;
