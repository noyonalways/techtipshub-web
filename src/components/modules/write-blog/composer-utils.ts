/**
 * Types and helpers for the post composer.
 *
 * Everything here is presentation-independent: it turns a draft into the
 * `FormData` the API expects, validates it, and keeps a local copy so a
 * reload does not throw the draft away.
 */

export interface BlogFormValues {
  title: string;
  content: string;
  category: string;
  tags: string[];
}

export interface BlogFormData extends BlogFormValues {
  /** Optional short description, rendered as the article's subtitle. */
  description?: string;
}

export type DraftField = "title" | "content" | "category" | "tags";

export const EMPTY_DRAFT: BlogFormData = {
  title: "",
  content: "",
  category: "",
  tags: [],
  description: "",
};

const DRAFT_KEY = "tth:write-blog:draft";

/** True when the value is empty HTML such as `<p></p>`. */
export const isBlankContent = (html: string) => {
  if (!html) return true;
  const div = document.createElement("div");
  div.innerHTML = html;
  return (div.textContent ?? "").trim() === "" && !div.querySelector("img,hr");
};

/**
 * Checks a draft before publishing.
 *
 * Returns the fields that need attention, in the order the form shows them, so
 * the caller can point at the first one instead of failing silently.
 */
export const validateDraft = (values: BlogFormData) => {
  const errors: Partial<Record<DraftField, string>> = {};

  if (!values.title.trim()) errors.title = "Give the post a title.";
  else if (values.title.trim().length < 4)
    errors.title = "The title needs at least 4 characters.";

  if (isBlankContent(values.content)) errors.content = "Write some content.";

  if (!values.category) errors.category = "Choose a category.";

  if (!values.tags.length) errors.tags = "Add at least one tag.";

  return errors;
};

/** Builds the multipart body for `POST /posts`. */
export const buildPostPayload = (
  values: BlogFormData,
  coverImage: File | null,
) => {
  const formData = new FormData();
  if (coverImage) formData.append("image", coverImage);

  /**
   * The API's create schema is `.strict()` and the Post model has no
   * `description` field, so any extra key fails validation with a 400. The
   * composer's description stays a local draft field that becomes the
   * article's excerpt/meta description rather than a stored column.
   */
  const postData = {
    title: values.title.trim(),
    content: values.content,
    category: values.category,
    tags: values.tags,
    contentType: "html",
    isPremium: false,
  };

  formData.append("data", JSON.stringify(postData));
  return formData;
};

/* -------------------------------------------------------------------------- */
/* Local draft                                                                 */
/* -------------------------------------------------------------------------- */

interface StoredDraft {
  values: BlogFormData;
  savedAt: number;
}

/** Reads the locally saved draft, if there is one. */
export const loadDraft = (): StoredDraft | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredDraft;
    if (!parsed?.values) return null;
    return { ...parsed, values: { ...EMPTY_DRAFT, ...parsed.values } };
  } catch {
    return null;
  }
};

export const saveDraft = (values: BlogFormData) => {
  try {
    window.localStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({ values, savedAt: Date.now() } satisfies StoredDraft),
    );
  } catch {
    // Quota exceeded (a pasted image can be large) — autosave is best-effort.
  }
};

export const clearDraft = () => {
  try {
    window.localStorage.removeItem(DRAFT_KEY);
  } catch {
    // Ignore: nothing to recover.
  }
};

/** Human wording for "saved a moment ago" style labels. */
export const formatSavedAt = (timestamp: number) => {
  const seconds = Math.max(0, Math.round((Date.now() - timestamp) / 1000));
  if (seconds < 10) return "Saved just now";
  if (seconds < 60) return `Saved ${seconds}s ago`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `Saved ${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  return hours < 24 ? `Saved ${hours} h ago` : "Saved earlier";
};
