import { api } from "./api";
import type { Review } from "./types";

export async function createReview(input: {
  sellerId: string;
  rating: number;
  comment?: string;
}): Promise<Review> {
  const { data } = await api.post<Review>("/api/reviews", input);
  return data;
}

export async function listSellerReviews(userId: string): Promise<Review[]> {
  const { data } = await api.get<Review[]>(`/api/reviews/user/${userId}`);
  return data;
}

export async function getSellerReviewStats(
  userId: string,
): Promise<{ averageRating: number; reviewCount: number }> {
  const { data } = await api.get<{ averageRating: number; reviewCount: number }>(
    `/api/reviews/stats/${userId}`,
  );
  return data;
}
