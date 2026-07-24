import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  saveBuyerToken,
  saveProviderToken,
  clearBuyerToken,
  clearProviderToken,
  getBuyerToken,
  getProviderToken,
  buyerClient,
  providerClient,
} from '../api/client';
import type { BuyerUser, ProviderUser } from '../types';

interface AuthState {
  buyerToken: string | null;
  buyerUser: BuyerUser | null;
  providerToken: string | null;
  providerUser: ProviderUser | null;
  mode: 'buyer' | 'provider' | null;
  isLoading: boolean;

  loginAsBuyer: (token: string, user: BuyerUser) => Promise<void>;
  loginAsProvider: (token: string, user: ProviderUser) => Promise<void>;
  logoutBuyer: () => Promise<void>;
  logoutProvider: () => Promise<void>;
  logoutAll: () => Promise<void>;
  switchMode: (mode: 'buyer' | 'provider') => void;
  updateBuyerUser: (user: Partial<BuyerUser>) => void;
  updateProviderUser: (user: Partial<ProviderUser>) => void;
  hydrateFromStorage: () => Promise<void>;
}

const BUYER_USER_KEY = 'vera_buyer_user';
const PROVIDER_USER_KEY = 'vera_provider_user';
const MODE_KEY = 'vera_mode';

// ─── Session Verification ─────────────────────────────────────────────────────
// When the stored token is 'via-cookie', the session relies on the native
// cookie jar which may not survive app restarts on Android.
// We verify the session by pinging /me — if it fails with 401, we clear it.
async function verifyBuyerSession(token: string): Promise<{ valid: boolean; user?: BuyerUser }> {
  if (!token) return { valid: false };
  // Real JWT — trust it; the 401 interceptor will handle expiry
  if (token.startsWith('eyJ')) return { valid: true };
  // Cookie-based session — must verify on each cold start
  try {
    const res = await buyerClient.get<any>('/api/buyer-auth/me');
    const user = res.data?.buyer ?? res.data?.user ?? res.data ?? null;
    return { valid: true, user };
  } catch {
    return { valid: false };
  }
}

async function verifyProviderSession(token: string): Promise<{ valid: boolean; user?: ProviderUser }> {
  if (!token) return { valid: false };
  if (token.startsWith('eyJ')) return { valid: true };
  try {
    const res = await providerClient.get<any>('/api/provider-auth/me');
    const user = res.data?.provider ?? res.data?.user ?? res.data ?? null;
    return { valid: true, user };
  } catch {
    return { valid: false };
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  buyerToken: null,
  buyerUser: null,
  providerToken: null,
  providerUser: null,
  mode: null,
  isLoading: true,

  loginAsBuyer: async (token, user) => {
    await saveBuyerToken(token);
    await AsyncStorage.setItem(BUYER_USER_KEY, JSON.stringify(user));
    await AsyncStorage.setItem(MODE_KEY, 'buyer');
    set({ buyerToken: token, buyerUser: user, mode: 'buyer' });
  },

  loginAsProvider: async (token, user) => {
    await saveProviderToken(token);
    await AsyncStorage.setItem(PROVIDER_USER_KEY, JSON.stringify(user));
    await AsyncStorage.setItem(MODE_KEY, 'provider');
    set({ providerToken: token, providerUser: user, mode: 'provider' });
  },

  logoutBuyer: async () => {
    await clearBuyerToken();
    await AsyncStorage.removeItem(BUYER_USER_KEY);
    const currentMode = get().mode;
    const newMode = currentMode === 'buyer' ? (get().providerToken ? 'provider' : null) : currentMode;
    if (newMode) await AsyncStorage.setItem(MODE_KEY, newMode);
    else await AsyncStorage.removeItem(MODE_KEY);
    set({ buyerToken: null, buyerUser: null, mode: newMode });
  },

  logoutProvider: async () => {
    await clearProviderToken();
    await AsyncStorage.removeItem(PROVIDER_USER_KEY);
    const currentMode = get().mode;
    const newMode = currentMode === 'provider' ? (get().buyerToken ? 'buyer' : null) : currentMode;
    if (newMode) await AsyncStorage.setItem(MODE_KEY, newMode);
    else await AsyncStorage.removeItem(MODE_KEY);
    set({ providerToken: null, providerUser: null, mode: newMode });
  },

  logoutAll: async () => {
    await clearBuyerToken();
    await clearProviderToken();
    await AsyncStorage.multiRemove([BUYER_USER_KEY, PROVIDER_USER_KEY, MODE_KEY]);
    set({ buyerToken: null, buyerUser: null, providerToken: null, providerUser: null, mode: null });
  },

  switchMode: (mode) => {
    AsyncStorage.setItem(MODE_KEY, mode);
    set({ mode });
  },

  updateBuyerUser: (user) => {
    const current = get().buyerUser;
    if (!current) return;
    const updated = { ...current, ...user };
    AsyncStorage.setItem(BUYER_USER_KEY, JSON.stringify(updated));
    set({ buyerUser: updated });
  },

  updateProviderUser: (user) => {
    const current = get().providerUser;
    if (!current) return;
    const updated = { ...current, ...user };
    AsyncStorage.setItem(PROVIDER_USER_KEY, JSON.stringify(updated));
    set({ providerUser: updated });
  },

  hydrateFromStorage: async () => {
    try {
      const [rawBuyerToken, rawProviderToken, buyerUserStr, providerUserStr, mode] = await Promise.all([
        getBuyerToken(),
        getProviderToken(),
        AsyncStorage.getItem(BUYER_USER_KEY),
        AsyncStorage.getItem(PROVIDER_USER_KEY),
        AsyncStorage.getItem(MODE_KEY),
      ]);

      let buyerToken = rawBuyerToken;
      let buyerUser: BuyerUser | null = buyerUserStr ? JSON.parse(buyerUserStr) : null;
      let providerToken = rawProviderToken;
      let providerUser: ProviderUser | null = providerUserStr ? JSON.parse(providerUserStr) : null;

      // Verify cookie-based sessions on cold start because native cookie
      // persistence is not consistent across Android app restarts.
      const [buyerCheck, providerCheck] = await Promise.all([
        buyerToken ? verifyBuyerSession(buyerToken) : Promise.resolve({ valid: false }),
        providerToken ? verifyProviderSession(providerToken) : Promise.resolve({ valid: false }),
      ]);

      if (buyerToken && !buyerCheck.valid) {
        await clearBuyerToken();
        await AsyncStorage.removeItem(BUYER_USER_KEY);
        buyerToken = null;
        buyerUser = null;
      } else if (buyerCheck.user) {
        // Update cached user data with fresh data from server
        buyerUser = buyerCheck.user;
        await AsyncStorage.setItem(BUYER_USER_KEY, JSON.stringify(buyerUser));
      }

      if (providerToken && !providerCheck.valid) {
        await clearProviderToken();
        await AsyncStorage.removeItem(PROVIDER_USER_KEY);
        providerToken = null;
        providerUser = null;
      } else if (providerCheck.user) {
        providerUser = providerCheck.user;
        await AsyncStorage.setItem(PROVIDER_USER_KEY, JSON.stringify(providerUser));
      }

      const resolvedMode = (mode as 'buyer' | 'provider' | null) ||
        (buyerToken ? 'buyer' : providerToken ? 'provider' : null);

      set({ buyerToken, buyerUser, providerToken, providerUser, mode: resolvedMode, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },
}));
