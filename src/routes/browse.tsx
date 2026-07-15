import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { listProducts, type ProductQuery } from "../services/productService";
import { listCategories } from "../services/categoryService";
import { Layout } from "../components/Layout";
import { ProductCard } from "../components/ProductCard";
import { ErrorMessage, Spinner, EmptyState } from "../components/Feedback";
import { extractError } from "../services/api";
import type { Category, Product } from "../services/types";

const browseSearch = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  status: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  page: z.coerce.number().int().min(1).optional(),
});

export const Route = createFileRoute("/browse")({
  validateSearch: browseSearch,
  component: Browse,
});

function Browse() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/browse" });
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [term, setTerm] = useState(search.search ?? "");

  useEffect(() => {
    listCategories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    const q: ProductQuery = {
      search: search.search,
      category: search.category,
      status: search.status,
      minPrice: search.minPrice,
      maxPrice: search.maxPrice,
      page: search.page ?? 1,
      limit: 12,
    };
    listProducts(q)
      .then((r) => {
        if (cancelled) return;
        setProducts(r.products);
        setTotalPages(r.totalPages);
        setTotal(r.totalProducts);
      })
      .catch((e) => !cancelled && setError(extractError(e)))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [search.search, search.category, search.status, search.minPrice, search.maxPrice, search.page]);

  const update = (patch: Partial<z.infer<typeof browseSearch>>) => {
    navigate({ search: (prev) => ({ ...prev, ...patch, page: 1 }) });
  };

  return (
    <Layout>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Browse products</h1>
          <p className="text-sm text-muted-foreground">{total} results</p>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            update({ search: term || undefined });
          }}
          className="flex gap-2"
        >
          <input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Search title or description"
            className="w-72 rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
          <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            Search
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-[220px_1fr]">
        <aside className="space-y-6">
          <div>
            <h3 className="mb-2 text-sm font-semibold">Category</h3>
            <div className="space-y-1 text-sm">
              <button
                onClick={() => update({ category: undefined })}
                className={`block w-full rounded px-2 py-1 text-left hover:bg-accent ${!search.category ? "bg-accent font-medium" : ""}`}
              >
                All
              </button>
              {categories.map((c) => (
                <button
                  key={c._id}
                  onClick={() => update({ category: c._id })}
                  className={`block w-full rounded px-2 py-1 text-left hover:bg-accent ${search.category === c._id ? "bg-accent font-medium" : ""}`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>
          <div>
            <h3 className="mb-2 text-sm font-semibold">Status</h3>
            <select
              value={search.status ?? ""}
              onChange={(e) => update({ status: e.target.value || undefined })}
              className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm"
            >
              <option value="">Any</option>
              <option value="Available">Available</option>
              <option value="Reserved">Reserved</option>
              <option value="Sold">Sold</option>
            </select>
          </div>
          <div>
            <h3 className="mb-2 text-sm font-semibold">Price</h3>
            <div className="flex gap-2">
              <input
                type="number"
                defaultValue={search.minPrice ?? ""}
                onBlur={(e) => update({ minPrice: e.target.value ? Number(e.target.value) : undefined })}
                placeholder="Min"
                className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm"
              />
              <input
                type="number"
                defaultValue={search.maxPrice ?? ""}
                onBlur={(e) => update({ maxPrice: e.target.value ? Number(e.target.value) : undefined })}
                placeholder="Max"
                className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm"
              />
            </div>
          </div>
        </aside>

        <div>
          <ErrorMessage message={error} />
          {loading ? (
            <Spinner />
          ) : products.length === 0 ? (
            <EmptyState title="No products found" description="Try adjusting your filters." />
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((p) => (
                  <ProductCard key={p._id} product={p} />
                ))}
              </div>
              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  <button
                    disabled={(search.page ?? 1) <= 1}
                    onClick={() => navigate({ search: (p) => ({ ...p, page: (p.page ?? 1) - 1 }) })}
                    className="rounded-md border border-input px-3 py-1.5 text-sm disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-muted-foreground">
                    Page {search.page ?? 1} of {totalPages}
                  </span>
                  <button
                    disabled={(search.page ?? 1) >= totalPages}
                    onClick={() => navigate({ search: (p) => ({ ...p, page: (p.page ?? 1) + 1 }) })}
                    className="rounded-md border border-input px-3 py-1.5 text-sm disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
