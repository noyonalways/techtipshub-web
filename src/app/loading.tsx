import { siteConfig } from "@/config/site";

/**
 * Root loading state. A quiet, branded mark rather than a full-screen spinner:
 * it is only visible for a moment and should not flash white.
 */
const RootLoading = () => {
  return (
    <div
      className="flex min-h-dvh items-center justify-center bg-background"
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-4">
        <span
          aria-hidden
          className="size-8 animate-spin rounded-full border-2 border-default/60 border-t-primary"
        />
        <span className="font-[family-name:var(--type-editorial)] text-sm font-semibold tracking-tight text-default-600">
          {siteConfig.name}
        </span>
        <span className="sr-only">Loading</span>
      </div>
    </div>
  );
};

export default RootLoading;
