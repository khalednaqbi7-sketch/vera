import { publicGet } from './client';
import type { HomePageData, Banner, Service } from '../types';

export async function getHomePageData(): Promise<HomePageData> {
  return publicGet<HomePageData>('/api/home-page');
}

export async function getBanners(): Promise<Banner[]> {
  return publicGet<Banner[]>('/api/banners');
}

export async function getFeaturedServices(limit = 10): Promise<Service[]> {
  return publicGet<Service[]>('/api/services/featured', { limit });
}

export async function getPopularServices(limit = 10): Promise<Service[]> {
  return publicGet<Service[]>('/api/services/popular', { limit });
}

export async function getMostViewedServices(limit = 10): Promise<Service[]> {
  return publicGet<Service[]>('/api/services/most-viewed', { limit });
}

export async function getBestSellingServices(limit = 10): Promise<Service[]> {
  return publicGet<Service[]>('/api/services/best-selling', { limit });
}
