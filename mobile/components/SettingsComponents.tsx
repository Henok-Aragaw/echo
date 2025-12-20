import React from 'react';
import { 
  View, Text, TouchableOpacity, Modal, TextInput, 
  ActivityIndicator, KeyboardAvoidingView, Platform 
} from 'react-native';
import { ChevronRight, X } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import clsx from 'clsx';
import { EditMode } from '../hooks/useSettings';

interface SettingItemProps {
  icon: any;
  label: string;
  value?: string;
  isDestructive?: boolean;
  onPress?: () => void;
  rightElement?: React.ReactNode;
}

export const SettingItem = ({ 
  icon: Icon, label, value, isDestructive, onPress, rightElement 
}: SettingItemProps) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <TouchableOpacity 
      activeOpacity={onPress ? 0.6 : 1}
      onPress={onPress}
      disabled={!onPress && !rightElement}
      className="flex-row items-center justify-between py-5 border-b border-stone-100 dark:border-stone-800 last:border-0"
    >
      <View className="flex-row items-center flex-1">
        <View className={clsx(
          "w-10 h-10 rounded-xl items-center justify-center mr-4",
          isDestructive ? "bg-red-50 dark:bg-red-900/20" : "bg-stone-100 dark:bg-stone-800"
        )}>
          <Icon 
            size={18} 
            color={isDestructive ? "#ef4444" : (isDark ? "#a8a29e" : "#57534e")} 
            strokeWidth={2}
          />
        </View>
        <View>
            <Text className={clsx(
                "text-base font-medium",
                isDestructive ? "text-red-500" : "text-stone-800 dark:text-stone-200"
            )}>
            {label}
            </Text>
            {value && <Text className="text-stone-400 text-xs mt-0.5">{value}</Text>}
        </View>
      </View>

      {rightElement ? rightElement : onPress ? (
        <ChevronRight size={16} color={isDark ? "#57534e" : "#d6d3d1"} />
      ) : null}
    </TouchableOpacity>
  );
};

// --- Edit Profile Modal ---
interface EditModalProps {
  visible: boolean;
  onClose: () => void;
  mode: EditMode;
  value: string;
  onChangeText: (text: string) => void;
  onSave: () => void;
  isLoading: boolean;
}

export const EditProfileModal = ({ 
  visible, onClose, mode, value, onChangeText, onSave, isLoading 
}: EditModalProps) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Modal visible={visible} transparent animationType="fade">
        <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className="flex-1 bg-stone-900/40 backdrop-blur-sm justify-end sm:justify-center"
        >
          <View className="bg-white dark:bg-stone-900 rounded-t-[32px] sm:rounded-[32px] p-8 pb-12 sm:m-6 border-t border-stone-200 dark:border-stone-800 shadow-2xl">
            <View className="flex-row justify-between items-center mb-8">
              <Text className="text-2xl font-light text-stone-900 dark:text-stone-100 capitalize">
                Edit {mode}
              </Text>
              <TouchableOpacity onPress={onClose} className="p-2 bg-stone-100 dark:bg-stone-800 rounded-full">
                <X size={20} color={isDark ? "#d6d3d1" : "#57534e"} />
              </TouchableOpacity>
            </View>

            <TextInput 
              value={value}
              onChangeText={onChangeText}
              className="bg-stone-50 dark:bg-black text-lg text-stone-900 dark:text-stone-100 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 mb-8"
              placeholder={`Enter new ${mode}...`}
              placeholderTextColor="#a8a29e"
              autoCapitalize="none"
              autoFocus
            />

            <TouchableOpacity 
              onPress={onSave}
              disabled={isLoading}
              className="bg-stone-900 dark:bg-stone-100 p-5 rounded-2xl items-center shadow-lg shadow-stone-200 dark:shadow-none"
            >
              {isLoading ? (
                <ActivityIndicator color={isDark ? "#000" : "#fff"} />
              ) : (
                <Text className="text-white dark:text-stone-900 font-bold tracking-wider uppercase">
                    Save Changes
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
  );
}