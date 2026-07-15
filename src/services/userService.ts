import { api } from "./api";
import type { User } from "./types";

export async function getUser(id: string): Promise<User> {
  const { data } = await api.get<User>(`/api/users/${id}`);
  return data;
}

export async function updateUser(id: string, patch: Partial<User> & { password?: string }): Promise<User> {
  const { data } = await api.patch<User>(`/api/users/${id}`, patch);
  return data;
}
