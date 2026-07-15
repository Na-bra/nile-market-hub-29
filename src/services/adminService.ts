// The backend has no dedicated /admin/* namespace. Admin actions reuse the
// standard product and report endpoints — the server authorizes based on the
// caller's role claim in the JWT.
//
// - Pending listings          -> GET  /api/products?status=... (admins see all
//                                moderation states; students only see approved)
// - Approve / reject listing  -> PATCH /api/products/{id} with
//                                { moderationStatus, moderationReason }
// - List reports              -> GET  /api/reports
// - Resolve report            -> PATCH /api/reports/{id}/status
//
// TODO(backend): there is no dedicated endpoint that filters products by
// moderationStatus (e.g. ?moderationStatus=pending). Admins currently fetch
// all products and filter client-side. Expose a moderation filter if
// server-side filtering is desired.

import { listProducts, updateProduct } from "./productService";
import { listAllReports, updateReportStatus } from "./reportService";
import type { ModerationStatus } from "./types";

export async function listListingsForModeration(moderationStatus?: ModerationStatus) {
  // Fetch a wide page; the backend does not expose moderationStatus as a query param.
  const res = await listProducts({ limit: 100 });
  if (!moderationStatus) return res.products;
  return res.products.filter((p) => p.moderationStatus === moderationStatus);
}

export function approveListing(id: string) {
  return updateProduct(id, { moderationStatus: "approved" });
}

export function rejectListing(id: string, reason: string) {
  return updateProduct(id, { moderationStatus: "rejected", moderationReason: reason });
}

export { listAllReports, updateReportStatus };
