import { publicGet, buyerGet, buyerPost, buyerDelete } from './client';
import type { Service, Review } from '../types';

// ─── Map raw service from public API ─────────────────────────────────────────
function mapService(raw: any): Service {
  return {
    id: String(raw.id),
    title: raw.title ?? '',
    description: raw.description,
    price: Number(raw.price ?? 0),
    currency: raw.currency ?? 'AED',
    images: raw.gallery ?? (raw.image_url ? [raw.image_url] : []),
    image: raw.image_url ? `https://veraapp.app${raw.image_url}` : raw.image,
    rating: Number(raw.rating ?? 0),
    reviewsCount: raw.review_count ?? raw.reviewCount ?? 0,
    isAvailable: raw.is_active ?? true,
    isFeatured: raw.is_featured ?? false,
    deliveryTime: raw.deliveryTime,
    location: raw.provider_city ?? raw.location,
    provider: raw.provider_name
      ? {
          id: String(raw.provider_id ?? ''),
          name: raw.provider_name,
          avatar: raw.provider_avatar ? `https://veraapp.app${raw.provider_avatar}` : undefined,
          isVerified: raw.provider_verified ?? false,
          city: raw.provider_city,
        }
      : undefined,
    viewsCount: raw.view_count,
    ordersCount: raw.order_count,
    badge: raw.badge,
  } as Service;
}

function mapDetailService(raw: any): Service {
  return {
    id: String(raw.id),
    title: raw.title ?? '',
    description: raw.description,
    price: Number(raw.price ?? 0),
    currency: raw.currency ?? 'AED',
    images: raw.gallery ?? [],
    image: raw.image,
    rating: Number(raw.rating ?? 0),
    reviewsCount: raw.reviewCount ?? 0,
    isAvailable: true,
    isFeatured: raw.isFeatured ?? false,
    deliveryTime: raw.deliveryTime,
    location: raw.location,
    provider: raw.providerName
      ? {
          id: String(raw.providerId ?? ''),
          name: raw.providerName ?? '',
          avatar: raw.providerAvatar,
          rating: Number(raw.providerRating ?? 0),
          reviewsCount: raw.providerReviewCount ?? 0,
          isVerified: raw.providerVerified ?? false,
          city: raw.providerCity,
          bio: raw.providerBio,
        }
      : undefined,
    tags: raw.tags ?? [],
  } as Service;
}

// ─── Services List ────────────────────────────────────────────────────────────
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
  const data = await publicGet<any>('/api/public/services', params as Record<string, unknown>);
  const services = (data?.services ?? data ?? []).map(mapService);
  return {
    services,
    total: data?.total ?? services.length,
    page: data?.page ?? 1,
    totalPages: data?.totalPages ?? 1,
  };
}

export async function getServiceById(id: string): Promise<Service> {
  const data = await publicGet<any>(`/api/services/${id}`);
  // Backend returns { service: {...}, reviews: [...], related: [...] }
  const raw = data?.service ?? data;
  return mapDetailService(raw);
}

export async function getServiceReviews(
  serviceId: string,
  page = 1,
  limit = 10
): Promise<{ reviews: Review[]; total: number; averageRating: number }> {
  const data = await publicGet<any>(`/api/reviews/${serviceId}`, { page, limit });
  return {
    reviews: data?.reviews ?? data ?? [],
    total: data?.total ?? 0,
    averageRating: data?.averageRating ?? 0,
  };
}

// ─── Wishlist ─────────────────────────────────────────────────────────────────
export async function getWishlist(): Promise<Service[]> {
  const data = await buyerGet<any>('/api/buyer/wishlist');
  return (data?.items ?? data?.services ?? data ?? []).map(mapService);
}

export async function addToWishlist(serviceId: string): Promise<{ message: string }> {
  return buyerPost('/api/buyer/wishlist', { serviceId });
}

export async function removeFromWishlist(serviceId: string): Promise<{ message: string }> {
  return buyerDelete(`/api/buyer/wishlist/${serviceId}`);
}
