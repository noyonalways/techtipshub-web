"use client";

import { useComposerEditor } from "@/components/editor/rich-text-editor";
import { useUser } from "@/context/user.provider";
import { useCreateBlog } from "@/hooks/blog.hook";
import { editBlogPath, manageBlogsPath, writeBlogPath } from "@/lib/blog-routes";
import { getAllCategories } from "@/services/category";
import { ICategory } from "@/types";
import { Button, Spinner } from "@heroui/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LuClock, LuEye, LuTrash2 } from "react-icons/lu";
import { toast } from "sonner";
import {
  BlogFormData,
  DraftField,
  buildBlogPayload,
  clearDraft,
  describeFailure,
  draftFingerprint,
  EMPTY_DRAFT,
  formatSavedAt,
  hasDraftContent,
  loadDraft,
  saveDraft,
  validateDraft,
  wordCount,
} from "./composer-utils";
import CoverUpload from "./cover-upload";
import {
  BottomActions,
  COMMON_TAGS,
  ComposerToolbar,
  EditorBody,
  EditorShell,
  PreviewModal,
  PublishingDetails,
  StatusMark,
  WritingPane,
} from "./editor-shell";
import { useObjectUrl, useStoredUpload } from "./use-stored-upload";
import { useUnsavedChangesGuard } from "./use-unsaved-changes-guard";

const AUTOSAVE_DELAY = 1200;

/**
 * An unsaved draft found on load.
 *
 * Read lazily during the first client render, never during server rendering,
 * so the page can offer to restore it and the autosave effect knows not to
 * overwrite it with the empty page before the writer decides.
 */
let pendingDraft: ReturnType<typeof loadDraft> = null;
let pendingDraftRead = false;

/** Where this browser keeps the composer's unfinished draft and its cover. */
const DRAFT_COVER_KEY = "draft";

const readPendingDraft = () => {
  if (typeof window === "undefined") return null;
  if (!pendingDraftRead) {
    pendingDraftRead = true;
    const draft = loadDraft();
    pendingDraft = draft && hasDraftContent(draft.values) ? draft : null;
  }
  return pendingDraft;
};

/** True when this draft has something worth keeping. */
const isDirty = hasDraftContent;

/** "412 words, about 2 min read", so the writer knows the size of the piece. */const statusLine = (values: BlogFormData) => {
  const words = wordCount(values.content);
  if (!words) return "0 words";
  // 200 words a minute is a normal reading pace for technical prose.
  const minutes = Math.max(1, Math.round(words / 200));
  return `${words.toLocaleString()} ${words === 1 ? "word" : "words"}, about ${minutes} min read`;
};

/**
 * The composer, at `/me/blogs/new`.
 *
 * A cover strip, the formatting tools, the title and the writing surface in one
 * measured column, with the required publishing details beside it rather than
 * hidden behind a disclosure. The bar holds what stays true while scrolling:
 * the way out, the state of the draft, and the next step.
 *
 * The frame comes from `EditorShell`, which the article editor uses too, so the
 * two screens are the same tool in the same places.
 */
const WriteBlog = () => {
  const router = useRouter();
  const { mutate: createBlog, isPending } = useCreateBlog();
  // Writing is open to guests; only publishing needs an account.
  const { user, isLoading: userLoading } = useUser();

  const [values, setValues] = useState<BlogFormData>(EMPTY_DRAFT);
  // The cover is kept with the draft, so a reload does not lose it.
  const { file: coverImage, setFile: setCoverImage, sync: syncCover } =
    useStoredUpload(DRAFT_COVER_KEY);
  const coverUrl = useObjectUrl(coverImage);

  const [categories, setCategories] = useState<ICategory[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [errors, setErrors] = useState<Partial<Record<DraftField, string>>>({});
  const [previewOpen, setPreviewOpen] = useState(false);
  // Reading a draft happens during the first client render only; the server
  // render has no storage, so both start empty and the banner appears on mount.
  const [recovered, setRecovered] = useState(() => Boolean(readPendingDraft()));
  const [savedAt, setSavedAt] = useState(
    () => readPendingDraft()?.savedAt ?? null,
  );
  // Set while a publish is in flight so the autosave cannot race the request.
  const publishedRef = useRef(false);

  const recoveredRef = useRef(false);
  const titleRef = useRef<HTMLTextAreaElement>(null);

  const valuesRef = useRef(values);
  useEffect(() => {
    valuesRef.current = values;
  }, [values]);

  const update = useCallback(
    <K extends keyof BlogFormData>(key: K, value: BlogFormData[K]) => {
      setValues((current) => ({ ...current, [key]: value }));
      // Clear the field's error as soon as it holds a value; it is re-checked on
      // publish. Emptying a required field leaves the error until then.
      const filled =
        key === "tags"
          ? Array.isArray(value) && value.length > 0
          : typeof value === "string" && value.trim() !== "";
      if (!filled) return;
      const field = key as DraftField;
      setErrors((current) =>
        current[field] ? { ...current, [field]: undefined } : current,
      );
    },
    [],
  );

  const onChange = useCallback(
    (html: string) => update("content", html),
    [update],
  );

  const editor = useComposerEditor({ value: values.content, onChange });

  /* ---------------------------------------------------------------- effects */

  useEffect(() => {
    getAllCategories()
      .then((data) => setCategories((data?.data as ICategory[]) ?? []))
      .catch(() => setCategories([]));
  }, []);

  // Autosave. The stored draft is only written once the writer has answered the
  // restore banner, so an empty page cannot overwrite a recoverable draft.
  useEffect(() => {
    if (pendingDraft && !recoveredRef.current) return;
    if (!isDirty(values) || publishedRef.current) return;

    const timer = window.setTimeout(() => {
      saveDraft(valuesRef.current);
      setSavedAt(Date.now());
    }, AUTOSAVE_DELAY);

    return () => window.clearTimeout(timer);
  }, [values]);

  // A cover restored from storage belongs to the stored draft. When the writer
  // starts writing something else, it is not theirs to publish, so it is dropped.
  const storedDraftFingerprint = useMemo(
    () => (pendingDraft ? draftFingerprint(pendingDraft.values) : null),
    [],
  );
  const [coverClearedFor, setCoverClearedFor] = useState<string | null>(null);
  const liveFingerprint = draftFingerprint(values);
  if (
    coverImage &&
    storedDraftFingerprint &&
    liveFingerprint !== storedDraftFingerprint &&
    coverClearedFor === null
  ) {
    setCoverClearedFor(liveFingerprint);
  }
  const showCover = coverClearedFor === null;

  // The cover follows the draft. There is one draft at a time, so one key; an
  // effect writes the chosen file back and clears it when it is removed.
  useEffect(() => {
    if (publishedRef.current) return;
    void syncCover(coverImage);
    // `syncCover` is stable; `coverImage` is the input.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coverImage]);

  // "Saved just now" should age while the page stays open.
  useEffect(() => {
    if (!savedAt) return;
    const timer = window.setInterval(() => setSavedAt((time) => time), 15000);
    return () => window.clearInterval(timer);
  }, [savedAt]);

  // Keep the very last keystrokes even if the writer closes the tab at once.
  useEffect(
    () => () => {
      if (!publishedRef.current && isDirty(valuesRef.current)) {
        saveDraft(valuesRef.current);
      }
    },
    [],
  );

  /* --------------------------------------------------------------- actions */

  const restoreDraft = () => {
    const draft = pendingDraft;
    if (!draft) return;
    pendingDraft = null;
    recoveredRef.current = true;
    setValues(draft.values);
    setSavedAt(draft.savedAt);
    setRecovered(false);
    toast.success("Draft restored");
  };

  const discardDraft = () => {
    pendingDraft = null;
    recoveredRef.current = true;
    clearDraft();
    void syncCover(null);
    setRecovered(false);
    setSavedAt(null);
    toast.success("Local draft removed");
  };

  const resetEverything = () => {
    pendingDraft = null;
    recoveredRef.current = true;
    clearDraft();
    void syncCover(null);
    setValues(EMPTY_DRAFT);
    setCoverImage(null);
    setTagInput("");
    setSavedAt(null);
    setRecovered(false);
    setErrors({});
    editor?.commands.setContent("", { emitUpdate: false });
  };

  const focusField = (field: DraftField) => {
    if (field === "content") {
      editor?.chain().focus().run();
      return;
    }

    if (field === "title") {
      titleRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      titleRef.current?.focus();
      return;
    }
    if (field === "cover") {
      const cover = document.getElementById("composer-cover");
      cover?.scrollIntoView({ behavior: "smooth", block: "center" });
      cover?.focus();
      return;
    }
    if (field === "category") {
      const trigger = document.getElementById("composer-category");
      trigger?.scrollIntoView({ behavior: "smooth", block: "center" });
      trigger?.focus();
      trigger?.click();
      return;
    }
    document
      .getElementById("composer-tags")
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
    document.getElementById("composer-tags")?.focus();
  };

  const publish = () => {
    const found = validateDraft(values, Boolean(showCover && coverImage));
    setErrors(found);

    const first = (
      ["title", "cover", "content", "category", "tags"] as DraftField[]
    ).find((field) => found[field]);

    if (first) {
      focusField(first);
      toast.error(found[first], { id: "publish-check" });
      return;
    }

    // A guest can write the whole piece; publishing needs an account. The
    // draft is saved first, so signing in and coming back loses nothing.
    if (!userLoading && !user) {
      saveDraft(values);
      router.push(`/login?redirect=${encodeURIComponent(writeBlogPath)}`);
      return;
    }

    publishedRef.current = true;
    createBlog(buildBlogPayload(values, coverImage), {
      onSuccess: (data) => {
        // A failed publish keeps the draft and the cover, so the writer can
        // fix the problem instead of losing the work.
        if (!data?.success) {
          publishedRef.current = false;
          toast.error(data?.message || "The blog was not published.", {
            id: "publish-failed",
            description: "Your draft is still here. Nothing was lost.",
          });
          return;
        }
        resetEverything();
        const slug = data?.data?.slug as string | undefined;
        // Straight to the editor where the new blog lives, or the feed.
        router.push(slug ? editBlogPath(slug) : manageBlogsPath);
        router.refresh();
      },
      onError: (error) => {
        publishedRef.current = false;
        toast.error(
          describeFailure(error, "Publishing did not finish."),
          { id: "publish-failed", description: "Your draft is still here." },
        );
      },
    });
  };

  const leave = () => {
    if (isDirty(values)) saveDraft(values);
    // Guests have no article list to go back to.
    router.push(user ? manageBlogsPath : "/");
  };

  const { prompt, askToLeave } = useUnsavedChangesGuard({
    dirty: isDirty(values),
    discard: () => {
      clearDraft();
      void syncCover(null);
    },
    onLeave: () => router.push(manageBlogsPath),
    title: "Leave this draft?",
    description:
      "Your unfinished draft is kept in this browser, so you can pick it up where you left off.",
  });

  /* ---------------------------------------------------------------- render */

  const tagSuggestions = useMemo(
    () => Array.from(new Set([...values.tags, ...COMMON_TAGS])),
    [values.tags],
  );

  const savedLabel = savedAt ? formatSavedAt(savedAt) : "Saved as you type";
  const errorsPresent = Object.values(errors).filter(Boolean).length;

  if (isPending) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-3">
        <Spinner size="lg" />
        <p className="text-sm text-default-600">Publishing your blog…</p>
        <p className="text-xs text-default-600">
          Keep this tab open. It takes a moment.
        </p>
      </div>
    );
  }

  const status =
    errorsPresent > 0 ? (
      <span className="font-medium text-danger">
        {errorsPresent} {errorsPresent === 1 ? "field needs" : "fields need"}{" "}
        attention
      </span>
    ) : isDirty(values) ? (
      <span className="inline-flex items-center gap-2 text-default-600">
        <StatusMark tone="ok" />
        {savedAt ? savedLabel : "Draft kept in this browser"}
      </span>
    ) : (
      <span className="text-default-600">Nothing written yet</span>
    );

  return (
    <EditorShell
      onLeave={() => {
        // Leaving keeps the draft, so there is nothing to warn about until
        // there is actually text to walk away from.
        if (!isDirty(values)) {
          leave();
          return;
        }
        askToLeave();
      }}
      leaveLabel={user ? "My articles" : "Close"}
      eyebrow={user ? "New blog" : "New blog, publishing needs an account"}
      status={status}
      actions={
        <>
          {isDirty(values) && (
            <Button
              isIconOnly
              size="sm"
              variant="light"
              color="danger"
              aria-label="Clear draft"
              className="hidden sm:flex"
              onPress={resetEverything}
            >
              <LuTrash2 className="size-4" />
            </Button>
          )}
          <Button
            size="sm"
            variant="bordered"
            startContent={<LuEye className="size-3.5" />}
            onPress={() => setPreviewOpen(true)}
          >
            Preview
          </Button>
          <Button size="sm" color="primary" onPress={publish}>
            Publish
          </Button>
        </>
      }
      banner={
        recovered && pendingDraft ? (
          <div className="flex flex-col gap-3 border border-default-200 bg-default-50 px-4 py-3 text-sm sm:flex-row sm:items-center dark:bg-default-100/5">
            <div className="flex items-center gap-2 text-foreground">
              <LuClock
                aria-hidden
                className="size-4 shrink-0 text-default-600"
              />
              <span>
                You have an unpublished draft from{" "}
                {new Date(pendingDraft.savedAt).toLocaleString(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
                .
              </span>
            </div>
            <div className="flex gap-2 sm:ml-auto">
              <Button size="sm" color="primary" onPress={restoreDraft}>
                Restore draft
              </Button>
              <Button size="sm" variant="light" onPress={discardDraft}>
                Discard
              </Button>
            </div>
          </div>
        ) : null
      }
      sidebar={
        <PublishingDetails
          idPrefix="composer"
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
                id: "composer-tags-limit",
              });
            }
          }}
          footer={
            <p className="mt-6 border-t border-default-200 pt-4 text-xs leading-relaxed text-default-600">
              The draft stays in this browser until you publish. Only you can
              see it.
            </p>
          }
        />
      }
    >
      <WritingPane
        titleId="composer-title"
        titleRef={titleRef}
        title={values.title}
        titlePlaceholder="Title of your article"
        titleHint="Keep it specific. This is what readers scan for in the feed."
        onTitleChange={(value) => update("title", value)}
        titleError={errors.title}
        onTitleEnter={() => editor?.chain().focus("start").run()}
        coverLabel="Cover image (optional)"
        cover={
          <CoverUpload
            file={showCover ? coverImage : null}
            onChange={(file) => {
              setCoverImage(file);
              if (file) {
                setErrors((current) => ({ ...current, cover: undefined }));
              }
            }}
            invalid={Boolean(errors.cover)}
          />
        }
        coverError={errors.cover}
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
              Start a line with{" "}
              <kbd className="rounded border border-default-200 px-1 font-mono">
                /
              </kbd>{" "}
              for headings, lists and code.
            </span>
            <span className="tabular-nums">{statusLine(values)}</span>
          </div>
        }
      />

      <BottomActions
        note="Publishing makes it live for everyone."
        onPreview={() => setPreviewOpen(true)}
        primary={
          <Button color="primary" onPress={publish}>
            Publish
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
          category: categories.find((item) => item._id === values.category)?.name,
          coverUrl: showCover ? coverUrl : null,
          authorName: user?.name,
        }}
      />

      {prompt}
    </EditorShell>
  );
};

export default WriteBlog;
