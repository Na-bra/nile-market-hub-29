import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getSeller } from "../services/sellerService";
import { listSellerReviews } from "../services/reviewService";
import { createReview } from "../services/reviewService";
import { Layout } from "../components/Layout";
import { ProductCard } from "../components/ProductCard";
import { Rating } from "../components/Rating";
import { Spinner, ErrorMessage, EmptyState } from "../components/Feedback";
import { extractError } from "../services/api";
import { useAuth } from "../context/AuthContext";
import type { Review, SellerProfile, User } from "../services/types";

export const Route = createFileRoute("/sellers/$sellerId")({
  component: SellerPage,
});

function SellerPage() {
  const { sellerId } = Route.useParams();
  const { user, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<SellerProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    Promise.all([getSeller(sellerId), listSellerReviews(sellerId)])
      .then(([p, rs]) => {
        setProfile(p);
        setReviews(rs);
      })
      .catch((e) => setError(extractError(e)))
      .finally(() => setLoading(false));
  };
  useEffect(load, [sellerId]);

  const canReview = isAuthenticated && user?._id !== sellerId;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    try {
      await createReview({ sellerId, rating, comment: comment || undefined });
      setComment("");
      setRating(5);
      load();
    } catch (err) {
      setSubmitError(extractError(err));
    }
  };

  if (loading) return <Layout><Spinner /></Layout>;
  if (error || !profile) return <Layout><ErrorMessage message={error ?? "Seller not found"} /></Layout>;

  const s = profile.seller;

  return (
    <Layout>
      <div className="flex items-center gap-4">
        <div className="h-20 w-20 overflow-hidden rounded-full bg-muted">
          {s.profileImage ? (
            <img src={s.profileImage} alt={s.fullName} className="h-full w-full object-cover" />
          ) : null}
        </div>
        <div>
          <h1 className="text-2xl font-semibold">{s.fullName}</h1>
          <p className="text-sm text-muted-foreground">
            {[s.department, s.level && `Level ${s.level}`].filter(Boolean).join(" · ")}
          </p>
          <Rating value={s.averageRating} count={s.reviewCount} />
        </div>
      </div>

      <section className="mt-10">
        <h2 className="mb-4 text-xl font-semibold">Listings</h2>
        {profile.products.length === 0 ? (
          <EmptyState title="No active listings" />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {profile.products.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </section>

      <section className="mt-10">
        <h2 className="mb-4 text-xl font-semibold">Reviews</h2>
        {canReview && (
          <form
            onSubmit={submit}
            className="mb-6 space-y-3 rounded-lg border border-border bg-card p-4"
          >
            <div className="text-sm font-medium">Leave a review</div>
            <ErrorMessage message={submitError} />
            <div>
              <label className="mb-1 block text-sm">Rating</label>
              <select
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {n} star{n !== 1 ? "s" : ""}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm">Comment (optional)</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              Submit review
            </button>
          </form>
        )}
        {reviews.length === 0 ? (
          <EmptyState title="No reviews yet" />
        ) : (
          <ul className="space-y-3">
            {reviews.map((r) => {
              const reviewer =
                typeof r.reviewerId === "object" ? (r.reviewerId as User) : null;
              return (
                <li key={r._id} className="rounded-lg border border-border bg-card p-4">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{reviewer?.fullName ?? "Anonymous"}</div>
                    <Rating value={r.rating} />
                  </div>
                  {r.comment && (
                    <p className="mt-2 text-sm text-muted-foreground">{r.comment}</p>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </Layout>
  );
}
