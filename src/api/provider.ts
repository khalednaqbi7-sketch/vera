import { providerGet, providerPost, providerPut } from './client';
import type {
  ProviderDashboard,
  ProviderEarnings,
  Service,
  Order,
  ProviderUser,
} from '../types';

// ─── Dashboard ────────────────────────────────────────────────────────────────
export async function getProviderDashboard(): Promise<ProviderDashboard> {
  return providerGet<ProviderDashboard>('/api/provider/dashboard');
}

// ─── Services ─────────────────────────────────────────────────────────────────
export async function getProviderServices(params?: {
  page?: number;
  limit?: number;
  status?: string;
}): Promise<{ services: Service[]; total: number }> {
  return providerGet('/api/provider/services', params as Record<string, unknown>);
}

export async function createProviderService(data: Partial<Service>): Promise<Service> {
  return providerPost<Service>('/api/provider/services', data);
}

export async function updateProviderService(id: string, data: Partial<Service>): Promise<Service> {
  return providerPut<Service>(`/api/provider/services/${id}`, data);
}

// ─── Orders ───────────────────────────────────────────────────────────────────
export async function getProviderOrders(params?: {
  page?: number;
  limit?: number;
  status?: string;
}): Promise<{ orders: Order[]; total: number }> {
  return providerGet('/api/provider/orders', params as Record<string, unknown>);
}

export async function updateOrderStatus(orderId: string, status: string): Promise<{ message: string }> {
  return providerPut(`/api/provider/orders/${orderId}/status`, { status });
}

// ─── Earnings ─────────────────────────────────────────────────────────────────
export async function getProviderEarnings(): Promise<ProviderEarnings> {
  return providerGet<ProviderEarnings>('/api/provider/earnings');
}

export async function requestPayout(amount: number): Promise<{ message: string }> {
  return providerPost('/api/provider/payouts/request', { amount });
}

// ─── Profile ──────────────────────────────────────────────────────────────────
export async function getProviderProfile(): Promise<ProviderUser> {
  return providerGet<ProviderUser>('/api/provider/profile');
}

export async function updateProviderProfile(data: Partial<ProviderUser>): Promise<ProviderUser> {
  return providerPut<ProviderUser>('/api/provider/profile', data);
}

// ─── Subscription ─────────────────────────────────────────────────────────────
export async function getSubscriptionPlans(): Promise<{
  id: string;
  name: string;
  price: number;
  features: string[];
}[]> {
  return providerGet('/api/provider/subscription/plans');
}

export async function subscribeToplan(planId: string): Promise<{
  paymentUrl?: string;
  message?: string;
}> {
  return providerPost('/api/provider/subscription/subscribe', { planId });
}
