import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { listFavorites, removeFavorite } from "../services/favoriteService";
import { Layout } from "../components/Layout";
import { ProductCard } from "../components/ProductCard";
import { Spinner, ErrorMessage, EmptyState } from "../components/Feedback";
import { extractError } from "../services/api";
import type { Product } from "../services/types";

export const Route = createFileRoute("/_authenticated/favorites")({
  component: FavoritesPage,
});

function FavoritesPage() {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    listFavorites()
      .then((favs) => {
        // Backend may return favorite records or nested products; normalize both.
        const products = favs.map((f) => {
          const anyF = f as unknown as { productId?: Product | string } & Product;
          if (anyF.productId && typeof anyF.productId === "object") return anyF.productId as Product;
          return f as Product;
        });
        setItems(products.filter((p) => p && p._id));
      })
      .catch((e) => setError(extractError(e)))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const remove = async (id: string) => {
    try {
      await removeFavorite(id);
      setItems((prev) => prev.filter((p) => p._id !== id));
    } catch (e) {
      setError(extractError(e));
    }
  };

  return (
    <Layout>
      <h1 className="mb-6 text-2xl font-semibold">Your favorites</h1>
      <ErrorMessage message={error} />
      {loading ? (
        <Spinner />
      ) : items.length === 0 ? (
        <EmptyState title="No favorites yet" description="Tap the star on any product to save it." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => (
            <div key={p._id} className="relative">
              <ProductCard product={p} />
              <button
                onClick={() => remove(p._id)}
                className="absolute right-2 top-2 rounded-full bg-background/90 px-2 py-1 text-xs shadow"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
