import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Layout } from "../components/Layout";
import { ErrorMessage } from "../components/Feedback";
import { useAuth } from "../context/AuthContext";
import { useFormErrors } from "../hooks/useFormErrors";

export const Route = createFileRoute("/auth/register")({
  component: RegisterPage,
});

const registerSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required").max(120),
  email: z.string().trim().email("Enter a valid email"),
  matricNumber: z.string().trim().min(1, "Matric number is required"),
  department: z.string().trim().min(1, "Department is required"),
  level: z.string().trim().min(1, "Level is required"),
  phoneNumber: z.string().trim().min(1, "Phone number is required"),
  whatsappNumber: z.string().trim().optional(),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormShape = z.input<typeof registerSchema>;

function RegisterPage() {
  const { signup, login } = useAuth();
  const navigate = useNavigate();
  const errors = useFormErrors();
  const [form, setForm] = useState<FormShape>({
    fullName: "",
    email: "",
    matricNumber: "",
    department: "",
    level: "",
    phoneNumber: "",
    whatsappNumber: "",
    password: "",
  });
  const [busy, setBusy] = useState(false);

  const update = (k: keyof FormShape) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    errors.clearField(k);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    errors.reset();
    const parsed = registerSchema.safeParse(form);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((i) => {
        if (i.path[0]) errs[String(i.path[0])] = i.message;
      });
      errors.setFieldErrors(errs);
      return;
    }
    setBusy(true);
    try {
      await signup({
        fullName: parsed.data.fullName,
        email: parsed.data.email,
        matricNumber: parsed.data.matricNumber,
        department: parsed.data.department,
        level: parsed.data.level,
        phoneNumber: parsed.data.phoneNumber,
        whatsappNumber: parsed.data.whatsappNumber || undefined,
        password: parsed.data.password,
      });
      // Backend does not return a token from signup — sign in immediately.
      await login(parsed.data.email, parsed.data.password);
      navigate({ to: "/" });
    } catch (err) {
      errors.setFromError(err);
    } finally {
      setBusy(false);
    }
  };

  const field = (label: string, key: keyof FormShape, type = "text", required = true) => (
    <div>
      <label className="mb-1 block text-sm font-medium">{label}</label>
      <input
        type={type}
        required={required}
        value={form[key] ?? ""}
        onChange={update(key)}
        className={`w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-ring ${
          errors.fieldErrors[key] ? "border-destructive" : "border-input"
        }`}
      />
      {errors.fieldErrors[key] && (
        <p className="mt-1 text-xs text-destructive">{errors.fieldErrors[key]}</p>
      )}
    </div>
  );

  return (
    <Layout>
      <div className="mx-auto max-w-xl">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
          <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Join Nile Market to buy and sell with fellow students.
          </p>
          <form onSubmit={submit} noValidate className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <ErrorMessage message={errors.formError} />
            </div>
            <div className="sm:col-span-2">{field("Full name", "fullName")}</div>
            <div className="sm:col-span-2">{field("Email", "email", "email")}</div>
            {field("Matric number", "matricNumber")}
            {field("Department", "department")}
            {field("Level", "level")}
            {field("Phone number", "phoneNumber")}
            <div className="sm:col-span-2">
              {field("WhatsApp number (optional)", "whatsappNumber", "text", false)}
            </div>
            <div className="sm:col-span-2">{field("Password", "password", "password")}</div>
            <div className="sm:col-span-2">
              <button
                disabled={busy}
                className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {busy ? "Creating…" : "Create account"}
              </button>
            </div>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/auth/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </Layout>
  );
}
