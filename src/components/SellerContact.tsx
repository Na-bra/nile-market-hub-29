import { useCallback, useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { getSeller } from "../services/sellerService";
import { getUser } from "../services/userService";
import { extractError } from "../services/api";
import { formatPrice } from "./ProductCard";

// Validates a WhatsApp number: 7–15 digits, optional leading +.
function isValidWhatsapp(raw: unknown): raw is string {
  if (typeof raw !== "string") return false;
  const trimmed = raw.trim();
  if (!trimmed) return false;
  const digits = trimmed.replace(/[\s\-()]/g, "");
  return /^\+?\d{7,15}$/.test(digits);
}

function sanitizeWhatsapp(raw: string): string {
  let s = raw.trim().replace(/[\s\-()]/g, "");
  if (s.startsWith("+")) s = s.slice(1);
  if (s.startsWith("00")) s = s.slice(2);
  else if (s.startsWith("0")) s = s.slice(1);
  return s.replace(/\D/g, "");
}

interface Props {
  sellerId: string;
  isOwner: boolean;
  productTitle: string;
  productPrice: number;
}

type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | {
      status: "success";
      name: string;
      rating: { avg: number; count: number } | null;
      whatsapp: string | null;
      phone: string | null;
    };

export function SellerContact({ sellerId, isOwner, productTitle, productPrice }: Props) {
  const [state, setState] = useState<State>({ status: "loading" });

  const load = useCallback(() => {
    let cancelled = false;
    setState({ status: "loading" });

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 10_000);

    (async () => {
      try {
        const [sellerRes, userRes] = await Promise.allSettled([
          getSeller(sellerId),
          getUser(sellerId),
        ]);

        if (cancelled) return;

        // Require at least one to succeed.
        if (sellerRes.status === "rejected" && userRes.status === "rejected") {
          throw sellerRes.reason;
        }

        const seller = sellerRes.status === "fulfilled" ? sellerRes.value : null;
        const user = userRes.status === "fulfilled" ? userRes.value : null;

        setState({
          status: "success",
          name: seller?.seller.fullName || user?.fullName || "",
          rating: seller
            ? { avg: seller.seller.averageRating, count: seller.seller.reviewCount }
            : null,
          whatsapp: user?.whatsappNumber ?? null,
          phone: user?.phoneNumber ?? null,
        });
      } catch (err) {
        if (cancelled) return;
        setState({
          status: "error",
          message: extractError(err) || "Unable to load seller contact information.",
        });
      } finally {
        window.clearTimeout(timeout);
      }
    })().catch(() => {
      // Defensive: never let a rejection escape.
      if (!cancelled) {
        setState({
          status: "error",
          message: "Unable to load seller contact information. Please try again later.",
        });
      }
    });

    return () => {
      cancelled = true;
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [sellerId]);

  useEffect(() => load(), [load]);

  if (state.status === "loading") {
    return (
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="skeleton h-3 w-16 rounded" />
        <div className="skeleton mt-2 h-5 w-40 rounded" />
        <div className="skeleton mt-2 h-3 w-24 rounded" />
        <div className="skeleton mt-4 h-10 w-44 rounded-md" />
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div
        role="alert"
        className="rounded-lg border border-destructive/30 bg-destructive/10 p-4"
      >
        <div className="text-sm text-destructive">
          Unable to load seller contact information. Please try again later.
        </div>
        <button
          type="button"
          onClick={load}
          className="mt-3 rounded-md border border-destructive/40 px-3 py-1.5 text-sm text-destructive hover:bg-destructive/10"
        >
          Retry
        </button>
      </div>
    );
  }

  const { name, rating, whatsapp, phone } = state;
  const whatsappValid = isValidWhatsapp(whatsapp);
  const message = `Hi${name ? ` ${name}` : ""}, I'm interested in your listing "${productTitle}" (${formatPrice(productPrice)}) on Nile Market.`;
  const whatsappHref = whatsappValid
    ? `https://wa.me/${sanitizeWhatsapp(whatsapp as string)}?text=${encodeURIComponent(message)}`
    : null;

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">Seller</div>
      <Link
        to="/sellers/$sellerId"
        params={{ sellerId }}
        className="text-lg font-medium hover:underline"
      >
        {name || "View seller profile"}
      </Link>
      {rating && (
        <div className="mt-1 text-sm text-muted-foreground">
          ★ {rating.avg.toFixed(1)} · {rating.count} reviews
        </div>
      )}

      {!isOwner && (
        <div className="mt-3 flex flex-wrap gap-2">
          {whatsappHref ? (
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-md bg-[#25D366] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
            >
              <svg viewBox="0 0 32 32" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                <path d="M19.11 17.36c-.28-.14-1.65-.81-1.9-.9-.26-.1-.44-.14-.63.14-.19.28-.72.9-.88 1.08-.16.19-.32.21-.6.07-.28-.14-1.18-.43-2.25-1.38-.83-.74-1.39-1.65-1.55-1.93-.16-.28-.02-.43.12-.57.13-.13.28-.32.42-.49.14-.16.19-.28.28-.47.09-.19.05-.35-.02-.49-.07-.14-.63-1.51-.86-2.07-.23-.55-.46-.48-.63-.49h-.54c-.19 0-.49.07-.75.35-.26.28-.98.96-.98 2.34 0 1.38 1 2.71 1.14 2.9.14.19 1.97 3.01 4.78 4.22.67.29 1.19.46 1.6.59.67.21 1.28.18 1.76.11.54-.08 1.65-.67 1.89-1.32.23-.65.23-1.2.16-1.32-.07-.12-.26-.19-.54-.33Zm-5.11 6.98h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.24c0-5.44 4.43-9.87 9.88-9.87 2.64 0 5.12 1.03 6.98 2.9a9.82 9.82 0 0 1 2.89 6.98c0 5.44-4.43 9.86-9.86 9.86ZM24.09 7.9A11.8 11.8 0 0 0 14 4C7.42 4 2.07 9.35 2.07 15.93c0 2.1.55 4.15 1.59 5.96L2 28l6.28-1.64a11.9 11.9 0 0 0 5.71 1.45h.01c6.58 0 11.93-5.35 11.93-11.93 0-3.19-1.24-6.18-3.84-8.98Z" />
              </svg>
              Contact on WhatsApp
            </a>
          ) : (
            <div className="text-xs text-muted-foreground">
              This seller has not provided a WhatsApp contact.
            </div>
          )}
          {phone && (
            <a
              href={`tel:${phone}`}
              className="inline-flex items-center rounded-md border border-input px-4 py-2 text-sm hover:bg-accent"
            >
              Call {phone}
            </a>
          )}
        </div>
      )}
    </div>
  );
}
