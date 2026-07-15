import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { listProducts } from "../services/productService";
import { listCategories } from "../services/categoryService";
import { Layout } from "../components/Layout";
import { ProductCard } from "../components/ProductCard";
import { Spinner, ErrorMessage } from "../components/Feedback";
import { extractError } from "../services/api";
import type { Category, Product } from "../services/types";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [p, c] = await Promise.all([
          listProducts({ status: "Available", limit: 8 }),
          listCategories(),
        ]);
        if (cancelled) return;
        setFeatured(p.products);
        setCategories(c);
      } catch (e) {
        if (!cancelled) setError(extractError(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Layout>
      <section className="rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-background to-accent p-10">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            The student marketplace for Nile University.
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Buy books, gadgets, clothes and more from fellow students. Post a listing in minutes.
          </p>
          <div className="mt-6 flex gap-3">
            <Link
              to="/browse"
              className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Browse products
            </Link>
            <Link
              to="/listings/new"
              className="rounded-md border border-input px-5 py-2.5 text-sm font-medium hover:bg-accent"
            >
              Sell something
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-12">
        <div className="mb-4 flex items-end justify-between">
          <h2 className="text-xl font-semibold">Browse by category</h2>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {categories.map((c) => (
            <Link
              key={c._id}
              to="/browse"
              search={{ category: c._id }}
              className="rounded-lg border border-border bg-card p-4 transition hover:border-primary hover:shadow-sm"
            >
              <div className="font-medium">{c.name}</div>
              {c.description && (
                <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                  {c.description}
                </div>
              )}
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <div className="mb-4 flex items-end justify-between">
          <h2 className="text-xl font-semibold">Latest listings</h2>
          <Link to="/browse" className="text-sm text-primary hover:underline">
            View all
          </Link>
        </div>
        <ErrorMessage message={error} />
        {loading ? (
          <Spinner />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </section>
    </Layout>
  );
}
