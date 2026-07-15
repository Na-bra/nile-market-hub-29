import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Layout } from "../components/Layout";
import { ErrorMessage } from "../components/Feedback";
import { useAuth } from "../context/AuthContext";
import { extractError } from "../services/api";

export const Route = createFileRoute("/auth/register")({
  component: RegisterPage,
});

function RegisterPage() {
  const { signup, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    matricNumber: "",
    department: "",
    level: "",
    phoneNumber: "",
    whatsappNumber: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await signup({
        fullName: form.fullName,
        email: form.email,
        matricNumber: form.matricNumber,
        department: form.department,
        level: form.level,
        phoneNumber: form.phoneNumber,
        whatsappNumber: form.whatsappNumber || undefined,
        password: form.password,
      });
      // Backend does not return a token from signup — sign in immediately.
      await login(form.email, form.password);
      navigate({ to: "/" });
    } catch (err) {
      setError(extractError(err));
    } finally {
      setBusy(false);
    }
  };

  const field = (label: string, key: keyof typeof form, type = "text", required = true) => (
    <div>
      <label className="mb-1 block text-sm">{label}</label>
      <input
        type={type}
        required={required}
        value={form[key]}
        onChange={update(key)}
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
      />
    </div>
  );

  return (
    <Layout>
      <div className="mx-auto max-w-md rounded-lg border border-border bg-card p-6">
        <h1 className="text-xl font-semibold">Create account</h1>
        <form onSubmit={submit} className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <ErrorMessage message={error} />
          </div>
          <div className="sm:col-span-2">{field("Full name", "fullName")}</div>
          <div className="sm:col-span-2">{field("Email", "email", "email")}</div>
          {field("Matric number", "matricNumber")}
          {field("Department", "department")}
          {field("Level", "level")}
          {field("Phone number", "phoneNumber")}
          <div className="sm:col-span-2">{field("WhatsApp number (optional)", "whatsappNumber", "text", false)}</div>
          <div className="sm:col-span-2">{field("Password", "password", "password")}</div>
          <div className="sm:col-span-2">
            <button
              disabled={busy}
              className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {busy ? "Creating…" : "Create account"}
            </button>
          </div>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/auth/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </Layout>
  );
}
