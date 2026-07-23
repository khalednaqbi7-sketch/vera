import { buyerGet, buyerPost } from './client';
import type { Notification } from '../types';

export async function getNotifications(params?: {
  page?: number;
  limit?: number;
  isRead?: boolean;
}): Promise<{ notifications: Notification[]; total: number; unreadCount: number }> {
  return buyerGet('/api/buyer/notifications', params as Record<string, unknown>);
}

export async function markNotificationRead(id: string): Promise<{ message: string }> {
  return buyerPost(`/api/buyer/notifications/${id}/read`, {});
}

export async function markAllNotificationsRead(): Promise<{ message: string }> {
  return buyerPost('/api/buyer/notifications/read-all', {});
}
