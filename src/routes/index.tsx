import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, ShoppingBag, Shield, Tag } from "lucide-react";
import { listProducts } from "../services/productService";
import { listCategories } from "../services/categoryService";
import { Layout } from "../components/Layout";
import { ProductCard } from "../components/ProductCard";
import { SkeletonGrid, ErrorMessage } from "../components/Feedback";
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
      <section className="overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/5 via-background to-accent">
        <div className="grid gap-8 p-8 md:grid-cols-2 md:p-14">
          <div className="flex flex-col justify-center">
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Trusted by Nile University students
            </span>
            <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight md:text-5xl">
              The campus marketplace,{" "}
              <span className="text-primary">reimagined.</span>
            </h1>
            <p className="mt-4 max-w-md text-base text-muted-foreground">
              Discover books, gadgets, fashion and more from fellow students. Sell what you don't
              need in just a few taps.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/browse"
                className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Browse listings <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/listings/new"
                className="rounded-full border border-input bg-background px-5 py-2.5 text-sm font-medium hover:bg-accent"
              >
                Start selling
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {featured.slice(0, 4).map((p, i) => (
              <div
                key={p._id}
                className={`overflow-hidden rounded-2xl border border-border bg-card ${i % 2 ? "translate-y-4" : ""}`}
              >
                {p.images?.[0] && (
                  <img
                    src={p.images[0]}
                    alt={p.title}
                    className="aspect-square w-full object-cover"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          { icon: ShoppingBag, title: "Peer-to-peer", desc: "Buy directly from students" },
          { icon: Shield, title: "Moderated", desc: "Listings reviewed by admins" },
          { icon: Tag, title: "Fair prices", desc: "No hidden fees or middlemen" },
        ].map((f) => (
          <div key={f.title} className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
              <f.icon className="h-5 w-5" />
            </span>
            <div>
              <div className="text-sm font-semibold">{f.title}</div>
              <div className="text-xs text-muted-foreground">{f.desc}</div>
            </div>
          </div>
        ))}
      </section>

      <section className="mt-12">
        <div className="mb-4 flex items-end justify-between">
          <h2 className="text-xl font-semibold">Shop by category</h2>
          <Link to="/categories" className="text-sm text-primary hover:underline">
            All categories
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {categories.slice(0, 8).map((c) => (
            <Link
              key={c._id}
              to="/browse"
              search={{ category: c._id }}
              className="rounded-xl border border-border bg-card p-4 transition hover:border-primary/40 hover:shadow-sm"
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
          <SkeletonGrid count={8} />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </section>
    </Layout>
  );
}
