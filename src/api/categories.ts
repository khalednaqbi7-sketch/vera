import { publicGet } from './client';
import type { Category, Service } from '../types';

function mapCategory(raw: any): Category {
  return {
    id: String(raw.id),
    name: raw.label ?? raw.name ?? raw.label_ar ?? '',
    nameAr: raw.label_ar ?? raw.nameAr,
    icon: raw.icon,
    image: raw.logo_url ? `https://veraapp.app${raw.logo_url}` : raw.image,
    color: raw.color_class ?? raw.color,
    servicesCount: raw.count ?? raw.servicesCount,
    slug: raw.slug ?? String(raw.id),
  };
}

function mapService(raw: any): Service {
  return {
    id: String(raw.id),
    title: raw.title ?? '',
    description: raw.description,
    price: Number(raw.price ?? 0),
    currency: raw.currency ?? 'AED',
    images: raw.gallery ?? (raw.image_url ? [`https://veraapp.app${raw.image_url}`] : []),
    image: raw.image_url ? `https://veraapp.app${raw.image_url}` : raw.image,
    rating: Number(raw.rating ?? 0),
    reviewsCount: raw.review_count ?? raw.reviewCount ?? 0,
    isAvailable: raw.is_active ?? true,
    isFeatured: raw.is_featured ?? false,
    provider: raw.provider_name
      ? {
          id: String(raw.provider_id ?? ''),
          name: raw.provider_name,
          avatar: raw.provider_avatar ? `https://veraapp.app${raw.provider_avatar}` : undefined,
          isVerified: raw.provider_verified ?? false,
        }
      : undefined,
    badge: raw.badge,
  } as Service;
}

export async function getCategories(): Promise<Category[]> {
  const data = await publicGet<any>('/api/public/categories');
  const list = data?.categories ?? data ?? [];
  return list.map(mapCategory);
}

export async function getCategoryById(id: string): Promise<Category> {
  const data = await publicGet<any>(`/api/public/categories/${id}`);
  return mapCategory(data?.category ?? data);
}

export async function getServicesByCategory(
  categoryId: string,
  params?: {
    page?: number;
    limit?: number;
    sort?: string;
    minPrice?: number;
    maxPrice?: number;
  }
): Promise<{ services: Service[]; total: number; page: number; totalPages: number }> {
  const data = await publicGet<any>('/api/public/services', {
    categoryId,
    ...(params as Record<string, unknown>),
  });
  const services = (data?.services ?? data ?? []).map(mapService);
  return {
    services,
    total: data?.total ?? services.length,
    page: data?.page ?? 1,
    totalPages: data?.totalPages ?? 1,
  };
}
