import { buyerGet, buyerPost } from './client';
import type { Wallet, WalletTransaction } from '../types';

export async function getWallet(): Promise<Wallet> {
  return buyerGet<Wallet>('/api/buyer/wallet');
}

export async function getWalletTransactions(params?: {
  page?: number;
  limit?: number;
  type?: 'credit' | 'debit';
}): Promise<{ transactions: WalletTransaction[]; total: number }> {
  return buyerGet('/api/buyer/wallet/transactions', params as Record<string, unknown>);
}

export async function topUpWallet(amount: number, method: string): Promise<{
  paymentUrl?: string;
  clientSecret?: string;
  message?: string;
}> {
  return buyerPost('/api/buyer/wallet/topup', { amount, method });
}
