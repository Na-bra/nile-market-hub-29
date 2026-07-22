import axios from "axios";

/**
 * Map raw backend/network errors into short, friendly, user-facing messages.
 *
 * The backend is the source of truth — this only cleans up shapes users
 * shouldn't see (Mongoose validator names, cast errors, unique-constraint
 * dumps). Unknown errors fall through to the backend's own `message`.
 */

const KNOWN_FIELD_LABELS: Record<string, string> = {
  passwordHash: "Password",
  password: "Password",
  email: "Email",
  matricNumber: "Matric number",
  fullName: "Full name",
  phoneNumber: "Phone number",
  whatsappNumber: "WhatsApp number",
  department: "Department",
  title: "Title",
  price: "Price",
  description: "Description",
  category: "Category",
  condition: "Condition",
  images: "Images",
};

export function friendlyFieldLabel(field: string): string {
  if (KNOWN_FIELD_LABELS[field]) return KNOWN_FIELD_LABELS[field];
  return field
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (c) => c.toUpperCase())
    .trim();
}

function cleanMessage(raw: string): string {
  const s = raw.trim();
  // Mongoose validator dumps: "User validation failed: passwordHash: Password must contain..."
  const validation = s.match(/validation failed:\s*(.+)$/i);
  if (validation) {
    const parts = validation[1]
      .split(/,\s*/)
      .map((p) => {
        const m = p.match(/^([A-Za-z_][\w.]*)\s*:\s*(.+)$/);
        return m ? m[2].trim() : p.trim();
      })
      .filter(Boolean);
    if (parts.length) return parts[0];
  }
  // Duplicate key: E11000 duplicate key error ... { email: "x@y" }
  if (/E11000|duplicate key/i.test(s)) {
    const field = s.match(/index:\s*(\w+)/i)?.[1] ?? s.match(/\{\s*([\w.]+)\s*:/)?.[1];
    if (field) {
      const leaf = field.split(/[._]/)[0];
      return `That ${friendlyFieldLabel(leaf).toLowerCase()} is already in use.`;
    }
    return "That value is already in use.";
  }
  // Cast errors: "Cast to ObjectId failed for value ..."
  if (/Cast to \w+ failed/i.test(s)) {
    return "One of the values is invalid.";
  }
  // Strip leading model prefixes like "passwordHash: "
  const prefixed = s.match(/^([A-Za-z_][\w]*)\s*:\s*(.+)$/);
  if (prefixed && KNOWN_FIELD_LABELS[prefixed[1]]) {
    return prefixed[2];
  }
  return s;
}

export function mapBackendError(err: unknown): string {
  if (!err) return "Something went wrong. Please try again.";

  if (axios.isAxiosError(err)) {
    if (!err.response) {
      return "Can't reach the server. Check your connection and try again.";
    }
    const status = err.response.status;
    const data = err.response.data as unknown;

    if (data && typeof data === "object") {
      const d = data as Record<string, unknown>;
      if (typeof d.message === "string" && d.message) return cleanMessage(d.message);
      if (typeof d.error === "string" && d.error) return cleanMessage(d.error);
      if (Array.isArray(d.errors) && d.errors.length) {
        const first = d.errors[0] as Record<string, unknown>;
        const msg =
          (typeof first?.msg === "string" && first.msg) ||
          (typeof first?.message === "string" && first.message) ||
          null;
        if (msg) return cleanMessage(msg);
      }
      if (d.errors && typeof d.errors === "object") {
        const first = Object.values(d.errors)[0];
        const msg = Array.isArray(first) ? first[0] : first;
        if (typeof msg === "string") return cleanMessage(msg);
      }
    } else if (typeof data === "string" && data) {
      return cleanMessage(data);
    }

    if (status === 401) return "Your session has expired. Please sign in again.";
    if (status === 403) return "You don't have permission to do that.";
    if (status === 404) return "We couldn't find what you were looking for.";
    if (status === 409) return "That action conflicts with the current state.";
    if (status === 429) return "Too many requests — please slow down and try again.";
    if (status >= 500) return "Something went wrong on our end. Please try again shortly.";
    return "Request failed. Please try again.";
  }

  if (err instanceof Error) return cleanMessage(err.message);
  return "Something went wrong. Please try again.";
}
