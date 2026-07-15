import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getProduct, updateProduct } from "../services/productService";
import { listCategories } from "../services/categoryService";
import { Layout } from "../components/Layout";
import { ErrorMessage, Spinner } from "../components/Feedback";
import { extractError } from "../services/api";
import type { Category, Product } from "../services/types";

export const Route = createFileRoute("/_authenticated/listings/$id/edit")({
  component: EditListing,
});

const CONDITIONS = ["Brand New", "Like New", "Used", "Fairly Used", "For Parts"];

function EditListing() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  useEffect(() => {
    Promise.all([getProduct(id), listCategories()])
      .then(([p, c]) => {
        setProduct(p);
        setCategories(c);
      })
      .catch((e) => setError(extractError(e)))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Layout><Spinner /></Layout>;
  if (!product) return <Layout><ErrorMessage message={error ?? "Not found"} /></Layout>;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const updated = await updateProduct(id, {
        title: product.title,
        description: product.description,
        price: product.price,
        categoryId: product.categoryId,
        condition: product.condition,
        status: product.status,
        images: files.length ? files : undefined,
      });
      navigate({ to: "/products/$id", params: { id: updated._id } });
    } catch (err) {
      setError(extractError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Layout>
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-2xl font-semibold">Edit listing</h1>
        <form onSubmit={submit} className="space-y-4 rounded-lg border border-border bg-card p-6">
          <ErrorMessage message={error} />
          <p className="rounded-md bg-amber-50 p-3 text-xs text-amber-800">
            Editing a listing resets its moderation status to pending until an admin re-approves it.
          </p>
          <div>
            <label className="mb-1 block text-sm">Title</label>
            <input
              value={product.title}
              onChange={(e) => setProduct({ ...product, title: e.target.value })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm">Description</label>
            <textarea
              rows={4}
              value={product.description}
              onChange={(e) => setProduct({ ...product, description: e.target.value })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm">Price</label>
              <input
                type="number"
                value={product.price}
                onChange={(e) => setProduct({ ...product, price: Number(e.target.value) })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm">Condition</label>
              <select
                value={product.condition}
                onChange={(e) => setProduct({ ...product, condition: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {CONDITIONS.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm">Category</label>
              <select
                value={product.categoryId}
                onChange={(e) => setProduct({ ...product, categoryId: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm">Status</label>
              <select
                value={product.status}
                onChange={(e) =>
                  setProduct({ ...product, status: e.target.value as Product["status"] })
                }
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option>Available</option>
                <option>Reserved</option>
                <option>Sold</option>
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm">Replace images (optional)</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
              className="block w-full text-sm"
            />
          </div>
          <button
            disabled={busy}
            className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {busy ? "Saving…" : "Save changes"}
          </button>
        </form>
      </div>
    </Layout>
  );
}
