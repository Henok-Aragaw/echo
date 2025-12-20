import 'react-native-reanimated';
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useColorScheme } from 'nativewind';
import { useEffect } from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar'; 
import "../global.css"; 

const queryClient = new QueryClient();

export default function RootLayout() {
  const { colorScheme, setColorScheme } = useColorScheme();

  // Ensure theme is set on load
  useEffect(() => {
    if (!colorScheme) {
      setColorScheme('light');
    }
  }, []);

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        {/* 
            Global Background Wrapper 
            This ensures the "notch" area has the correct background color 
        */}
        <View className="flex-1 bg-stone-50 dark:bg-stone-950">
          
          <StatusBar 
            style={colorScheme === 'dark' ? 'light' : 'dark'} 
            backgroundColor={colorScheme === 'dark' ? '#0c0a09' : '#fafaf9'}
            translucent={false}
          />

          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
            <Stack.Screen name="(auth)" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
          </Stack>
        </View>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}