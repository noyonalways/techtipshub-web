"use client";

import { EditorToolbar, EditorSurface, useComposerEditor } from "@/components/editor/rich-text-editor";
import { useCreatePost } from "@/hooks/post.hook";
import { getAllCategories } from "@/services/category";
import { ICategory } from "@/types";
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
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  LuCheck,
  LuChevronDown,
  LuClock,
  LuEye,
  LuSend,
  LuTrash2,
} from "react-icons/lu";
import { toast } from "sonner";
import AutoGrowTextarea from "./auto-grow-textarea";
import {
  BlogFormData,
  DraftField,
  buildPostPayload,
  clearDraft,
  EMPTY_DRAFT,
  formatSavedAt,
  loadDraft,
  saveDraft,
  validateDraft,
} from "./composer-utils";
import CoverUpload from "./cover-upload";
import TagInput from "./tag-input";

/** Tags added to the suggestions on every draft. */
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

const AUTOSAVE_DELAY = 1200;

/**
 * An unsaved draft found on load.
 *
 * Read lazily during the first client render — never during server rendering —
 * so the page can offer to restore it and the autosave effect knows not to
 * overwrite it with the empty page before the writer decides.
 */
let pendingDraft: ReturnType<typeof loadDraft> = null;
let pendingDraftRead = false;

const readPendingDraft = () => {
  if (typeof window === "undefined") return null;
  if (!pendingDraftRead) {
    pendingDraftRead = true;
    const draft = loadDraft();
    pendingDraft = draft && isDirty(draft.values) ? draft : null;
  }
  return pendingDraft;
};

const isDirty = (values: BlogFormData) =>
  Boolean(
    values.title.trim() ||
      values.description?.trim() ||
      values.content.replace(/<[^>]+>/g, "").trim() ||
      values.category ||
      values.tags.length,
  );

/**
 * The full-page composer.
 *
 * One column, a cover strip and the title, then the writing surface. Category
 * and tags are publishing details, so they live below the piece in a collapsed
 * panel. Actions sit in a sticky bar that also reports the draft state.
 */
const WriteBlog = () => {
  const router = useRouter();
  const { mutate: createPost, isPending } = useCreatePost();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const [values, setValues] = useState<BlogFormData>(EMPTY_DRAFT);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [errors, setErrors] = useState<Partial<Record<DraftField, string>>>({});
  const [detailsOpen, setDetailsOpen] = useState(false);
  // Reading a draft happens during the first client render only; the server
  // render has no storage, so both start empty and the banner appears on mount.
  const [recovered, setRecovered] = useState(() =>
    Boolean(readPendingDraft()),
  );
  const [savedAt, setSavedAt] = useState(() => readPendingDraft()?.savedAt ?? null);

  const recoveredRef = useRef(false);
  const titleRef = useRef<HTMLTextAreaElement>(null);

  /* ---------------------------------------------------------------- state -- */

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

  /* --------------------------------------------------------------- effects -- */

  // Categories are public data; fetch them once.
  useEffect(() => {
    getAllCategories()
      .then((data) => setCategories((data?.data as ICategory[]) ?? []))
      .catch(() => setCategories([]));
  }, []);

  // The latest draft, for listeners that outlive a render (beforeunload,
  // unmount). It is synced after render rather than during it.
  const valuesRef = useRef(values);
  useEffect(() => {
    valuesRef.current = values;
  }, [values]);

  // Autosave after typing stops. Save state (`savedAt`) is deliberately not a
  // dependency: setState inside the timer would restart it. `useEffectEvent`
  // would be the cleaner tool here once it is stable in React.
  useEffect(() => {
    // Never let the blank page overwrite a draft the writer has not chosen to
    // restore or discard yet. Once either happens, `pendingDraft` is gone.
    if (pendingDraft && !recoveredRef.current) return;    if (!isDirty(values)) return;

    const timer = window.setTimeout(() => {
      saveDraft(valuesRef.current);
      setSavedAt(Date.now());
    }, AUTOSAVE_DELAY);

    return () => window.clearTimeout(timer);
  }, [values]);

  // Warn before leaving only while there are changes the local draft does not
  // have yet. Once autosave has caught up — or a stored draft is still waiting
  // to be restored on this page — closing the tab loses nothing.
  useEffect(() => {
    const handler = (event: BeforeUnloadEvent) => {
      if (isPending || !isDirty(valuesRef.current)) return;
      // The page has not been touched yet, and the stored draft is kept until
      // the writer restores or discards it.
      if (pendingDraft && !recoveredRef.current) return;
      const stored = loadDraft()?.values;
      if (stored && JSON.stringify(stored) === JSON.stringify(valuesRef.current)) {
        return;
      }
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isPending]);

  // "Saved just now" should age while the page stays open.
  useEffect(() => {
    if (!savedAt) return;
    const timer = window.setInterval(() => setSavedAt((time) => time), 15000);
    return () => window.clearInterval(timer);
  }, [savedAt]);

  // Autosave on unmount so a quick navigation still keeps the draft.
  useEffect(
    () => () => {
      if (isDirty(valuesRef.current)) saveDraft(valuesRef.current);
    },
    [],
  );

  /* --------------------------------------------------------------- actions -- */

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
    setRecovered(false);
    setSavedAt(null);
    toast.success("Local draft removed");
  };

  const resetEverything = () => {
    pendingDraft = null;
    recoveredRef.current = true;
    clearDraft();
    setValues(EMPTY_DRAFT);
    setCoverImage(null);
    setTagInput("");
    setSavedAt(null);
    setRecovered(false);
    setErrors({});
    setDetailsOpen(false);
    editor?.commands.setContent("", { emitUpdate: false });
  };

  const focusField = (field: DraftField) => {
    if (field === "content") {
      editor?.chain().focus().run();
      window.scrollTo({ top: 240, behavior: "smooth" });
      return;
    }

    // Category and tags live in the collapsible panel: open it first, then
    // wait for it to render before scrolling to the field inside it.
    const needsPanel = field === "category" || field === "tags";
    if (needsPanel && !detailsOpen) setDetailsOpen(true);

    window.setTimeout(
      () => {
        if (field === "title") {
          titleRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
          titleRef.current?.focus();
          return;
        }
        if (field === "category") {
          const trigger = document.getElementById("composer-category");
          trigger?.scrollIntoView({ behavior: "smooth", block: "center" });
          trigger?.focus();
          trigger?.click();
          return;
        }
        document.getElementById("composer-tags")?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        document.getElementById("composer-tags")?.focus();
      },
      needsPanel ? 120 : 0,
    );
  };

  const publish = () => {
    const found = validateDraft(values);
    setErrors(found);

    const first = (
      ["title", "content", "category", "tags"] as DraftField[]
    ).find((field) => found[field]);

    if (first) {
      focusField(first);
      toast.error(found[first], { id: "publish-check" });
      return;
    }

    if (!coverImage) {
      toast("Publishing without a cover image", {
        id: "publish-check",
        description: "Posts with a cover get more clicks in the feed.",
      });
    }

    createPost(buildPostPayload(values, coverImage), {
      onSuccess: (data) => {
        if (!data?.success) return;
        resetEverything();
        router.push(`/?new=${encodeURIComponent(values.title.trim())}`);
      },
    });
  };

  /* ---------------------------------------------------------------- render -- */

  const tags = useMemo(
    () => Array.from(new Set([...values.tags, ...COMMON_TAGS])),
    [values.tags],
  );

  if (isPending) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <Spinner size="lg" />
        <p className="text-sm text-default-500">Publishing your post…</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Preview ------------------------------------------------------- */}
      <Modal
        scrollBehavior="inside"
        size="3xl"
        backdrop="opaque"
        isOpen={isOpen}
        onOpenChange={onOpenChange}
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
                  {coverImage && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={URL.createObjectURL(coverImage)}
                      alt=""
                      className="mb-8 aspect-[16/8] w-full rounded-xl object-cover"
                    />
                  )}
                  <h1 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                    {values.title || "Untitled"}
                  </h1>
                  {values.description && (
                    <p className="mt-3 text-lg text-default-500">
                      {values.description}
                    </p>
                  )}
                  <div className="mt-8">
                    {values.content ? (
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

      {/* Restore banner ------------------------------------------------ */}
      {recovered && pendingDraft && (
        <div className="mb-6 flex flex-col gap-3 rounded-xl border border-primary-200 bg-primary-50 px-4 py-3 text-sm sm:flex-row sm:items-center">
          <div className="flex items-center gap-2 text-foreground">
            <LuClock className="size-4 shrink-0 text-primary" />
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
      )}

      {/* Sticky action bar --------------------------------------------- */}
      <div className="sticky top-16 z-30 -mx-2 mb-8 border-b border-default-200 bg-background/85 px-2 py-2 backdrop-blur-md lg:-mx-0">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
          <div className="min-w-0 flex-1 [&_.tth-toolbar]:border-0 [&_.tth-toolbar]:px-0 max-sm:[&_.tth-toolbar]:mt-0 sm:[&_.tth-toolbar]:-mb-1">
            <EditorToolbar editor={editor} />
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
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
              onPress={onOpen}
            >
              Preview
            </Button>
            <Button
              size="sm"
              color="primary"
              startContent={<LuSend className="size-3.5" />}
              onPress={publish}
            >
              Publish
            </Button>
          </div>
        </div>

        <div className="mx-auto flex max-w-3xl items-center gap-2 text-xs text-default-500">
          {savedAt && isDirty(values) ? (
            <>
              <LuCheck className="size-3.5 text-success" />
              <span className="truncate">{formatSavedAt(savedAt)}</span>
            </>
          ) : (
            <span className="truncate">Writing a new post</span>
          )}
        </div>
      </div>

      {/* Page header -------------------------------------------------- */}
      <div className="mx-auto mb-6 flex max-w-3xl items-center justify-between gap-3">
        <p className="text-sm text-default-500">New post</p>
        <Link
          href="/"
          className="text-sm text-default-500 transition-colors hover:text-foreground"
        >
          Back to feed
        </Link>
      </div>

      {/* The piece ----------------------------------------------------- */}
      <div className="mx-auto max-w-3xl">
        <CoverUpload
          file={coverImage}
          onChange={setCoverImage}
          invalid={false}
        />

        <div className="mt-8">
          <label htmlFor="composer-title" className="sr-only">
            Title
          </label>
          <AutoGrowTextarea
            id="composer-title"
            ref={titleRef}
            value={values.title}
            onChange={(value) => update("title", value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                editor?.chain().focus("start").run();
              }
            }}
            maxLength={140}
            placeholder="Post title"
            aria-invalid={Boolean(errors.title)}
            className={`w-full bg-transparent text-3xl font-semibold tracking-tight text-foreground placeholder:text-default-300 focus:outline-none sm:text-4xl md:text-[2.75rem] md:leading-[1.15] ${
              errors.title ? "rounded-md ring-1 ring-danger" : ""
            }`}
          />

          <AutoGrowTextarea
            value={values.description ?? ""}
            onChange={(value) => update("description", value)}
            maxLength={200}
            placeholder="Add a short summary (used in the article preview and search results)"
            aria-label="Description"
            className="mt-3 w-full bg-transparent text-base text-default-500 placeholder:text-default-400 focus:outline-none sm:text-lg"
          />

          <div className="mt-6">
            <div
              className={`tth-writing-surface ${
                errors.content ? "tth-editor-invalid" : ""
              }`}
              onFocusCapture={() => {
                if (errors.content) {
                  setErrors((current) => ({ ...current, content: undefined }));
                }
              }}
            >
              <EditorSurface editor={editor} hasError={Boolean(errors.content)} />
            </div>
          </div>
        </div>
      </div>

      {/* Publishing details ------------------------------------------- */}
      <div className="mx-auto mt-12 max-w-3xl border-t border-default-200 pt-6">
        <button
          type="button"
          onClick={() => setDetailsOpen((open) => !open)}
          aria-expanded={detailsOpen}
          aria-controls="composer-details"
          className="flex w-full items-center justify-between gap-3 text-left"
        >
          <span>
            <span className="block text-sm font-medium text-foreground">
              Publishing details
            </span>
            <span className="mt-0.5 block text-sm text-default-500">
              {[
                categories.find((c) => c._id === values.category)?.name,
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
          <div
            id="composer-details"
            className="mt-5 grid gap-6 sm:grid-cols-2"
          >
            <div>
              <label
                htmlFor="composer-category"
                className="mb-1.5 block text-sm font-medium text-foreground"
              >
                Category
              </label>
              <Select
                id="composer-category"
                aria-label="Category"
                placeholder="Choose a category"
                selectedKeys={values.category ? [values.category] : []}
                onSelectionChange={(keys) => {
                  const [key] = Array.from(keys as Set<string>);
                  update("category", key ?? "");
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
                htmlFor="composer-tags"
                className="mb-1.5 block text-sm font-medium text-foreground"
              >
                Tags
              </label>
              <TagInput
                id="composer-tags"
                tags={values.tags}
                onChange={(next) => update("tags", next)}
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
          Your draft stays in this browser until you publish it.
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="bordered"
            startContent={<LuEye className="size-4" />}
            onPress={onOpen}
          >
            Preview
          </Button>
          <Button
            color="primary"
            startContent={<LuSend className="size-4" />}
            onPress={publish}
          >
            Publish
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WriteBlog;
