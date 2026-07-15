// Types mirror the backend schemas defined in the OpenAPI spec.
// Do NOT add fields the backend does not return.

export interface User {
  _id: string;
  fullName: string;
  email: string;
  matricNumber?: string;
  department?: string;
  level?: string;
  phoneNumber?: string;
  whatsappNumber?: string;
  profileImage?: string;
  role?: string; // e.g. "student", "admin" — observed in login response
}

export type ProductStatus = "Available" | "Reserved" | "Sold";
export type ModerationStatus = "pending" | "approved" | "rejected";

export interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  categoryId: string;
  condition: string;
  images: string[];
  sellerId: string;
  status: ProductStatus;
  moderationStatus?: ModerationStatus;
  moderationReason?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  _id: string;
  name: string;
  description?: string;
}

export interface Favorite {
  _id: string;
  userId: string;
  productId: string | Product;
}

export interface Review {
  _id: string;
  sellerId: string;
  reviewerId: string | User;
  rating: number;
  comment?: string;
  createdAt?: string;
}

export type ReportTargetType = "product" | "user" | "review";
export type ReportReason =
  | "Spam"
  | "Fraud"
  | "Fake Item"
  | "Harassment"
  | "Inappropriate Content"
  | "Other";
export type ReportStatus = "Pending" | "Under Review" | "Resolved" | "Rejected";

export interface Report {
  _id: string;
  reporterId: string | User;
  targetType: ReportTargetType;
  targetId: string;
  reason: ReportReason;
  description?: string;
  status: ReportStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt?: string;
}

export interface SellerProfile {
  seller: {
    _id: string;
    fullName: string;
    profileImage?: string;
    department?: string;
    level?: string;
    averageRating: number;
    reviewCount: number;
  };
  products: Product[];
}

export interface ProductListResponse {
  success: boolean;
  products: Product[];
  count: number;
  currentPage: number;
  totalPages: number;
  totalProducts: number;
}
