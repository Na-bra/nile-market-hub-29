import { api } from "./api";
import type { SellerProfile } from "./types";

export async function getSeller(sellerId: string): Promise<SellerProfile> {
  const { data } = await api.get<{ success: boolean; data: SellerProfile }>(
    `/api/sellers/${sellerId}`,
  );
  return data.data;
}
