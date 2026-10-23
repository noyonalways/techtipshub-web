"use client";

import { LuX } from "react-icons/lu";

interface IProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  input: string;
  onInputChange: (value: string) => void;
  /** Comma separated, so pasting "react, next, css" works. */
  suggestions?: string[];
  invalid?: boolean;
  id?: string;
  /**
   * Reports the raw text that was typed but not kept — because the list is
   * full. The field decides what to say; the editor only knows the limit.
   */
  onTagsRejected?: (raw: string, rejected: string[]) => void;
}

const MAX_TAGS = 8;
const MAX_TAG_LENGTH = 24;

/** Lowercase, hyphenated, no duplicate separators. */
export const normaliseTag = (raw: string) =>
  raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, MAX_TAG_LENGTH);

/** Splits `"react, next, css"` into clean tags, dropping empties. */
export const parseTags = (raw: string) =>
  raw.split(",").map(normaliseTag).filter(Boolean);

/**
 * Adds tags to a list in its canonical form: normalised, de-duplicated, capped.
 * Returns the new list and any suggestions that did not fit.
 */
export const addTags = (
  current: string[],
  raw: string,
  limit = MAX_TAGS,
): { tags: string[]; rejected: string[] } => {
  const next = [...current];
  const rejected: string[] = [];

  for (const tag of parseTags(raw)) {
    if (next.length >= limit || next.includes(tag)) {
      if (!next.includes(tag)) rejected.push(tag);
      continue;
    }
    next.push(tag);
  }

  return { tags: next, rejected };
};

/**
 * Tag editor.
 *
 * Tags are chips with a real remove button, the input accepts commas so a
 * pasted list works, and Backspace in an empty input removes the last tag.
 * Typing never requires knowing the Enter trick.
 */
const TagInput = ({
  tags,
  onChange,
  input,
  onInputChange,
  suggestions = [],
  invalid,
  id,
  onTagsRejected,
}: IProps) => {
  const commitTags = (raw: string) => {
    const { tags: next, rejected } = addTags(tags, raw);

    // Keep the input's raw text (not the tag) so typing "AI Agent" in two
    // words and pressing Enter cannot lose the first word.
    onChange(next);
    if (rejected.length || parseTags(raw).every((tag) => tags.includes(tag))) {
      onTagsRejected?.(raw, rejected);
      return;
    }
    onInputChange("");
  };

  const removeTag = (tag: string) =>
    onChange(tags.filter((current) => current !== tag));

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || event.key === ",") {
      if (!input.trim()) return;
      event.preventDefault();
      commitTags(input);
      return;
    }
    if (event.key === "Backspace" && !input && tags.length) {
      event.preventDefault();
      removeTag(tags[tags.length - 1]);
    }
  };

  const unusedSuggestions = suggestions
    .map(normaliseTag)
    .filter((tag) => tag && !tags.includes(tag))
    .slice(0, 6);

  const full = tags.length >= MAX_TAGS;

  return (
    <div>
      <div
        className={`flex flex-wrap items-center gap-2 rounded-lg border bg-content1 px-3 py-2 transition-colors focus-within:border-primary ${
          invalid ? "border-danger" : "border-default-200"
        }`}
        onClick={() => document.getElementById(id ?? "")?.focus()}
      >
        {tags.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1 rounded-md bg-default-100 py-1 pl-2 pr-1 text-sm text-foreground"
          >
            {tag}
            <button
              type="button"
              aria-label={`Remove ${tag}`}
              onClick={(event) => {
                event.stopPropagation();
                removeTag(tag);
              }}
              className="rounded p-0.5 text-default-600 hover:bg-default-200 hover:text-foreground"
            >
              <LuX className="size-3.5" />
            </button>
          </span>
        ))}
        <input
          id={id}
          value={input}
          onChange={(event) => onInputChange(event.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => input.trim() && commitTags(input)}
          disabled={full}
          placeholder={
            full
              ? `Up to ${MAX_TAGS} tags`
              : tags.length
                ? "Add another"
                : "Type a tag, then press Enter"
          }
          className="min-w-[8rem] flex-1 bg-transparent py-1 text-sm text-foreground outline-none placeholder:text-default-600 disabled:cursor-not-allowed"
        />
      </div>

      {!full && unusedSuggestions.length > 0 && (
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-default-600">Suggested:</span>
          {unusedSuggestions.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => commitTags(tag)}
              className="rounded-md border border-default-200 px-2 py-0.5 text-xs text-default-600 transition-colors hover:border-primary-600 hover:text-primary-accessible"
            >
              {tag}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default TagInput;
