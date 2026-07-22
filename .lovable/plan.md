# Nile Market — Frontend Refinement Plan

This is a large multi-area refresh. To keep it shippable and reviewable, I'll do it in **phases** and stop for your review after each. No backend changes, no mock data — anywhere the spec would require a missing endpoint, I'll flag it with a visible `TODO(backend)` note instead of faking data.

---

## Phase 1 — Design system + shared primitives (foundation)

Everything else reuses these, so build once.

**Tokens (`src/styles.css`)**
- Shift primary to a Facebook/Jiji-style blue scale (light + dark).
- Add semantic tokens: `--success`, `--warning`, `--info` (+ foregrounds).
- Explicit spacing scale (4/8/16/24/32), radius scale, elevation scale (`--shadow-sm/md/lg`), typography scale.

**Primitives (`src/components/ui/`)**
- `Skeleton`, `SkeletonCard`, `SkeletonRow`, `SkeletonTable`
- `EmptyState` (icon slot + title + description + CTA)
- `ConfirmModal` (title, description, confirm/cancel, danger variant)
- `Pagination` (first/prev/pages/next/last + current)
- `FormField` (label + control + inline error + hint)
- `PasswordChecklist` (live rules)
- `CategoryIcon` (frontend-only `categoryName → lucide icon` map)
- `Badge` variants (status, role, condition, category)
- `ErrorMap` helper: `mapBackendError(err) → friendly message` for known patterns (`passwordHash`, unique constraints, cast errors, network failures). Unknown errors fall back to backend `message` (never raw Mongoose text).

Toasts already use `sonner` — keep it, standardize helpers `notify.success/error/warning/info`.

---

## Phase 2 — Cross-cutting behaviors

- Replace every `window.confirm` with `ConfirmModal` (delete product, remove favourite, reject listing, resolve report, promote user).
- Replace all `"Loading..."` text with skeletons shaped like the target content.
- Add `EmptyState` to every list route (browse, favorites, my listings, reports, admin listings/reports/users).
- Route all mutation feedback through `notify.*` + `mapBackendError`.
- Accessibility pass: labels on all inputs, visible focus rings, `aria-label` on icon-only buttons, keyboard-reachable dropdowns/menus.
- Responsive pass: mobile drawer nav in `Header`, tables → stacked cards under `md`.

---

## Phase 3 — Page-by-page

- **Create/Edit Listing**: sectioned cards (Basic / Pricing / Category / Condition / Images). New `ImageUploader` with drag-drop, click-to-upload, multi-select, thumbnail grid, per-image remove, per-image upload progress, friendly file-type/size errors.
- **Categories**: chips/cards with `CategoryIcon`, active state, horizontal scroll on mobile.
- **ProductCard**: larger image, prominent price, category + condition badges, favourite toggle, cleaner seller row (avatar + name).
- **Browse — search & filters**: large search bar, filter drawer on mobile / sticky panel on desktop, sort dropdown, **active filter chips** with removable ×.
- **Profile**: split into Profile picture / Edit info / My listings / My favourites / My reviews sections. `TODO(backend)` on avatar upload if no endpoint exists.
- **Admin overview**: keep, restyle with new tokens + status badges.
- **Admin — Listings & Reports**: modern table, skeletons, empty state, `ConfirmModal` on destructive actions.
- **Admin — Users (new/expanded)**: paginated table (avatar, name, email, matric, role, status, joined), search by name/email/matric, role badges, **Promote** action gated by `ConfirmModal`, disabled for existing admins. Uses only existing endpoints; if a list-users endpoint doesn't exist, keep the lookup-by-id fallback already in place and mark the table area with a visible `TODO(backend): needs GET /api/users` note rather than mocking rows.
- **Error pages**: `notFoundComponent` on `__root` (404) + friendly 403/500 components rendered by route/query error boundaries. Icon + plain-language message + "Go home" button.

---

## Technical notes

- All colors go through semantic tokens — no hardcoded `text-white` / `bg-blue-500` in components.
- No new files under `src/routes/` that duplicate `/`.
- `mapBackendError` is a plain function in `src/lib/errors.ts`, consumed by existing `useFormErrors` and toast helpers.
- New primitives live in `src/components/ui/` so they're obviously shared.

---

## Suggested order of delivery (one message per phase)

1. Phase 1 — tokens + primitives + error map.
2. Phase 2 — cross-cutting swap-ins across existing pages.
3. Phase 3a — Create/Edit listing + ProductCard + Categories + Browse filters.
4. Phase 3b — Profile + Admin (overview, listings, reports, users) + error pages.

Approve and I'll start with **Phase 1**. If you'd rather I compress phases or reorder (e.g. do admin users first), tell me now.
