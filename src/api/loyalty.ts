import { buyerGet, buyerPost } from './client';
import type { LoyaltyInfo } from '../types';

export async function getLoyaltyInfo(): Promise<LoyaltyInfo> {
  return buyerGet<LoyaltyInfo>('/api/buyer/loyalty');
}

export async function redeemLoyaltyPoints(points: number): Promise<{
  message: string;
  discount: number;
  remainingPoints: number;
}> {
  return buyerPost('/api/buyer/loyalty/redeem', { points });
}

export async function getLoyaltyHistory(params?: {
  page?: number;
  limit?: number;
}): Promise<{ history: LoyaltyInfo['history']; total: number }> {
  return buyerGet('/api/buyer/loyalty/history', params as Record<string, unknown>);
}
