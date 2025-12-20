import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, 
  KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/auth-store';
import { useColorScheme } from 'nativewind';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { Mail, Lock, ArrowRight, Chrome, Zap } from 'lucide-react-native';
import clsx from 'clsx';

// Initialize WebBrowser
WebBrowser.maybeCompleteAuthSession();

// API URL
const API_BASE_URL = "http://192.168.43.176:3000/api"; 

export default function SignIn() {
  const router = useRouter();
  const { signIn, setSession } = useAuthStore();
  const { colorScheme } = useColorScheme();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const isDark = colorScheme === 'dark';
  const iconColor = isDark ? '#a8a29e' : '#78716c'; 
  const activeIconColor = isDark ? '#e7e5e4' : '#292524'; 

  const handleSignIn = async () => {
    if(!email || !password) return Alert.alert("Missing Fields", "Please enter your email and password.");
    setLoading(true);
    try {
      await signIn(email, password);
      router.replace('/(tabs)/home');
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || "Invalid credentials.";
      Alert.alert("Sign In Failed", msg);
    } finally {
      setLoading(false);
    }
  };

  // --- GOOGLE SIGN IN ---
  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);
      
      // 1. Generate the Deep Link
      // This creates: exp://192.168.43.176:8081/--/auth-callback
      const callbackURL = Linking.createURL('/auth-callback'); 
      
      // 2. Manual Origin Construction (Fixes "Origin: null" error)
      // We parse the callbackURL to extract just the scheme and host
      // e.g. exp://192.168.43.176:8081
      const parsed = new URL(callbackURL);
      const origin = `${parsed.protocol}//${parsed.host}`;

      console.log("------------------------------------------");
      console.log("🔹 Callback URL:", callbackURL);
      console.log("🔹 Origin Header:", origin);
      console.log("ℹ️  Ensure '" + origin + "' is in backend trustedOrigins!");
      console.log("------------------------------------------");

      // 3. Initiate Auth with Backend
      const response = await fetch(`${API_BASE_URL}/auth/sign-in/social`, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "Origin": origin // Sending the manually constructed origin
        },
        body: JSON.stringify({
            provider: "google",
            callbackURL: callbackURL 
        })
      });

      const data = await response.json();

      if (!response.ok || !data.url) {
         console.error("❌ Auth Init Failed:", data);
         throw new Error(data.message || "Failed to initiate Google Login");
      }

      // 4. Open Web Browser
      const result = await WebBrowser.openAuthSessionAsync(data.url, callbackURL);

      // 5. Handle Redirect Success
      if (result.type === 'success' && result.url) {
        // The URL will look like: exp://...?token=...
        const parsedUrl = new URL(result.url);
        const params = new URLSearchParams(parsedUrl.search);
        
        // Better Auth (Bearer Plugin) returns token in URL
        const token = params.get('token') || params.get('session_token');

        if (token) {
          await setSession(token);
          router.replace('/(tabs)/home');
        } else {
            console.log("❌ No token in URL:", result.url);
            Alert.alert("Error", "Login succeeded but no token was returned.");
        }
      } else {
        // User cancelled or closed the browser
        console.log("Browser result:", result.type);
      }
    } catch (error: any) {
      console.log("Google Auth Error:", error);
      Alert.alert("Google Sign In", "Could not complete sign in. Check console logs.");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-stone-50 dark:bg-stone-950">
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} 
          className="px-6"
          showsVerticalScrollIndicator={false}
        >
          <View className="mb-10">
            <View className="h-14 w-14 bg-stone-900 dark:bg-stone-100 rounded-2xl mb-6 items-center justify-center shadow-lg shadow-stone-200 dark:shadow-none">
              <Zap size={24} color={isDark ? "black" : "white"} fill={isDark ? "black" : "white"} />
            </View>
            <Text className="text-4xl text-stone-900 dark:text-stone-50 font-bold tracking-tight mb-2">
              Welcome back
            </Text>
            <Text className="text-stone-500 dark:text-stone-400 text-lg font-medium leading-relaxed">
              Sign in to sync your memories.
            </Text>
          </View>

          <View className="space-y-5">
            {/* Inputs... */}
            <View className="space-y-2">
              <Text className="text-stone-900 dark:text-stone-300 font-semibold ml-1 text-sm uppercase tracking-wide">Email</Text>
              <View className="flex-row items-center bg-white dark:bg-stone-900/50 border border-stone-200 dark:border-stone-800 rounded-2xl h-14 px-4 focus:border-stone-900 dark:focus:border-stone-500 transition-colors">
                <Mail size={20} color={email ? activeIconColor : iconColor} />
                <TextInput
                  placeholder="you@example.com"
                  placeholderTextColor={isDark ? '#57534e' : '#a8a29e'}
                  className="flex-1 ml-3 text-stone-900 dark:text-stone-100 text-base font-medium h-full"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>

            <View className="space-y-2">
              <Text className="text-stone-900 dark:text-stone-300 font-semibold ml-1 text-sm uppercase tracking-wide">Password</Text>
              <View className="flex-row items-center bg-white dark:bg-stone-900/50 border border-stone-200 dark:border-stone-800 rounded-2xl h-14 px-4 focus:border-stone-900 dark:focus:border-stone-500 transition-colors">
                <Lock size={20} color={password ? activeIconColor : iconColor} />
                <TextInput
                  placeholder="••••••••"
                  placeholderTextColor={isDark ? '#57534e' : '#a8a29e'}
                  className="flex-1 ml-3 text-stone-900 dark:text-stone-100 text-base font-medium h-full"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
              </View>
            </View>

            <TouchableOpacity 
              onPress={handleSignIn}
              disabled={loading}
              className={clsx(
                "h-14 rounded-2xl flex-row items-center justify-center shadow-lg shadow-stone-300/50 dark:shadow-none mt-2",
                loading ? "bg-stone-700 dark:bg-stone-800" : "bg-stone-900 dark:bg-stone-100"
              )}
            >
              {loading ? <ActivityIndicator color="white" /> : (
                <>
                  <Text className="text-stone-50 dark:text-stone-950 font-bold text-lg mr-2">Sign In</Text>
                  <ArrowRight size={20} color={isDark ? "#0c0a09" : "#fafaf9"} strokeWidth={2.5} />
                </>
              )}
            </TouchableOpacity>

            <View className="flex-row items-center my-6">
              <View className="flex-1 h-[1px] bg-stone-200 dark:bg-stone-800" />
              <Text className="mx-4 text-stone-400 font-medium text-xs tracking-widest">OR CONTINUE WITH</Text>
              <View className="flex-1 h-[1px] bg-stone-200 dark:bg-stone-800" />
            </View>

            <TouchableOpacity 
              onPress={handleGoogleSignIn}
              disabled={googleLoading}
              className="h-14 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl flex-row items-center justify-center space-x-3 shadow-sm"
            >
              {googleLoading ? <ActivityIndicator color={isDark ? "white" : "black"} /> : (
                <>
                  <Chrome size={20} color={isDark ? "white" : "black"} />
                  <Text className="text-stone-700 dark:text-stone-200 font-bold text-base">Google</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
          
          <View className="flex-row justify-center mt-12 mb-6">
            <Text className="text-stone-500 font-medium">Don&apos;t have an account? </Text>
            <Link href="/(auth)/sign-up" asChild>
              <TouchableOpacity>
                <Text className="text-stone-900 dark:text-stone-100 font-bold underline decoration-stone-400">Create one</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}