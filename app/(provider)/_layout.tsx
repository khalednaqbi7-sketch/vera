import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useAuthStore } from '../../src/store/authStore';

// Protected screens — require provider login
const PROTECTED = ['dashboard', 'services', 'orders', 'earnings', 'profile'];

export default function ProviderLayout() {
  const router = useRouter();
  const segments = useSegments();
  const { providerToken, isLoading } = useAuthStore();

  useEffect(() => {
    if (isLoading) return;
    const currentScreen = segments[segments.length - 1];
    const isProtected = PROTECTED.includes(currentScreen ?? '');
    if (isProtected && !providerToken) {
      // Redirect to provider login if trying to access a protected screen
      router.replace('/(provider)/login');
    }
  }, [providerToken, isLoading, segments]);

  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="services" />
      <Stack.Screen name="orders" />
      <Stack.Screen name="earnings" />
      <Stack.Screen name="profile" />
    </Stack>
  );
}
