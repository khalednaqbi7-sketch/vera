import { publicGet } from './client';
import type { SearchResult } from '../types';

export async function search(
  query: string,
  params?: {
    page?: number;
    limit?: number;
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
    country?: string;
    sort?: string;
  }
): Promise<SearchResult> {
  return publicGet<SearchResult>('/api/search', { q: query, ...params } as Record<string, unknown>);
}

export async function smartSearch(query: string): Promise<SearchResult> {
  return publicGet<SearchResult>('/api/search/smart', { q: query });
}

export async function getSearchSuggestions(query: string): Promise<string[]> {
  return publicGet<string[]>('/api/search/suggestions', { q: query });
}
