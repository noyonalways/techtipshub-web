"use client";

import { forwardRef, useCallback, useEffect, useRef } from "react";

interface IProps
  extends Omit<
    React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    "rows" | "onChange"
  > {
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
}

/**
 * A textarea that grows with its content.
 *
 * The description field should feel like one more line of the page rather than
 * a scrollable box, so the height is measured from the content after every
 * change.
 */
const AutoGrowTextarea = forwardRef<HTMLTextAreaElement, IProps>(
  ({ value, onChange, className = "", ...rest }, forwardedRef) => {
    const innerRef = useRef<HTMLTextAreaElement | null>(null);

    const setRefs = useCallback(
      (node: HTMLTextAreaElement | null) => {
        innerRef.current = node;
        if (typeof forwardedRef === "function") forwardedRef(node);
        else if (forwardedRef) forwardedRef.current = node;
      },
      [forwardedRef],
    );

    const resize = useCallback(() => {
      const node = innerRef.current;
      if (!node) return;
      node.style.height = "auto";
      node.style.height = `${node.scrollHeight}px`;
    }, []);

    useEffect(resize, [value, resize]);

    return (
      <textarea
        {...rest}
        ref={setRefs}
        rows={1}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`resize-none overflow-hidden ${className}`}
      />
    );
  },
);

AutoGrowTextarea.displayName = "AutoGrowTextarea";

export default AutoGrowTextarea;
