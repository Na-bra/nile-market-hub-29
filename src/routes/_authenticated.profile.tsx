import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Layout } from "../components/Layout";
import { ErrorMessage, notifySuccess } from "../components/Feedback";
import { useAuth } from "../context/AuthContext";
import { updateUser } from "../services/userService";
import { extractError, USER_KEY } from "../services/api";

export const Route = createFileRoute("/_authenticated/profile")({
  component: ProfilePage,
});

const profileSchema = z.object({
  fullName: z.string().trim().min(1, "Name is required").max(100),
  phoneNumber: z.string().trim().max(30).optional(),
  whatsappNumber: z.string().trim().max(30).optional(),
});

function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: user?.fullName ?? "",
    phoneNumber: user?.phoneNumber ?? "",
    whatsappNumber: user?.whatsappNumber ?? "",
  });
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  if (!user) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    const parsed = profileSchema.safeParse(form);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((i) => {
        if (i.path[0]) errs[String(i.path[0])] = i.message;
      });
      setFieldErrors(errs);
      return;
    }
    setBusy(true);
    try {
      const updated = await updateUser(user._id, parsed.data);
      // Persist the merged user locally so the header reflects new values.
      const merged = { ...user, ...updated };
      window.localStorage.setItem(USER_KEY, JSON.stringify(merged));
      notifySuccess("Profile updated");
    } catch (err) {
      setError(extractError(err));
    } finally {
      setBusy(false);
    }
  };

  const doLogout = () => {
    logout();
    navigate({ to: "/" });
  };

  return (
    <Layout>
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-bold tracking-tight">Your profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your account information.
        </p>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_280px]">
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="mb-6 flex items-center gap-4">
              <div className="grid h-16 w-16 place-items-center rounded-full bg-primary/10 text-2xl font-semibold text-primary">
                {user.fullName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="truncate text-lg font-semibold">{user.fullName}</div>
                <div className="truncate text-sm text-muted-foreground">{user.email}</div>
                {user.role && (
                  <span className="mt-1 inline-block rounded-full bg-secondary px-2 py-0.5 text-xs font-medium capitalize">
                    {user.role}
                  </span>
                )}
              </div>
            </div>

            <form onSubmit={submit} className="space-y-4">
              <ErrorMessage message={error} />
              <Field
                label="Full name"
                value={form.fullName}
                error={fieldErrors.fullName}
                onChange={(v) => setForm((f) => ({ ...f, fullName: v }))}
              />
              <Field
                label="Phone number"
                value={form.phoneNumber ?? ""}
                error={fieldErrors.phoneNumber}
                onChange={(v) => setForm((f) => ({ ...f, phoneNumber: v }))}
              />
              <Field
                label="WhatsApp number"
                value={form.whatsappNumber ?? ""}
                error={fieldErrors.whatsappNumber}
                onChange={(v) => setForm((f) => ({ ...f, whatsappNumber: v }))}
              />
              <button
                disabled={busy}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {busy ? "Saving…" : "Save changes"}
              </button>
            </form>

            {/* TODO(backend): email changes, password reset and profile-image
                upload are not documented on the backend. Expose dedicated
                endpoints (e.g. PATCH /api/users/:id/password,
                POST /api/users/:id/avatar) to enable them here. */}
          </div>

          <aside className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-5 text-sm">
              <div className="font-semibold">Account details</div>
              <dl className="mt-3 space-y-2">
                <Row label="Matric" value={user.matricNumber} />
                <Row label="Department" value={user.department} />
                <Row label="Level" value={user.level} />
              </dl>
            </div>
            <button
              onClick={doLogout}
              className="w-full rounded-md border border-destructive/40 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10"
            >
              Sign out
            </button>
          </aside>
        </div>
      </div>
    </Layout>
  );
}

function Field({
  label,
  value,
  onChange,
  error,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-ring ${error ? "border-destructive" : "border-input"}`}
      />
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="truncate font-medium">{value || "—"}</dd>
    </div>
  );
}
