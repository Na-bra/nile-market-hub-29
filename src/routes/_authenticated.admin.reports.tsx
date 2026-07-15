import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { listAllReports, updateReportStatus } from "../services/adminService";
import { Layout } from "../components/Layout";
import { Spinner, ErrorMessage, EmptyState } from "../components/Feedback";
import { extractError } from "../services/api";
import { useAuth } from "../context/AuthContext";
import type { Report, ReportStatus, User } from "../services/types";

export const Route = createFileRoute("/_authenticated/admin/reports")({
  component: AdminReports,
});

const STATUSES: ReportStatus[] = ["Pending", "Under Review", "Resolved", "Rejected"];

function AdminReports() {
  const { isAdmin } = useAuth();
  const [items, setItems] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<ReportStatus | "all">("Pending");

  const load = () => {
    setLoading(true);
    listAllReports(filter === "all" ? {} : { status: filter })
      .then(setItems)
      .catch((e) => setError(extractError(e)))
      .finally(() => setLoading(false));
  };
  useEffect(load, [filter]);

  if (!isAdmin)
    return (
      <Layout>
        <ErrorMessage message="Admin access required." />
      </Layout>
    );

  const setStatus = async (id: string, status: ReportStatus) => {
    try {
      await updateReportStatus(id, status);
      load();
    } catch (e) {
      setError(extractError(e));
    }
  };

  return (
    <Layout>
      <h1 className="mb-6 text-2xl font-semibold">Reports</h1>
      <div className="mb-4 flex flex-wrap gap-2">
        {(["Pending", "Under Review", "Resolved", "Rejected", "all"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as ReportStatus | "all")}
            className={`rounded-full px-3 py-1 text-sm ${filter === f ? "bg-primary text-primary-foreground" : "border border-input hover:bg-accent"}`}
          >
            {f}
          </button>
        ))}
      </div>
      <ErrorMessage message={error} />
      {loading ? (
        <Spinner />
      ) : items.length === 0 ? (
        <EmptyState title="No reports" />
      ) : (
        <ul className="space-y-3">
          {items.map((r) => {
            const reporter = typeof r.reporterId === "object" ? (r.reporterId as User) : null;
            return (
              <li key={r._id} className="rounded-lg border border-border bg-card p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="font-medium">
                      {r.targetType} · {r.reason}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Target: {r.targetId}
                      {reporter && <> · By: {reporter.fullName}</>}
                    </div>
                    {r.description && (
                      <p className="mt-2 text-sm text-muted-foreground">{r.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs">{r.status}</span>
                    <select
                      value={r.status}
                      onChange={(e) => setStatus(r._id, e.target.value as ReportStatus)}
                      className="rounded-md border border-input bg-background px-2 py-1 text-xs"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Layout>
  );
}
