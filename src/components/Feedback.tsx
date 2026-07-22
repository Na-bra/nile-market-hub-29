import type { ReactNode } from "react";
import { notify } from "@/lib/notify";
import { mapBackendError } from "@/lib/errors";

export { SkeletonCard, SkeletonGrid } from "@/components/ui/skeletons";
export { EmptyState } from "@/components/ui/empty-state";

/** @deprecated Use inline alert or toast; kept for existing call sites. */
export function ErrorMessage({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
    >
      {message}
    </div>
  );
}

export function Spinner({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex justify-center py-8">
      <div
        className="h-6 w-6 animate-spin rounded-full border-2 border-muted border-t-primary"
        aria-label={label}
        role="status"
      />
    </div>
  );
}

export function InlineError({ children }: { children: ReactNode }) {
  return (
    <div
      role="alert"
      className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
    >
      {children}
    </div>
  );
}

export function notifySuccess(message: string) {
  notify.success(message);
}
export function notifyError(message: string) {
  notify.error(message);
}
export function notifyFromError(err: unknown) {
  notify.error(mapBackendError(err));
}
