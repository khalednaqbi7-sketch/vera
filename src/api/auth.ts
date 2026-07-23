import { publicClient } from './client';
import type {
  LoginRequest,
  RegisterBuyerRequest,
  RegisterProviderRequest,
  AuthResponse,
  BuyerUser,
  ProviderUser,
} from '../types';

// ─── Buyer Auth ───────────────────────────────────────────────────────────────
export async function buyerLogin(data: LoginRequest): Promise<AuthResponse> {
  const res = await publicClient.post<AuthResponse>('/api/buyer-auth/login', data);
  return res.data;
}

export async function buyerRegister(data: RegisterBuyerRequest): Promise<AuthResponse> {
  const res = await publicClient.post<AuthResponse>('/api/buyer-auth/register', data);
  return res.data;
}

export async function buyerForgotPassword(email: string): Promise<{ message: string }> {
  const res = await publicClient.post('/api/buyer-auth/forgot-password', { email });
  return res.data;
}

export async function buyerResetPassword(token: string, password: string): Promise<{ message: string }> {
  const res = await publicClient.post('/api/buyer-auth/reset-password', { token, password });
  return res.data;
}

// ─── Provider Auth ────────────────────────────────────────────────────────────
export async function providerLogin(data: LoginRequest): Promise<AuthResponse> {
  const res = await publicClient.post<AuthResponse>('/api/provider-auth/login', data);
  return res.data;
}

export async function providerRegister(data: RegisterProviderRequest): Promise<AuthResponse> {
  const res = await publicClient.post<AuthResponse>('/api/provider-auth/register', data);
  return res.data;
}

export async function providerForgotPassword(email: string): Promise<{ message: string }> {
  const res = await publicClient.post('/api/provider-auth/forgot-password', { email });
  return res.data;
}
