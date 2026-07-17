import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search, ShieldCheck } from "lucide-react";
import { Layout } from "../components/Layout";
import { EmptyState, ErrorMessage } from "../components/Feedback";
import { useAuth } from "../context/AuthContext";
import { getUser } from "../services/userService";
import { extractError } from "../services/api";
import type { User } from "../services/types";

export const Route = createFileRoute("/_authenticated/admin/users")({
  component: AdminUsers,
});

// The backend currently exposes only `GET /api/users/:id` and
// `PATCH /api/users/:id` (self-update). There is no user list endpoint,
// no search endpoint, and no role-mutation endpoint. This page is
// therefore a shell that surfaces exactly what the API supports today.
//
// TODO(backend): expose the following to complete this page:
//   - GET  /api/users?search=&page=&limit=       → paginated user list
//   - PATCH /api/users/:id/role  { role: "admin" | "student" }
//                                                → promote / demote
//   - (optional) PATCH /api/users/:id/status     → suspend / reactivate

function AdminUsers() {
  const { isAdmin } = useAuth();
  const [id, setId] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isAdmin) {
    return (
      <Layout>
        <ErrorMessage message="Admin access required." />
      </Layout>
    );
  }

  const lookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id.trim()) return;
    setLoading(true);
    setError(null);
    setUser(null);
    try {
      const u = await getUser(id.trim());
      setUser(u);
    } catch (err) {
      setError(extractError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="mb-6 flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
          <ShieldCheck className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Users</h1>
          <p className="text-sm text-muted-foreground">
            Look up a user by ID. Full listing and role management require additional backend
            endpoints (see notes below).
          </p>
        </div>
      </div>

      <form onSubmit={lookup} className="mb-6 flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={id}
            onChange={(e) => setId(e.target.value)}
            placeholder="Paste a user ID"
            className="w-full rounded-md border border-input bg-background py-2 pl-9 pr-3 text-sm outline-none focus:border-ring"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !id.trim()}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? "Loading…" : "Look up"}
        </button>
      </form>

      <ErrorMessage message={error} />

      {user ? (
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-start gap-4">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-primary/10 text-xl font-semibold text-primary">
              {user.fullName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="truncate text-lg font-semibold">{user.fullName}</h2>
                {user.role && (
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium capitalize">
                    {user.role}
                  </span>
                )}
              </div>
              <div className="mt-0.5 truncate text-sm text-muted-foreground">{user.email}</div>

              <dl className="mt-4 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                <Row label="Matric" value={user.matricNumber} />
                <Row label="Department" value={user.department} />
                <Row label="Level" value={user.level} />
                <Row label="Phone" value={user.phoneNumber} />
                <Row label="WhatsApp" value={user.whatsappNumber} />
                <Row label="User ID" value={user._id} />
              </dl>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2 border-t border-border pt-4">
            <button
              type="button"
              disabled
              title="Backend endpoint not available"
              className="cursor-not-allowed rounded-md border border-input px-3 py-1.5 text-sm text-muted-foreground opacity-60"
            >
              Promote to admin
            </button>
            <button
              type="button"
              disabled
              title="Backend endpoint not available"
              className="cursor-not-allowed rounded-md border border-input px-3 py-1.5 text-sm text-muted-foreground opacity-60"
            >
              Demote admin
            </button>
            {/* TODO(backend): wire these buttons once
                PATCH /api/users/:id/role (or similar) exists. */}
          </div>
        </div>
      ) : (
        !loading &&
        !error && (
          <EmptyState
            title="No user loaded"
            description="Enter a user ID above to view their profile."
          />
        )
      )}

      <div className="mt-8 rounded-lg border border-dashed border-border bg-muted/30 p-4 text-xs text-muted-foreground">
        <strong className="font-semibold text-foreground">Backend gaps:</strong> a paginated user
        list, a search endpoint, and role-mutation routes are not exposed by the API yet. This
        page will grow to include them once those endpoints ship.
      </div>
    </Layout>
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
