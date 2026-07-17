import { useCallback, useState } from "react";
import axios from "axios";

/**
 * Reusable form-error state.
 *
 * The backend is the source of truth for validation messages. This hook
 * accepts any error thrown by axios and tries — without inventing content —
 * to route field-scoped messages to the right input, while surfacing a
 * top-level message for form-wide errors (network, 401, 5xx).
 *
 * Observed backend error shapes (from the existing service layer):
 *   { message: string }
 *   { error: string }
 *   { errors: [{ path?: string, param?: string, field?: string, msg?: string, message?: string }] }
 *   { errors: Record<string, string | string[]> }
 *
 * Anything that does not clearly identify a field is stored on `formError`.
 */
export type FieldErrors = Record<string, string>;

interface UseFormErrorsResult {
  formError: string | null;
  fieldErrors: FieldErrors;
  /** Replace all errors — typically called after a failed submit. */
  setFromError: (err: unknown) => void;
  /** Merge zod / client-side issues without clobbering server-side errors. */
  setFieldErrors: (errors: FieldErrors) => void;
  /** Clear one field's error (call from onChange to give live feedback). */
  clearField: (name: string) => void;
  /** Reset all errors — typically called at the start of a submit. */
  reset: () => void;
}

function normalizeFieldName(raw: unknown): string | null {
  if (typeof raw !== "string" || !raw) return null;
  // Some backends prefix with "body." or use dotted paths — keep the leaf.
  const parts = raw.split(".");
  return parts[parts.length - 1] || null;
}

function parseAxiosError(err: unknown): { form: string | null; fields: FieldErrors } {
  const fields: FieldErrors = {};
  let form: string | null = null;

  if (!axios.isAxiosError(err)) {
    form = err instanceof Error ? err.message : "Request failed";
    return { form, fields };
  }

  if (!err.response) {
    // Network / timeout / offline.
    form = err.message || "Network error. Please check your connection and try again.";
    return { form, fields };
  }

  const status = err.response.status;
  const data = err.response.data as unknown;

  // Prefer structured field errors when the backend provides them.
  if (data && typeof data === "object") {
    const d = data as Record<string, unknown>;

    if (Array.isArray(d.errors)) {
      for (const item of d.errors) {
        if (!item || typeof item !== "object") continue;
        const rec = item as Record<string, unknown>;
        const field =
          normalizeFieldName(rec.path) ??
          normalizeFieldName(rec.param) ??
          normalizeFieldName(rec.field);
        const msg =
          (typeof rec.msg === "string" && rec.msg) ||
          (typeof rec.message === "string" && rec.message) ||
          null;
        if (field && msg) fields[field] = msg;
      }
    } else if (d.errors && typeof d.errors === "object") {
      for (const [field, val] of Object.entries(d.errors as Record<string, unknown>)) {
        const msg = Array.isArray(val) ? val[0] : val;
        if (typeof msg === "string") fields[field] = msg;
      }
    }

    if (typeof d.message === "string") form = d.message;
    else if (typeof d.error === "string") form = d.error;
  } else if (typeof data === "string" && data) {
    form = data;
  }

  if (!form) {
    if (status === 401) form = "Your session has expired. Please sign in again.";
    else if (status === 403) form = "You don't have permission to perform this action.";
    else if (status >= 500) form = "Something went wrong on our end. Please try again shortly.";
    else form = err.message || "Request failed";
  }

  // If we picked up field errors, suppress the generic top-level message
  // to avoid double-reporting the same problem.
  if (Object.keys(fields).length > 0 && status < 500 && status !== 401 && status !== 403) {
    form = null;
  }

  return { form, fields };
}

export function useFormErrors(): UseFormErrorsResult {
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrorsState] = useState<FieldErrors>({});

  const setFromError = useCallback((err: unknown) => {
    const { form, fields } = parseAxiosError(err);
    setFormError(form);
    setFieldErrorsState(fields);
  }, []);

  const setFieldErrors = useCallback((errors: FieldErrors) => {
    setFieldErrorsState((prev) => ({ ...prev, ...errors }));
  }, []);

  const clearField = useCallback((name: string) => {
    setFieldErrorsState((prev) => {
      if (!(name in prev)) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setFormError(null);
    setFieldErrorsState({});
  }, []);

  return { formError, fieldErrors, setFromError, setFieldErrors, clearField, reset };
}
