import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { listMyReports } from "../services/reportService";
import { Layout } from "../components/Layout";
import { Spinner, ErrorMessage, EmptyState } from "../components/Feedback";
import { extractError } from "../services/api";
import type { Report } from "../services/types";

export const Route = createFileRoute("/_authenticated/reports")({
  component: MyReports,
});

function MyReports() {
  const [items, setItems] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listMyReports()
      .then(setItems)
      .catch((e) => setError(extractError(e)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <h1 className="mb-6 text-2xl font-semibold">Your reports</h1>
      <ErrorMessage message={error} />
      {loading ? (
        <Spinner />
      ) : items.length === 0 ? (
        <EmptyState title="No reports submitted" />
      ) : (
        <ul className="space-y-3">
          {items.map((r) => (
            <li key={r._id} className="rounded-lg border border-border bg-card p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="font-medium">
                    {r.targetType} · {r.reason}
                  </div>
                  <div className="text-xs text-muted-foreground">Target ID: {r.targetId}</div>
                </div>
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs">{r.status}</span>
              </div>
              {r.description && (
                <p className="mt-2 text-sm text-muted-foreground">{r.description}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </Layout>
  );
}
