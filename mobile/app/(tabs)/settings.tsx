import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Moon, Mail, Trash2, LogOut, Shield, Smartphone, Sun 
} from 'lucide-react-native';
import { useColorScheme } from 'nativewind';

// Imports
import { useSettings } from '@/hooks/useSettings';
import { SettingItem, EditProfileModal } from '@/components/SettingsComponents';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function SettingsScreen() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const {
    user,
    handleLogout, 
    handleDeleteAccount,
    modalVisible,
    setModalVisible,
    editMode,
    inputValue,
    setInputValue,
    isLoading,
    openEditModal,
    handleUpdateProfile,
  } = useSettings();

  return (
    <SafeAreaView className="flex-1 bg-[#FDFCFB] dark:bg-[#0c0a09]">
      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40, paddingTop: 20 }}>
        
        {/* Header */}
        <View className="mb-10">
            <Text className="text-3xl font-light text-stone-900 dark:text-stone-50 tracking-tight">
                Settings
            </Text>
            <Text className="text-stone-400 font-medium text-sm mt-1">
                Manage your account & preferences
            </Text>
        </View>

        {/* Profile Card */}
        <View className="items-center mb-10">
            <View className="w-24 h-24 rounded-full bg-stone-100 dark:bg-stone-800 items-center justify-center mb-4 border border-stone-200 dark:border-stone-700 shadow-sm">
                <Text className="text-4xl font-light text-stone-500 dark:text-stone-400">
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                </Text>
            </View>
            <Text className="text-xl font-semibold text-stone-900 dark:text-stone-100">
                {user?.name || "User"}
            </Text>
            <Text className="text-stone-500 text-sm mt-1 mb-4">
                {user?.email || "No email linked"}
            </Text>
            
            <TouchableOpacity 
                onPress={() => openEditModal('name')}
                className="bg-stone-900 dark:bg-stone-100 px-5 py-2 rounded-full"
            >
                <Text className="text-stone-50 dark:text-stone-900 text-xs font-bold uppercase tracking-widest">
                    Edit Profile
                </Text>
            </TouchableOpacity>
        </View>

        {/* Preferences Section */}
        <View className="mb-8">
            <Text className="text-stone-400 dark:text-stone-600 text-[10px] font-bold uppercase tracking-[0.2em] mb-4 ml-1">
                App Settings
            </Text>
            
            <View className="bg-white dark:bg-[#151413] rounded-3xl px-6 border border-stone-100 dark:border-stone-800 shadow-sm">
                <SettingItem 
                    icon={isDark ? Moon : Sun} 
                    label={isDark ? "Dark Mode" : "Light Mode"} 
                    rightElement={<ThemeToggle />}
                />
                <SettingItem 
                    icon={Smartphone} 
                    label="Device Info" 
                    value={Platform.OS === 'ios' ? 'iOS' : 'Android'} 
                />
                <SettingItem 
                    icon={Shield} 
                    label="Privacy Policy" 
                    onPress={() => { /* Navigate to Privacy */ }} 
                />
            </View>
        </View>

        {/* Account Section */}
        <View className="mb-10">
            <Text className="text-stone-400 dark:text-stone-600 text-[10px] font-bold uppercase tracking-[0.2em] mb-4 ml-1">
                Account
            </Text>
            
            <View className="bg-white dark:bg-[#151413] rounded-3xl px-6 border border-stone-100 dark:border-stone-800 shadow-sm">
                <SettingItem 
                    icon={Mail} 
                    label="Change Email" 
                    onPress={() => openEditModal('email')} 
                />
                <SettingItem 
                    icon={LogOut} 
                    label="Log Out" 
                    onPress={handleLogout} 
                />
                <SettingItem 
                    icon={Trash2} 
                    label="Delete Account" 
                    isDestructive
                    onPress={handleDeleteAccount} 
                />
            </View>
        </View>

      </ScrollView>

      {/* Edit Modal */}
      <EditProfileModal 
        visible={modalVisible} 
        onClose={() => setModalVisible(false)} 
        mode={editMode} 
        value={inputValue} 
        onChangeText={setInputValue} 
        onSave={handleUpdateProfile} 
        isLoading={isLoading} 
      />

    </SafeAreaView>
  );
}