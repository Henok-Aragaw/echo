import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, 
  KeyboardAvoidingView, Platform, ScrollView, Pressable
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/auth-store';
import { useColorScheme } from 'nativewind';
import { Mail, Lock, ArrowRight, Sparkles, Eye, EyeOff } from 'lucide-react-native';
import clsx from 'clsx';

export default function SignIn() {
  const router = useRouter();
  const { signIn } = useAuthStore();
  const { colorScheme } = useColorScheme();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const isDark = colorScheme === 'dark';
  
  // Gentle color palette
  const iconColor = isDark ? '#78716c' : '#a8a29e'; // stone-500 / stone-400
  const activeIconColor = isDark ? '#e7e5e4' : '#44403c'; // stone-200 / stone-700
  
  // Explicitly defining the cursor color to ensure visibility
  const cursorColor = isDark ? '#e7e5e4' : '#1c1917'; 

  const handleSignIn = async () => {
    if(!email || !password) {
        return Alert.alert("Missing Fields", "Please enter your email and password.");
    }
    
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

  return (
    <SafeAreaView className="flex-1 bg-[#FAFAF9] dark:bg-[#0c0a09]">
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} 
          className="px-8"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* --- Header --- */}
          <View className="items-center mb-12">
            <View className="h-16 w-16 bg-stone-200/50 dark:bg-stone-800/50 rounded-full mb-6 items-center justify-center border border-stone-100 dark:border-stone-800">
              <Sparkles size={24} color={isDark ? "#e7e5e4" : "#44403c"} strokeWidth={1.5} />
            </View>
            <Text className="text-3xl text-stone-800 dark:text-stone-100 font-bold tracking-tight mb-3 text-center">
              Welcome Back
            </Text>
            <Text className="text-stone-500 dark:text-stone-400 text-base font-normal leading-relaxed text-center max-w-[250px]">
              Enter your credentials to access your personal space.
            </Text>
          </View>

          {/* --- Form --- */}
          <View className="space-y-6">
            
            {/* Email Input */}
            <View className="space-y-2">
              <Text className="text-stone-700 dark:text-stone-300 font-medium ml-1 text-xs uppercase tracking-widest opacity-80">
                Email Address
              </Text>
              <View 
                className={clsx(
                  "flex-row items-center bg-white dark:bg-stone-900 border rounded-2xl h-16 px-5",
                  emailFocused 
                    ? "border-stone-500 dark:border-stone-400" 
                    : "border-stone-200 dark:border-stone-800"
                )}
              >
                <Mail size={20} color={email || emailFocused ? activeIconColor : iconColor} strokeWidth={1.5} />
                <TextInput
                  placeholder="name@example.com"
                  placeholderTextColor={isDark ? '#57534e' : '#a8a29e'}
                  // Removed h-full, added flex-1 and py-0 to prevent cursor clipping
                  className="flex-1 ml-4 text-stone-800 dark:text-stone-100 text-base font-medium py-0" 
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  // Set both properties to ensure cursor is visible on all OS versions
                  selectionColor={cursorColor} 
                  cursorColor={cursorColor}
                  textAlignVertical="center"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Password Input */}
            <View className="space-y-2">
              <Text className="text-stone-700 dark:text-stone-300 font-medium ml-1 text-xs uppercase tracking-widest opacity-80">
                Password
              </Text>
              <View 
                className={clsx(
                  "flex-row items-center bg-white dark:bg-stone-900 border rounded-2xl h-16 px-5",
                  passwordFocused 
                    ? "border-stone-500 dark:border-stone-400" 
                    : "border-stone-200 dark:border-stone-800"
                )}
              >
                <Lock size={20} color={password || passwordFocused ? activeIconColor : iconColor} strokeWidth={1.5} />
                <TextInput
                  placeholder="••••••••"
                  placeholderTextColor={isDark ? '#57534e' : '#a8a29e'}
                  className="flex-1 ml-4 text-stone-800 dark:text-stone-100 text-base font-medium py-0"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  selectionColor={cursorColor}
                  cursorColor={cursorColor}
                  textAlignVertical="center"
                />
                <Pressable onPress={() => setShowPassword(!showPassword)} className="p-2">
                   {showPassword ? (
                     <EyeOff size={20} color={iconColor} strokeWidth={1.5} />
                   ) : (
                     <Eye size={20} color={iconColor} strokeWidth={1.5} />
                   )}
                </Pressable>
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity 
              onPress={handleSignIn}
              disabled={loading}
              activeOpacity={0.9}
              className={clsx(
                "h-16 rounded-2xl flex-row items-center justify-center mt-6 shadow-lg",
                loading ? "bg-stone-600" : "bg-stone-800 dark:bg-stone-200",
                "shadow-stone-300 dark:shadow-none"
              )}
            >
              {loading ? <ActivityIndicator color={isDark ? "black" : "white"} /> : (
                <>
                  <Text className={clsx(
                      "font-bold text-lg mr-2 tracking-wide",
                      isDark ? "text-stone-900" : "text-stone-50"
                  )}>
                    Sign In
                  </Text>
                  <ArrowRight size={20} color={isDark ? "#1c1917" : "#fafaf9"} strokeWidth={2.5} />
                </>
              )}
            </TouchableOpacity>
          </View>
          
          {/* --- Footer --- */}
          <View className="flex-row justify-center mt-16">
            <Text className="text-stone-500 dark:text-stone-400 font-medium text-base">
                New here?{" "}
            </Text>
            <Link href="/(auth)/sign-up" asChild>
              <TouchableOpacity>
                <Text className="text-stone-800 dark:text-stone-100 font-bold text-base decoration-stone-800 underline">
                  Create Account
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}