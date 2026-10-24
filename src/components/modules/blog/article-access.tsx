"use client";

import { resolveArticleAccess } from "@/services/blog/article-access";
import { useEffect, useState } from "react";

const READY_EVENT = "tth:article-access";

export type ArticleAccessState = "member" | "guest";

/**
 * Which half of a prerendered article is visible.
 *
 * The document is cached and served to everyone, so it carries both halves: the
 * preview with the members prompt, and the member body. This component decides
 * which one is on screen, from the answer the server action gives for the
 * request that is actually reading it.
 *
 * Until that answer lands the prompt shows — the conservative state. A member's
 * body is revealed a moment after the page arrives instead of the prompt they
 * would have seen anyway: the title and cover are already painted by then, and
 * nothing flashes in the other direction. A guest simply keeps the prompt.
 *
 * The visible half is keyed on `data-article-view` on the article container
 * (see the article access rules in `globals.css`), never by re-rendering the
 * body. The attribute is set and the class below removed in the same tick, so
 * the browser never paints the state in between.
 */
const ArticleAccess = ({ slug }: { slug: string }) => {
  const [state, setState] = useState<ArticleAccessState>("guest");

  useEffect(() => {
    const container = document.querySelector<HTMLElement>("[data-article-access]");
    if (!container) return;

    let active = true;

    const reveal = (answer: ArticleAccessState) => {
      if (!active) return;
      container.setAttribute("data-article-view", answer);
      setState(answer);
      window.dispatchEvent(
        new CustomEvent<ArticleAccessState>(READY_EVENT, { detail: answer }),
      );
    };

    resolveArticleAccess(slug)
      .then(({ canRead }) => reveal(canRead ? "member" : "guest"))
      // The check never answered: keep the prompt, never the body.
      .catch(() => reveal("guest"));

    return () => {
      active = false;
    };
  }, [slug]);

  return <span hidden aria-hidden data-article-access-for={state} />;
};

/**
 * React to the reader's answer, for the parts of the page that only make sense
 * inside the member body (the in-article ad).
 *
 * Returns `false` until the answer is "member", so nothing is requested for a
 * guest, and `true` afterwards.
 */
export const useCanReadArticle = () => {
  const [canRead, setCanRead] = useState(false);

  useEffect(() => {
    const onReady = (event: Event) => {
      setCanRead((event as CustomEvent<ArticleAccessState>).detail === "member");
    };

    window.addEventListener(READY_EVENT, onReady);
    return () => window.removeEventListener(READY_EVENT, onReady);
  }, []);

  return canRead;
};

export default ArticleAccess;
