import { useState, useRef, useEffect } from 'react';
import { Alert } from 'react-native';
import { router } from 'expo-router'; // Import router for redirection
import { useAuthStore } from '@/store/auth-store';
import { api } from '@/lib/api';

export type EditMode = 'name' | 'email';

export const useSettings = () => {
  const { user, signOut, checkAuth } = useAuthStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState<EditMode>('name');
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const isMounted = useRef(true);
  useEffect(() => {
    return () => { isMounted.current = false; };
  }, []);

  const openEditModal = (mode: EditMode) => {
    setEditMode(mode);
    setInputValue(mode === 'name' ? user?.name || '' : user?.email || '');
    setModalVisible(true);
  };

  // --- Fix: Handle Update ---
  const handleUpdateProfile = async () => {
    if (!inputValue.trim()) return;
    setIsLoading(true);
    
    try {
      if (editMode === 'name') {
        await api.post('/auth/update-user', { name: inputValue });
      } else {
        await api.post('/auth/change-email', { newEmail: inputValue, callbackURL: "/settings" });
        Alert.alert("Check your email", "Confirmation link sent.");
      }
      
      if (isMounted.current) {
        await checkAuth();
        setModalVisible(false);
      }
    } catch (error: any) {
      if (isMounted.current) {
        Alert.alert("Update Failed", error.response?.data?.message || "Error occurred");
      }
    } finally {
      if (isMounted.current) setIsLoading(false);
    }
  };

  // --- Fix: Explicit Logout Redirect ---
  const handleLogout = async () => {
    try {
      await signOut();
      // Force navigation to sign-in screen
      router.replace('/sign-in'); 
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // --- Fix: Explicit Delete Redirect ---
  const handleDeleteAccount = () => {
    Alert.alert("Delete Account", "This action cannot be undone.", [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete Forever", 
          style: "destructive", 
          onPress: async () => {
            try {
              await api.delete('/user/me');
              await signOut();
              // Force navigation to sign-in screen
              router.replace('/sign-in');
            } catch (error: any) {
              Alert.alert("Error", "Could not delete account. Please try again.");
            }
          } 
        }
    ]);
  };

  return {
    user,
    modalVisible,
    setModalVisible,
    editMode,
    inputValue,
    setInputValue,
    isLoading,
    openEditModal,
    handleUpdateProfile,
    handleDeleteAccount,
    handleLogout, // Return the new wrapper function
  };
};