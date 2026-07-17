import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Package, Flag, Clock, CheckCircle2, XCircle, ArrowRight, Users } from "lucide-react";
import { Layout } from "../components/Layout";
import { ErrorMessage, Spinner } from "../components/Feedback";
import { useAuth } from "../context/AuthContext";
import { listProducts } from "../services/productService";
import { listAllReports } from "../services/reportService";
import { extractError } from "../services/api";
import type { Product, Report } from "../services/types";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const { isAdmin } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdmin) return;
    setLoading(true);
    Promise.all([listProducts({ limit: 100 }), listAllReports()])
      .then(([p, r]) => {
        setProducts(p.products);
        setReports(r);
      })
      .catch((e) => setError(extractError(e)))
      .finally(() => setLoading(false));
  }, [isAdmin]);

  if (!isAdmin)
    return (
      <Layout>
        <ErrorMessage message="Admin access required." />
      </Layout>
    );

  const pending = products.filter((p) => p.moderationStatus === "pending").length;
  const approved = products.filter((p) => p.moderationStatus === "approved").length;
  const rejected = products.filter((p) => p.moderationStatus === "rejected").length;
  const openReports = reports.filter(
    (r) => r.status === "Pending" || r.status === "Under Review",
  ).length;

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Admin dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Overview of listings and reports across Nile Market.
        </p>
      </div>
      <ErrorMessage message={error} />
      {loading ? (
        <Spinner />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <Stat label="Pending" value={pending} icon={<Clock className="h-5 w-5" />} tone="amber" />
            <Stat label="Approved" value={approved} icon={<CheckCircle2 className="h-5 w-5" />} tone="emerald" />
            <Stat label="Rejected" value={rejected} icon={<XCircle className="h-5 w-5" />} tone="rose" />
            <Stat label="Open reports" value={openReports} icon={<Flag className="h-5 w-5" />} tone="blue" />
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Panel
              to="/admin/listings"
              icon={<Package className="h-5 w-5" />}
              title="Listing moderation"
              desc="Review, approve, or reject seller listings."
            />
            <Panel
              to="/admin/reports"
              icon={<Flag className="h-5 w-5" />}
              title="Reports"
              desc="Investigate and resolve user reports."
            />
            <Panel
              to="/admin/users"
              icon={<Users className="h-5 w-5" />}
              title="Users"
              desc="Look up user profiles. Full listing pending backend support."
            />
          </div>

        </>
      )}
    </Layout>
  );
}

function Stat({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  tone: "amber" | "emerald" | "rose" | "blue";
}) {
  const tones: Record<string, string> = {
    amber: "bg-amber-500/10 text-amber-700",
    emerald: "bg-emerald-500/10 text-emerald-700",
    rose: "bg-rose-500/10 text-rose-700",
    blue: "bg-blue-500/10 text-blue-700",
  };
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className={`grid h-8 w-8 place-items-center rounded-lg ${tones[tone]}`}>{icon}</span>
      </div>
      <div className="mt-2 text-3xl font-bold">{value}</div>
    </div>
  );
}

function Panel({
  to,
  icon,
  title,
  desc,
}: {
  to: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <Link
      to={to as never}
      className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 transition hover:border-primary/40 hover:shadow-sm"
    >
      <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </span>
      <div className="flex-1">
        <div className="font-semibold">{title}</div>
        <div className="text-sm text-muted-foreground">{desc}</div>
      </div>
      <ArrowRight className="h-5 w-5 text-muted-foreground" />
    </Link>
  );
}
