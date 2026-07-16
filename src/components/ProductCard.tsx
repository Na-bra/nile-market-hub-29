import { Link } from "@tanstack/react-router";
import type { Product } from "../services/types";

function formatPrice(n: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(n);
}

export function ModerationBadge({ status }: { status?: Product["moderationStatus"] }) {
  if (!status) return null;
  const styles: Record<string, string> = {
    pending: "bg-amber-100 text-amber-800",
    approved: "bg-emerald-100 text-emerald-800",
    rejected: "bg-rose-100 text-rose-800",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${styles[status] ?? "bg-muted text-muted-foreground"}`}
    >
      {status}
    </span>
  );
}

export function StatusBadge({ status }: { status?: Product["status"] }) {
  if (!status) return null;
  const styles: Record<string, string> = {
    Available: "bg-emerald-500/15 text-emerald-700",
    Reserved: "bg-blue-500/15 text-blue-700",
    Sold: "bg-muted text-muted-foreground",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${styles[status] ?? "bg-muted text-muted-foreground"}`}
    >
      {status}
    </span>
  );
}

export function ProductCard({
  product,
  showModeration = false,
}: {
  product: Product;
  showModeration?: boolean;
}) {
  const image = product.images?.[0];
  return (
    <Link
      to="/products/$id"
      params={{ id: product._id }}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
        {image ? (
          <img
            src={image}
            alt={product.title}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No image
          </div>
        )}
        <div className="absolute left-2 top-2 flex flex-wrap gap-1">
          <StatusBadge status={product.status} />
          {showModeration && <ModerationBadge status={product.moderationStatus} />}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <h3 className="line-clamp-1 text-sm font-semibold text-foreground">{product.title}</h3>
        <p className="line-clamp-2 text-xs text-muted-foreground">{product.description}</p>
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-base font-bold text-foreground">{formatPrice(product.price)}</span>
          <span className="text-xs capitalize text-muted-foreground">{product.condition}</span>
        </div>
      </div>
    </Link>
  );
}

export { formatPrice };
