import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  listListingsForModeration,
  approveListing,
  rejectListing,
} from "../services/adminService";
import { Layout } from "../components/Layout";
import { Spinner, ErrorMessage, EmptyState } from "../components/Feedback";
import { ModerationBadge, StatusBadge, formatPrice } from "../components/ProductCard";
import { extractError } from "../services/api";
import { useAuth } from "../context/AuthContext";
import type { ModerationStatus, Product } from "../services/types";

export const Route = createFileRoute("/_authenticated/admin/listings")({
  component: AdminListings,
});

function AdminListings() {
  const { isAdmin } = useAuth();
  const [filter, setFilter] = useState<ModerationStatus | "all">("pending");
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const load = () => {
    setLoading(true);
    setError(null);
    listListingsForModeration(filter === "all" ? undefined : filter)
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

  const approve = async (id: string) => {
    try {
      await approveListing(id);
      load();
    } catch (e) {
      setError(extractError(e));
    }
  };
  const doReject = async (id: string) => {
    if (!rejectReason.trim()) return;
    try {
      await rejectListing(id, rejectReason.trim());
      setRejectingId(null);
      setRejectReason("");
      load();
    } catch (e) {
      setError(extractError(e));
    }
  };

  return (
    <Layout>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Listing moderation</h1>
        <Link
          to="/admin/reports"
          className="rounded-md border border-input px-3 py-1.5 text-sm hover:bg-accent"
        >
          Reports →
        </Link>
      </div>
      <div className="mb-4 flex gap-2">
        {(["pending", "approved", "rejected", "all"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1 text-sm capitalize ${filter === f ? "bg-primary text-primary-foreground" : "border border-input hover:bg-accent"}`}
          >
            {f}
          </button>
        ))}
      </div>
      <ErrorMessage message={error} />
      {loading ? (
        <Spinner />
      ) : items.length === 0 ? (
        <EmptyState title="Nothing to moderate here" />
      ) : (
        <ul className="space-y-3">
          {items.map((p) => (
            <li key={p._id} className="rounded-lg border border-border bg-card p-4">
              <div className="flex flex-wrap items-start gap-4">
                <div className="h-20 w-20 flex-none overflow-hidden rounded bg-muted">
                  {p.images?.[0] && (
                    <img src={p.images[0]} alt="" className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <Link to="/products/$id" params={{ id: p._id }} className="font-medium hover:underline">
                    {p.title}
                  </Link>
                  <div className="text-sm text-muted-foreground">
                    {formatPrice(p.price)} · {p.condition}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-2">
                    <StatusBadge status={p.status} />
                    <ModerationBadge status={p.moderationStatus} />
                  </div>
                  {p.moderationReason && (
                    <p className="mt-1 text-xs text-muted-foreground">Reason: {p.moderationReason}</p>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  {p.moderationStatus !== "approved" && (
                    <button
                      onClick={() => approve(p._id)}
                      className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700"
                    >
                      Approve
                    </button>
                  )}
                  {p.moderationStatus !== "rejected" && (
                    <button
                      onClick={() => setRejectingId(rejectingId === p._id ? null : p._id)}
                      className="rounded-md border border-destructive/40 px-3 py-1.5 text-sm text-destructive hover:bg-destructive/10"
                    >
                      Reject
                    </button>
                  )}
                </div>
              </div>
              {rejectingId === p._id && (
                <div className="mt-3 flex gap-2">
                  <input
                    autoFocus
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Rejection reason (required)"
                    className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                  <button
                    onClick={() => doReject(p._id)}
                    className="rounded-md bg-destructive px-3 py-1.5 text-sm font-medium text-destructive-foreground"
                  >
                    Confirm
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </Layout>
  );
}
