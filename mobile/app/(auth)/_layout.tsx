import { Stack } from 'expo-router';
import { View } from 'react-native';

export default function AuthLayout() {
  return (

    <View className="flex-1 bg-stone-50 dark:bg-stone-950">
      <Stack 
        screenOptions={{ 
          headerShown: false, 

          contentStyle: { backgroundColor: 'transparent' },
          animation: 'slide_from_right'
        }} 
      >
        <Stack.Screen name="sign-in" />
        <Stack.Screen name="sign-up" />
      </Stack>
    </View>
  );
}