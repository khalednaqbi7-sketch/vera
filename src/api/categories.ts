import { publicGet } from './client';
import type { Category, Service } from '../types';

export async function getCategories(): Promise<Category[]> {
  return publicGet<Category[]>('/api/public/categories');
}

export async function getCategoryById(id: string): Promise<Category> {
  return publicGet<Category>(`/api/public/categories/${id}`);
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
  return publicGet(`/api/services`, { categoryId, ...params });
}
