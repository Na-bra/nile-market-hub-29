import { api } from "./api";
import type { Product } from "./types";

export async function listFavorites(): Promise<Product[]> {
  const { data } = await api.get<Product[] | { favorites: Product[] }>("/api/favorites");
  return Array.isArray(data) ? data : (data.favorites ?? []);
}

export async function addFavorite(productId: string): Promise<void> {
  await api.post("/api/favorites", { productId });
}

export async function removeFavorite(productId: string): Promise<void> {
  await api.delete(`/api/favorites/${productId}`);
}
