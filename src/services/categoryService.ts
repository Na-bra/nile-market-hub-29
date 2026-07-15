import { api } from "./api";
import type { Category } from "./types";

export async function listCategories(): Promise<Category[]> {
  const { data } = await api.get<Category[]>("/api/categories");
  return data;
}

export async function getCategory(id: string): Promise<Category> {
  const { data } = await api.get<Category>(`/api/categories/${id}`);
  return data;
}
