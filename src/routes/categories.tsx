import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { listCategories } from "../services/categoryService";
import { Layout } from "../components/Layout";
import { Spinner, ErrorMessage } from "../components/Feedback";
import { extractError } from "../services/api";
import type { Category } from "../services/types";

export const Route = createFileRoute("/categories")({
  component: Categories,
});

function Categories() {
  const [items, setItems] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listCategories()
      .then(setItems)
      .catch((e) => setError(extractError(e)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <h1 className="mb-6 text-2xl font-semibold">Categories</h1>
      <ErrorMessage message={error} />
      {loading ? (
        <Spinner />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((c) => (
            <Link
              key={c._id}
              to="/browse"
              search={{ category: c._id }}
              className="rounded-lg border border-border bg-card p-5 transition hover:border-primary hover:shadow-sm"
            >
              <div className="text-lg font-medium">{c.name}</div>
              {c.description && (
                <div className="mt-1 text-sm text-muted-foreground">{c.description}</div>
              )}
            </Link>
          ))}
        </div>
      )}
    </Layout>
  );
}
