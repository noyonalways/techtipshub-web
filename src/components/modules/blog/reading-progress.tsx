"use client";

import { useEffect, useState } from "react";

/**
 * Thin progress bar at the very top of the viewport showing how much of the
 * article has been read. Purely decorative, so it is hidden from assistive
 * technology and from print.
 */
const ReadingProgress = ({ targetId }: { targetId: string }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const article = document.getElementById(targetId);
      if (!article) return;

      const start = article.offsetTop;
      const end = start + article.offsetHeight - window.innerHeight;
      const travelled = window.scrollY - start;
      const ratio = end > start ? travelled / (end - start) : 0;

      setProgress(Math.min(Math.max(ratio, 0), 1));
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [targetId]);

  return (
    <div
      aria-hidden
      className="fixed inset-x-0 top-0 z-50 h-0.5 print:hidden"
    >
      <div
        className="h-full bg-primary transition-[width] duration-150"
        style={{ width: `${progress * 100}%` }}
      />
    </div>
  );
};

export default ReadingProgress;
