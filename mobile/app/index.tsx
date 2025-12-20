import { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/auth-store';
import { storage } from '@/lib/storage';

export default function SplashScreen() {
  const router = useRouter();
  const { checkAuth, isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    const init = async () => {
      await checkAuth();
      const hasSeenOnboarding = await storage.hasSeenOnboarding();

      setTimeout(() => {
        if (isAuthenticated) {
          router.replace('/(tabs)/home');
        } else if (!hasSeenOnboarding) {
          router.replace('/onboarding');
        } else {
          router.replace('/(auth)/sign-in');
        }
      }, 1500);
    };

    init();
  }, [checkAuth, isAuthenticated, router]);

  if (isLoading) {
    return (
      <View className="flex-1 bg-stone-900 justify-center items-center">
        <Text className="text-4xl font-light text-stone-100 mb-4 tracking-widest">ECHO</Text>
        <ActivityIndicator size="small" color="#d6d3d1" />
      </View>
    );
  }

  return null;
}