"use client";

import { Button } from "@heroui/button";
import { useEffect, useRef } from "react";
import { AiOutlineComment } from "react-icons/ai";

/**
 * Jumps to the discussion and focuses the composer.
 *
 * The old version was a `<label for="comment-field">`, which silently did
 * nothing for guests (there is no field to focus) and relied on a stale id.
 */
const CommentJumpButton = ({ count }: { count: number }) => {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const jump = () => {
    const field = document.getElementById("comment-field");
    const section = document.getElementById("comments");

    (section ?? field)?.scrollIntoView({ behavior: "smooth", block: "start" });

    // Let the smooth scroll settle, then focus the textarea when one exists.
    timer.current = setTimeout(() => field?.focus({ preventScroll: true }), 400);
  };

  return (
    <Button
      radius="lg"
      variant="light"
      size="sm"
      onPress={jump}
      startContent={<AiOutlineComment aria-hidden className="size-4" />}
    >
      Comment
      <span className="tabular-nums text-default-500">
        {count > 0 ? count : ""}
      </span>
    </Button>
  );
};

export default CommentJumpButton;
