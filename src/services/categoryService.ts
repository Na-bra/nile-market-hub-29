import { api } from "./api";
import type { Category } from "./types";

/** The backend may return a bare array or wrap it ({ categories } / { data }). */
function toCategoryArray(data: unknown): Category[] {
  if (Array.isArray(data)) return data as Category[];
  if (data && typeof data === "object") {
    const d = data as Record<string, unknown>;
    for (const key of ["categories", "data", "results", "items"]) {
      if (Array.isArray(d[key])) return d[key] as Category[];
    }
  }
  return [];
}

export async function listCategories(): Promise<Category[]> {
  const { data } = await api.get<unknown>("/api/categories");
  return toCategoryArray(data);
}

export async function getCategory(id: string): Promise<Category> {
  const { data } = await api.get<Category | { category: Category }>(`/api/categories/${id}`);
  return (data as { category?: Category }).category ?? (data as Category);
}
