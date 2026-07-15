import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Layout } from "../components/Layout";
import { ErrorMessage } from "../components/Feedback";
import { useAuth } from "../context/AuthContext";
import { extractError } from "../services/api";

const loginSearch = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/auth/login")({
  validateSearch: loginSearch,
  component: LoginPage,
});

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await login(email, password);
      navigate({ to: (search.redirect as "/") ?? "/" });
    } catch (err) {
      setError(extractError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Layout>
      <div className="mx-auto max-w-sm rounded-lg border border-border bg-card p-6">
        <h1 className="text-xl font-semibold">Sign in</h1>
        <p className="mt-1 text-sm text-muted-foreground">Welcome back to Nile Market.</p>
        <form onSubmit={submit} className="mt-6 space-y-3">
          <ErrorMessage message={error} />
          <div>
            <label className="mb-1 block text-sm">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          <button
            disabled={busy}
            className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          No account?{" "}
          <Link to="/auth/register" className="text-primary hover:underline">
            Register
          </Link>
        </p>
      </div>
    </Layout>
  );
}
