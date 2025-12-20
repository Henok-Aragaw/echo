import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/auth-store';
import { useRouter } from 'expo-router';

export default function SettingsScreen() {
  const { signOut, user } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.replace('/(auth)/sign-in');
  };

  return (
    <SafeAreaView className="flex-1 bg-stone-950 p-6">
      <Text className="text-3xl text-stone-100 font-light mb-8">Settings</Text>

      <View className="bg-stone-900 rounded-xl p-4 mb-6">
        <Text className="text-stone-400 text-xs uppercase tracking-wider mb-1">Account</Text>
        <Text className="text-stone-100 text-lg">{user?.name || 'User'}</Text>
        <Text className="text-stone-500">{user?.email}</Text>
      </View>

      <TouchableOpacity 
        onPress={handleLogout}
        className="bg-stone-100 h-14 rounded-xl items-center justify-center"
      >
        <Text className="text-stone-950 font-bold">Log Out</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}