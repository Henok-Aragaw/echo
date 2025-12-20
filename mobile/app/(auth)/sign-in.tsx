import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/auth-store';

export default function SignIn() {
  const router = useRouter();
  const { signIn } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    if(!email || !password) return Alert.alert("Error", "Please fill all fields");
    
    setLoading(true);
    try {
      await signIn(email, password);
      router.replace('/(tabs)/home');
    } catch (error) {
      Alert.alert("Failed", "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-stone-950 px-6 justify-center">
      <View className="mb-10">
        <Text className="text-4xl text-stone-100 font-light mb-2">Welcome Back</Text>
        <Text className="text-stone-500 text-lg">Sign in to access your memories.</Text>
      </View>

      <View className="space-y-4">
        <View>
            <Text className="text-stone-400 mb-2 ml-1 text-sm uppercase tracking-wider">Email</Text>
            <TextInput
            placeholder="you@example.com"
            placeholderTextColor="#57534e"
            className="bg-stone-900 text-stone-100 p-4 rounded-xl border border-stone-800"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            />
        </View>

        <View>
            <Text className="text-stone-400 mb-2 ml-1 text-sm uppercase tracking-wider">Password</Text>
            <TextInput
            placeholder="••••••••"
            placeholderTextColor="#57534e"
            className="bg-stone-900 text-stone-100 p-4 rounded-xl border border-stone-800"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            />
        </View>

        <TouchableOpacity 
          onPress={handleSignIn}
          disabled={loading}
          className="bg-stone-100 h-14 rounded-xl items-center justify-center mt-4"
        >
          {loading ? (
             <ActivityIndicator color="black" />
          ) : (
             <Text className="text-stone-950 font-bold text-lg">Sign In</Text>
          )}
        </TouchableOpacity>

        <View className="flex-row justify-center mt-6">
          <Text className="text-stone-500">Don&apos;t have an account? </Text>
          <Link href="/(auth)/sign-up" asChild>
            <TouchableOpacity>
              <Text className="text-stone-200 font-medium">Create one</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
}