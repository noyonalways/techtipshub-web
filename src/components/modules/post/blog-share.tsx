"use client";

import { Button } from "@heroui/button";
import { useState, useSyncExternalStore } from "react";
import { BsTwitterX } from "react-icons/bs";
import { FaFacebook, FaLinkedin, FaWhatsapp } from "react-icons/fa";
import { FiCheck, FiLink, FiMail, FiShare2 } from "react-icons/fi";
import { toast } from "sonner";

interface IProps {
  /** Canonical path of the article, e.g. `/blogs/my-post`. */
  path: string;
  title: string;
}

/** These values never change on their own, so there is nothing to subscribe to. */
const subscribeToBrowser = () => () => {};

const targets = (url: string, title: string) => [  {
    id: "x",
    label: "X",
    icon: <BsTwitterX aria-hidden />,
    href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(
      url,
    )}&text=${encodeURIComponent(title)}`,
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    icon: <FaLinkedin aria-hidden />,
    href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
      url,
    )}`,
  },
  {
    id: "facebook",
    label: "Facebook",
    icon: <FaFacebook aria-hidden />,
    href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      url,
    )}`,
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    icon: <FaWhatsapp aria-hidden />,
    href: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
  },
  {
    id: "email",
    label: "Email",
    icon: <FiMail aria-hidden />,
    href: `mailto:?subject=${encodeURIComponent(
      title,
    )}&body=${encodeURIComponent(`I thought you might like this: ${url}`)}`,
  },
];

/**
 * Share sheet for an article: one-tap platforms, a copy-link row with lasting
 * feedback, and the browser's native share on devices that support it (which
 * covers mobile apps the web can't open directly).
 */
const BlogShare = ({ path, title }: IProps) => {
  // Both values are browser facts, not React state: read them through
  // `useSyncExternalStore` so the sheet opens with a real link and the right
  // options on the very first interaction, without an effect writing state.
  const url = useSyncExternalStore(
    subscribeToBrowser,
    () => new URL(path, window.location.origin).toString(),
    () => path,
  );
  const canNativeShare = useSyncExternalStore(
    subscribeToBrowser,
    () => typeof navigator.share === "function",
    () => false,
  );

  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied", { id: "blog-link-copied" });
      setTimeout(() => setCopied(false), 3000);
    } catch {
      toast.error("Could not copy the link — select it manually.", {
        id: "blog-link-copied",
      });
    }
  };

  const shareNatively = async () => {
    try {
      await navigator.share({ title, url });
    } catch {
      // The reader dismissed the sheet; nothing to report.
    }
  };

  return (
    <div className="relative print:hidden">
      <Button
        radius="lg"
        variant="light"
        size="sm"
        aria-expanded={open}
        aria-haspopup="dialog"
        startContent={<FiShare2 aria-hidden className="size-4" />}
        onPress={() => setOpen((value) => !value)}
      >
        Share
      </Button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close share options"
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div
            role="dialog"
            aria-label="Share this article"
            className="absolute bottom-full right-0 z-50 mb-2 w-64 rounded-xl border border-default/60 bg-content1 p-2 shadow-lg"
          >
            <ul className="grid gap-1">
              {targets(url, title).map((target) => (
                <li key={target.id}>
                  <a
                    href={target.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-default-700 transition-colors hover:bg-default-100 hover:text-foreground"
                  >
                    <span className="text-base text-default-500">
                      {target.icon}
                    </span>
                    {target.label}
                  </a>
                </li>
              ))}

              {canNativeShare && (
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      shareNatively();
                    }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm text-default-700 transition-colors hover:bg-default-100 hover:text-foreground"
                  >
                    <FiShare2
                      aria-hidden
                      className="size-4 text-default-500"
                    />
                    More options…
                  </button>
                </li>
              )}
            </ul>

            <div className="mt-1 flex items-center gap-1.5 border-t border-default/60 p-1.5 pt-2.5">
              <span className="min-w-0 flex-1 truncate rounded-md bg-default-100 px-2 py-1.5 text-xs text-default-600">
                {url || path}
              </span>
              <Button
                isIconOnly
                size="sm"
                radius="md"
                variant="flat"
                aria-label={copied ? "Link copied" : "Copy link"}
                onPress={copyLink}
              >
                {copied ? (
                  <FiCheck aria-hidden className="size-4 text-success" />
                ) : (
                  <FiLink aria-hidden className="size-4" />
                )}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default BlogShare;
