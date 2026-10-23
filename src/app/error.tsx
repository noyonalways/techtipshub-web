"use client";

import Container from "@/components/ui/container";
import { Button } from "@heroui/react";
import Link from "next/link";
import { useEffect } from "react";
import { FiRefreshCw } from "react-icons/fi";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <main>
      <Container>
        <div
          role="alert"
          className="grid min-h-[calc(100dvh-8rem)] content-center gap-10 py-16 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-16"
        >
          <p className="tth-label text-danger lg:pt-2">
            Something went wrong
          </p>

          <div>
            <h1 className="text-pretty font-[family-name:var(--type-editorial)] text-3xl font-semibold leading-[1.1] tracking-[-0.01em] md:text-4xl">
              This page could not be loaded
            </h1>
            <p className="mt-4 max-w-xl leading-relaxed text-default-600">
              A request failed while rendering the page. Trying again usually
              fixes it — if it keeps happening, the service may be temporarily
              unavailable.
            </p>

            {error.digest && (
              <p className="mt-4 font-mono text-xs text-default-600">
                Reference: {error.digest}
              </p>
            )}

            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                color="primary"
                radius="lg"
                className="font-semibold"
                startContent={<FiRefreshCw />}
                onPress={() => reset()}
              >
                Try again
              </Button>
              <Button
                as={Link}
                className="border border-default-300 font-medium text-foreground hover:bg-default-100"
                href="/"
                radius="lg"
                variant="bordered"
              >
                Back to the feed
              </Button>
              <Button
                as={Link}
                className="font-medium text-primary-accessible"
                href="/contact"
                radius="lg"
                variant="light"
              >
                Report the problem
              </Button>
            </div>

            {process.env.NODE_ENV === "development" && error.message && (
              <pre className="mt-10 overflow-x-auto rounded-xl border border-default/60 bg-default-50 p-4 text-xs leading-relaxed text-default-700">
                {error.message}
              </pre>
            )}
          </div>
        </div>
      </Container>
    </main>
  );
}
