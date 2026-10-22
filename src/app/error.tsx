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
        <div className="mx-auto flex min-h-[calc(100dvh-8rem)] max-w-2xl flex-col justify-center py-16">
          <p className="text-sm font-medium uppercase tracking-wider text-danger">
            Something went wrong
          </p>
          <h1 className="mt-3 text-pretty text-3xl font-bold leading-tight tracking-tight md:text-4xl">
            This page could not be loaded
          </h1>
          <p className="mt-4 max-w-lg leading-relaxed text-default-600">
            A request failed while rendering the page. Trying again usually
            fixes it — if it keeps happening, the service may be temporarily
            unavailable.
          </p>

          {error.digest && (
            <p className="mt-4 font-mono text-xs text-default-500">
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
            <Button as={Link} href="/" radius="lg" variant="bordered">
              Back to the feed
            </Button>
            <Button
              as={Link}
              href="/contact-us"
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
      </Container>
    </main>
  );
}
