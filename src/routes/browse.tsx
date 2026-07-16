import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { z } from "zod";
import { listProducts, type ProductQuery } from "../services/productService";
import { listCategories } from "../services/categoryService";
import { Layout } from "../components/Layout";
import { ProductCard } from "../components/ProductCard";
import { ErrorMessage, SkeletonGrid, EmptyState } from "../components/Feedback";
import { extractError } from "../services/api";
import type { Category, Product } from "../services/types";

const browseSearch = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  status: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  page: z.coerce.number().int().min(1).optional(),
  sort: z.enum(["newest", "price-asc", "price-desc"]).optional(),
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
  const [filtersOpen, setFiltersOpen] = useState(false);

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

  const sorted = useMemo(() => {
    // TODO(backend): backend does not expose a sort parameter on /api/products.
    // We sort client-side within the current page as a best-effort UX affordance.
    const copy = [...products];
    if (search.sort === "price-asc") copy.sort((a, b) => a.price - b.price);
    else if (search.sort === "price-desc") copy.sort((a, b) => b.price - a.price);
    return copy;
  }, [products, search.sort]);

  const update = (patch: Partial<z.infer<typeof browseSearch>>) => {
    navigate({ search: (prev: any) => ({ ...prev, ...patch, page: 1 }) });
  };

  const goPage = (p: number) => navigate({ search: (prev: any) => ({ ...prev, page: p }) });

  const activeCount =
    (search.category ? 1 : 0) +
    (search.status ? 1 : 0) +
    (search.minPrice != null ? 1 : 0) +
    (search.maxPrice != null ? 1 : 0);

  const clearAll = () =>
    navigate({
      search: { search: search.search },
    });

  const page = search.page ?? 1;

  const Filters = (
    <div className="space-y-6">
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Category</h3>
          {search.category && (
            <button onClick={() => update({ category: undefined })} className="text-xs text-primary hover:underline">
              Clear
            </button>
          )}
        </div>
        <div className="space-y-0.5 text-sm">
          <button
            onClick={() => update({ category: undefined })}
            className={`block w-full rounded-md px-2 py-1.5 text-left hover:bg-accent ${!search.category ? "bg-accent font-medium" : ""}`}
          >
            All categories
          </button>
          {categories.map((c) => (
            <button
              key={c._id}
              onClick={() => update({ category: c._id })}
              className={`block w-full rounded-md px-2 py-1.5 text-left hover:bg-accent ${search.category === c._id ? "bg-accent font-medium" : ""}`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>
      <div>
        <h3 className="mb-2 text-sm font-semibold">Availability</h3>
        <select
          value={search.status ?? ""}
          onChange={(e) => update({ status: e.target.value || undefined })}
          className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm"
        >
          <option value="">Any status</option>
          <option value="Available">Available</option>
          <option value="Reserved">Reserved</option>
          <option value="Sold">Sold</option>
        </select>
      </div>
      <div>
        <h3 className="mb-2 text-sm font-semibold">Price range</h3>
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
      {activeCount > 0 && (
        <button
          onClick={clearAll}
          className="w-full rounded-md border border-input px-3 py-1.5 text-sm hover:bg-accent"
        >
          Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Browse products</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {loading ? "Loading…" : `${total} ${total === 1 ? "result" : "results"} found`}
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          update({ search: term || undefined });
        }}
        className="mb-6 flex flex-wrap gap-2"
      >
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Search products…"
            className="w-full rounded-full border border-input bg-background py-2.5 pl-10 pr-4 text-sm outline-none focus:border-ring"
          />
        </div>
        <select
          value={search.sort ?? "newest"}
          onChange={(e) => update({ sort: e.target.value as "newest" | "price-asc" | "price-desc" })}
          className="rounded-full border border-input bg-background px-4 py-2.5 text-sm"
        >
          <option value="newest">Newest</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
        </select>
        <button
          type="button"
          onClick={() => setFiltersOpen(true)}
          className="flex items-center gap-2 rounded-full border border-input bg-background px-4 py-2.5 text-sm md:hidden"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {activeCount > 0 && (
            <span className="rounded-full bg-primary px-1.5 text-xs text-primary-foreground">
              {activeCount}
            </span>
          )}
        </button>
      </form>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-[240px_1fr]">
        <aside className="hidden md:block">
          <div className="sticky top-24 rounded-xl border border-border bg-card p-5">{Filters}</div>
        </aside>

        {filtersOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setFiltersOpen(false)} />
            <div className="absolute right-0 top-0 h-full w-80 max-w-[85%] overflow-y-auto bg-background p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Filters</h2>
                <button onClick={() => setFiltersOpen(false)} className="rounded-md p-1 hover:bg-accent">
                  <X className="h-5 w-5" />
                </button>
              </div>
              {Filters}
            </div>
          </div>
        )}

        <div>
          <ErrorMessage message={error} />
          {loading ? (
            <SkeletonGrid count={9} />
          ) : sorted.length === 0 ? (
            <EmptyState
              title="No products found"
              description="Try clearing filters or searching for something else."
            />
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {sorted.map((p) => (
                  <ProductCard key={p._id} product={p} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => goPage(page - 1)}
                    className="rounded-md border border-input px-3 py-1.5 text-sm disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => goPage(page + 1)}
                    className="rounded-md border border-input px-3 py-1.5 text-sm disabled:opacity-40"
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
