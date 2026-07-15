import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { listProducts } from "../services/productService";
import { Layout } from "../components/Layout";
import { ProductCard } from "../components/ProductCard";
import { Spinner, ErrorMessage, EmptyState } from "../components/Feedback";
import { extractError } from "../services/api";
import { useAuth } from "../context/AuthContext";
import type { Product } from "../services/types";

export const Route = createFileRoute("/_authenticated/listings/mine")({
  component: MyListings,
});

function MyListings() {
  const { user } = useAuth();
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    // NOTE: backend does not expose a "my products" filter — fetch a wide page
    // and filter by sellerId client-side.
    // TODO(backend): add GET /api/products?seller=me or similar.
    listProducts({ limit: 100 })
      .then((r) => setItems(r.products.filter((p) => p.sellerId === user._id)))
      .catch((e) => setError(extractError(e)))
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <Layout>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Your listings</h1>
        <Link
          to="/listings/new"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          New listing
        </Link>
      </div>
      <ErrorMessage message={error} />
      {loading ? (
        <Spinner />
      ) : items.length === 0 ? (
        <EmptyState title="No listings yet" description="Post your first item to get started." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => (
            <ProductCard key={p._id} product={p} showModeration />
          ))}
        </div>
      )}
    </Layout>
  );
}
