import { api } from "./api";
import type { Product, ProductListResponse } from "./types";

export interface ProductQuery {
  search?: string;
  category?: string;
  status?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}

export async function listProducts(q: ProductQuery = {}): Promise<ProductListResponse> {
  const { data } = await api.get<ProductListResponse>("/api/products", { params: q });
  return data;
}

export async function getProduct(id: string): Promise<Product> {
  const { data } = await api.get<Product | { product: Product; success?: boolean }>(
    `/api/products/${id}`,
  );
  // Backend returns the product object directly in observed responses; accept either shape.
  return (data as { product?: Product }).product ?? (data as Product);
}

/** Create requires multipart because the backend uploads images to Cloudinary. */
export async function createProduct(input: {
  title: string;
  description: string;
  price: number;
  categoryId: string;
  condition: string;
  images: File[];
}): Promise<Product> {
  const fd = new FormData();
  fd.append("title", input.title);
  fd.append("description", input.description);
  fd.append("price", String(input.price));
  fd.append("categoryId", input.categoryId);
  fd.append("condition", input.condition);
  for (const f of input.images) fd.append("images", f);
  const { data } = await api.post<Product | { product: Product }>("/api/products", fd);
  return (data as { product?: Product }).product ?? (data as Product);
}

export async function updateProduct(
  id: string,
  input: Partial<{
    title: string;
    description: string;
    price: number;
    categoryId: string;
    condition: string;
    status: string;
    images: File[];
    moderationStatus: "approved" | "rejected";
    moderationReason: string;
  }>,
): Promise<Product> {
  const fd = new FormData();
  for (const [k, v] of Object.entries(input)) {
    if (v === undefined) continue;
    if (k === "images" && Array.isArray(v)) {
      for (const f of v as File[]) fd.append("images", f);
    } else {
      fd.append(k, String(v));
    }
  }
  const { data } = await api.patch<Product | { product: Product }>(`/api/products/${id}`, fd);
  return (data as { product?: Product }).product ?? (data as Product);
}

export async function deleteProduct(id: string): Promise<void> {
  await api.delete(`/api/products/${id}`);
}
