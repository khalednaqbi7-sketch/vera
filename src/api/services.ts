import { publicGet, buyerGet, buyerPost, buyerDelete } from './client';
import type { Service, Review } from '../types';

export async function getServices(params?: {
  page?: number;
  limit?: number;
  categoryId?: string;
  providerId?: string;
  sort?: string;
  minPrice?: number;
  maxPrice?: number;
  country?: string;
}): Promise<{ services: Service[]; total: number; page: number; totalPages: number }> {
  return publicGet('/api/services', params as Record<string, unknown>);
}

export async function getServiceById(id: string): Promise<Service> {
  return publicGet<Service>(`/api/services/${id}`);
}

export async function getServiceReviews(
  serviceId: string,
  page = 1,
  limit = 10
): Promise<{ reviews: Review[]; total: number; averageRating: number }> {
  return publicGet(`/api/reviews/${serviceId}`, { page, limit });
}

// ─── Wishlist ─────────────────────────────────────────────────────────────────
export async function getWishlist(): Promise<Service[]> {
  return buyerGet<Service[]>('/api/buyer/wishlist');
}

export async function addToWishlist(serviceId: string): Promise<{ message: string }> {
  return buyerPost('/api/buyer/wishlist', { serviceId });
}

export async function removeFromWishlist(serviceId: string): Promise<{ message: string }> {
  return buyerDelete(`/api/buyer/wishlist/${serviceId}`);
}
