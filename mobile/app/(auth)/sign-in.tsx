import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator, 
  KeyboardAvoidingView, 
  Platform,
  ScrollView
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/auth-store';
import { useColorScheme } from 'nativewind';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { Mail, Lock, ArrowRight, Chrome, Zap } from 'lucide-react-native';
import clsx from 'clsx';

// 1. Configure WebBrowser to handle the redirect closing
WebBrowser.maybeCompleteAuthSession();

// Hardcoded for reliability in this file, or import from your config
const API_BASE_URL = "https://echo-ten-eta.vercel.app/api"; 

export default function SignIn() {
  const router = useRouter();
  const { signIn, setSession } = useAuthStore();
  const { colorScheme } = useColorScheme();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // UI Theme Helpers
  const isDark = colorScheme === 'dark';
  const iconColor = isDark ? '#a8a29e' : '#78716c'; // stone-400 / stone-500
  const activeIconColor = isDark ? '#e7e5e4' : '#292524'; // stone-200 / stone-800

  // Standard Email Sign In
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

  // Modern Google OAuth Flow (Fixes 404)
  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);
      
      // 1. Define the deep link we want to return to
      // In Dev: exp://192.168.x.x:8081/--/auth-callback
      // In Prod: echo-app://auth-callback
      const callbackURL = Linking.createURL('/auth-callback'); 

      // 2. POST to Backend to ask for the Google Consent URL
      // We do NOT open the URL directly. We ask Better Auth to generate it.
      const response = await fetch(`${API_BASE_URL}/auth/sign-in/social`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            provider: "google",
            callbackURL: callbackURL 
        })
      });

      const data = await response.json();

      if (!response.ok || !data.url) {
         throw new Error(data.message || "Failed to initiate Google Login");
      }

      // 3. Open the secure browser with the URL the backend gave us
      const result = await WebBrowser.openAuthSessionAsync(data.url, callbackURL);

      // 4. Handle the success redirect
      if (result.type === 'success' && result.url) {
        const parsedUrl = new URL(result.url);
        const params = new URLSearchParams(parsedUrl.search);
        
        // Better Auth typically returns the token as a query param named 'token' or 'session_token'
        // depending on your specific plugin configuration
        const token = params.get('token') || params.get('session_token');

        if (token) {
          await setSession(token);
          router.replace('/(tabs)/home');
        } else {
            // Fallback: Sometimes token is in the hash part #token=...
            // If you don't use hash routing, you can ignore this
            Alert.alert("Error", "Authentication successful but no token received.");
        }
      }
    } catch (error: any) {
      console.log("Google Auth Error:", error);
      Alert.alert("Google Sign In", "Process cancelled or failed.");
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
          
          {/* --- Header Section --- */}
          <View className="mb-10">
            {/* Logo Abstract */}
            <View className="h-14 w-14 bg-stone-900 dark:bg-stone-100 rounded-2xl mb-6 items-center justify-center shadow-lg shadow-stone-200 dark:shadow-none">
              <Zap size={24} color={isDark ? "black" : "white"} fill={isDark ? "black" : "white"} />
            </View>
            
            <Text className="text-4xl text-stone-900 dark:text-stone-50 font-bold tracking-tight mb-2">
              Welcome back
            </Text>
            <Text className="text-stone-500 dark:text-stone-400 text-lg font-medium leading-relaxed">
              Sign in to sync your memories and access your personal timeline.
            </Text>
          </View>

          {/* --- Form Section --- */}
          <View className="space-y-5">
            
            {/* Email Input */}
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

            {/* Password Input */}
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
              <TouchableOpacity className="self-end pt-1">
                <Text className="text-stone-500 hover:text-stone-800 dark:hover:text-stone-300 font-medium text-sm">
                  Forgot Password?
                </Text>
              </TouchableOpacity>
            </View>

            {/* Sign In Button */}
            <TouchableOpacity 
              onPress={handleSignIn}
              disabled={loading}
              className={clsx(
                "h-14 rounded-2xl flex-row items-center justify-center shadow-lg shadow-stone-300/50 dark:shadow-none mt-2",
                loading ? "bg-stone-700 dark:bg-stone-800" : "bg-stone-900 dark:bg-stone-100"
              )}
            >
              {loading ? (
                <ActivityIndicator color={isDark ? "white" : "white"} />
              ) : (
                <>
                  <Text className="text-stone-50 dark:text-stone-950 font-bold text-lg mr-2">Sign In</Text>
                  <ArrowRight size={20} color={isDark ? "#0c0a09" : "#fafaf9"} strokeWidth={2.5} />
                </>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View className="flex-row items-center my-6">
              <View className="flex-1 h-[1px] bg-stone-200 dark:bg-stone-800" />
              <Text className="mx-4 text-stone-400 font-medium text-xs tracking-widest">OR CONTINUE WITH</Text>
              <View className="flex-1 h-[1px] bg-stone-200 dark:bg-stone-800" />
            </View>

            {/* Google Button */}
            <TouchableOpacity 
              onPress={handleGoogleSignIn}
              disabled={googleLoading}
              className="h-14 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl flex-row items-center justify-center space-x-3 shadow-sm"
            >
              {googleLoading ? (
                 <ActivityIndicator color={isDark ? "white" : "black"} />
              ) : (
                <>
                  <Chrome size={20} color={isDark ? "white" : "black"} />
                  <Text className="text-stone-700 dark:text-stone-200 font-bold text-base">Google</Text>
                </>
              )}
            </TouchableOpacity>

          </View>

          {/* --- Footer --- */}
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