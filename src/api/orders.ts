import { buyerGet, buyerPost } from './client';
import type { Order, PaymentInitRequest, PaymentInitResponse } from '../types';

export async function getOrders(params?: {
  page?: number;
  limit?: number;
  status?: string;
}): Promise<{ orders: Order[]; total: number; page: number; totalPages: number }> {
  return buyerGet('/api/buyer/orders', params as Record<string, unknown>);
}

export async function getOrderById(id: string): Promise<Order> {
  return buyerGet<Order>(`/api/buyer/orders/${id}`);
}

export async function createOrder(data: {
  cartId?: string;
  items?: { serviceId: string; quantity: number; notes?: string }[];
  paymentMethod: string;
  promoCode?: string;
  address?: string;
  notes?: string;
}): Promise<Order> {
  return buyerPost<Order>('/api/buyer/orders', data);
}

export async function cancelOrder(orderId: string, reason?: string): Promise<{ message: string }> {
  return buyerPost(`/api/buyer/orders/${orderId}/cancel`, { reason });
}

export async function rateOrder(orderId: string, data: {
  rating: number;
  review?: string;
}): Promise<{ message: string }> {
  return buyerPost(`/api/buyer/orders/${orderId}/review`, data);
}

// ─── Payment ──────────────────────────────────────────────────────────────────
export async function initPayment(data: PaymentInitRequest): Promise<PaymentInitResponse> {
  return buyerPost<PaymentInitResponse>('/api/payments/init', data);
}

export async function verifyPayment(paymentId: string): Promise<{ status: string; orderId?: string }> {
  return buyerPost(`/api/payments/verify`, { paymentId });
}
