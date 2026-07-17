import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getProduct, deleteProduct } from "../services/productService";
import { getSeller } from "../services/sellerService";
import { getUser } from "../services/userService";
import { addFavorite, removeFavorite, listFavorites } from "../services/favoriteService";
import { createReport } from "../services/reportService";
import { Layout } from "../components/Layout";
import { ErrorMessage, Spinner } from "../components/Feedback";
import { ModerationBadge, StatusBadge, formatPrice } from "../components/ProductCard";
import { extractError } from "../services/api";
import { useAuth } from "../context/AuthContext";
import type { Product, ReportReason } from "../services/types";

// Build a wa.me URL from a raw phone number. Strips non-digits and
// drops a single leading zero so local formats (e.g. 080…) still work.
function buildWhatsappUrl(raw: string, message: string) {
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  else if (digits.startsWith("0")) digits = digits.slice(1);
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export const Route = createFileRoute("/products/$id")({
  component: ProductDetails,
});

const REPORT_REASONS: ReportReason[] = [
  "Spam",
  "Fraud",
  "Fake Item",
  "Harassment",
  "Inappropriate Content",
  "Other",
];

function ProductDetails() {
  const { id } = Route.useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [sellerName, setSellerName] = useState<string>("");
  const [sellerRating, setSellerRating] = useState<{ avg: number; count: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [favorited, setFavorited] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [reason, setReason] = useState<ReportReason>("Spam");
  const [reportDesc, setReportDesc] = useState("");
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getProduct(id)
      .then(async (p) => {
        if (cancelled) return;
        setProduct(p);
        try {
          const s = await getSeller(p.sellerId);
          if (!cancelled) {
            setSellerName(s.seller.fullName);
            setSellerRating({ avg: s.seller.averageRating, count: s.seller.reviewCount });
          }
        } catch {
          /* seller lookup best-effort */
        }
      })
      .catch((e) => !cancelled && setError(extractError(e)))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (!isAuthenticated) return;
    listFavorites()
      .then((favs) => {
        const pid = product?._id;
        if (!pid) return;
        setFavorited(
          favs.some((f) => {
            const anyF = f as unknown as { _id?: string; productId?: string };
            return anyF._id === pid || anyF.productId === pid;
          }),
        );
      })
      .catch(() => {});
  }, [isAuthenticated, product?._id]);

  const toggleFav = async () => {
    if (!isAuthenticated) {
      navigate({ to: "/auth/login", search: { redirect: `/products/${id}` } });
      return;
    }
    if (!product) return;
    setActionError(null);
    try {
      if (favorited) {
        await removeFavorite(product._id);
        setFavorited(false);
      } else {
        await addFavorite(product._id);
        setFavorited(true);
      }
    } catch (e) {
      setActionError(extractError(e));
    }
  };

  const submitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    setActionError(null);
    try {
      await createReport({
        targetType: "product",
        targetId: product._id,
        reason,
        description: reportDesc || undefined,
      });
      setShowReport(false);
      setReportDesc("");
      alert("Report submitted");
    } catch (err) {
      setActionError(extractError(err));
    }
  };

  const onDelete = async () => {
    if (!product) return;
    if (!confirm("Delete this listing?")) return;
    try {
      await deleteProduct(product._id);
      navigate({ to: "/listings/mine" });
    } catch (e) {
      setActionError(extractError(e));
    }
  };

  if (loading) return <Layout><Spinner /></Layout>;
  if (error || !product)
    return (
      <Layout>
        <ErrorMessage message={error ?? "Product not found"} />
      </Layout>
    );

  const isOwner = user?._id === product.sellerId;

  return (
    <Layout>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div>
          <div className="aspect-square overflow-hidden rounded-xl bg-muted">
            {product.images?.[activeImage] ? (
              <img
                src={product.images[activeImage]}
                alt={product.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                No image
              </div>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`h-16 w-16 flex-none overflow-hidden rounded-md border-2 ${i === activeImage ? "border-primary" : "border-transparent"}`}
                >
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={product.status} />
            <ModerationBadge status={product.moderationStatus} />
          </div>
          <h1 className="text-3xl font-semibold">{product.title}</h1>
          <div className="text-3xl font-bold text-primary">{formatPrice(product.price)}</div>
          <div className="text-sm text-muted-foreground">Condition: {product.condition}</div>
          <p className="whitespace-pre-line text-foreground">{product.description}</p>

          {product.moderationStatus === "rejected" && product.moderationReason && (
            <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
              <strong>Rejection reason:</strong> {product.moderationReason}
            </div>
          )}

          <div className="rounded-lg border border-border p-4">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Seller</div>
            <Link
              to="/sellers/$sellerId"
              params={{ sellerId: product.sellerId }}
              className="text-lg font-medium hover:underline"
            >
              {sellerName || "View seller profile"}
            </Link>
            {sellerRating && (
              <div className="mt-1 text-sm text-muted-foreground">
                ★ {sellerRating.avg.toFixed(1)} · {sellerRating.count} reviews
              </div>
            )}
          </div>

          <ErrorMessage message={actionError} />

          <div className="flex flex-wrap gap-2">
            <button
              onClick={toggleFav}
              className="rounded-md border border-input px-4 py-2 text-sm hover:bg-accent"
            >
              {favorited ? "★ Favorited" : "☆ Add to favorites"}
            </button>
            {isAuthenticated && !isOwner && (
              <button
                onClick={() => setShowReport((s) => !s)}
                className="rounded-md border border-input px-4 py-2 text-sm hover:bg-accent"
              >
                Report listing
              </button>
            )}
            {isOwner && (
              <>
                <Link
                  to="/listings/$id/edit"
                  params={{ id: product._id }}
                  className="rounded-md border border-input px-4 py-2 text-sm hover:bg-accent"
                >
                  Edit
                </Link>
                <button
                  onClick={onDelete}
                  className="rounded-md border border-destructive/40 px-4 py-2 text-sm text-destructive hover:bg-destructive/10"
                >
                  Delete
                </button>
              </>
            )}
          </div>

          {showReport && (
            <form
              onSubmit={submitReport}
              className="space-y-3 rounded-lg border border-border bg-card p-4"
            >
              <div>
                <label className="mb-1 block text-sm font-medium">Reason</label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value as ReportReason)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {REPORT_REASONS.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Description (optional)</label>
                <textarea
                  value={reportDesc}
                  onChange={(e) => setReportDesc(e.target.value)}
                  rows={3}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                Submit report
              </button>
            </form>
          )}
        </div>
      </div>
    </Layout>
  );
}
