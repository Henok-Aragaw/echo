import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { Alert } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export type FragmentType = 'text' | 'image' | 'link' | 'location';

export function useCapture() {
  const [content, setContent] = useState('');
  const [type, setType] = useState<FragmentType>('text');
  const [mediaUri, setMediaUri] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [lastInsight, setLastInsight] = useState<string | null>(null);

  const queryClient = useQueryClient();

  // 1. Image Picker Logic
  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert("Permission Required", "You need to allow access to your photos.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7, // Compress slightly for faster Cloudinary upload
    });

    if (!result.canceled) {
      setMediaUri(result.assets[0].uri);
      setType('image');
      setContent(''); // Optional: clear text or keep it as caption
    }
  };

  // 2. Location Logic
  const detectLocation = async () => {
    setIsLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Allow location access to capture this moment.');
        setIsLocating(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      // Optional: Reverse Geocode to get a readable address
      const address = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      });

      const readable = address[0] 
        ? `${address[0].city}, ${address[0].region}` 
        : `${location.coords.latitude}, ${location.coords.longitude}`;

      setContent(readable);
      setType('location');
    } catch (error) {
      Alert.alert(`Error", "Could not fetch location. ${error}`);
    } finally {
      setIsLocating(false);
    }
  };

  // 3. API Mutation
  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const formData = new FormData();

      // Backend DTO expectations
      formData.append('type', type.toUpperCase()); 
      formData.append('content', content || (type === 'image' ? 'Image capture' : ''));

      // Special handling for React Native Image Uploads
      if (type === 'image' && mediaUri) {
        const filename = mediaUri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename || '');
        const fileType = match ? `image/${match[1]}` : `image/jpeg`;

        formData.append('image', {
          uri: mediaUri,
          name: filename || 'upload.jpg',
          type: fileType,
        } as any); // 'as any' is needed because TS defines FormData strictly for browser
      }

      // Axios automatically sets 'Content-Type': 'multipart/form-data' when it sees FormData
      const { data } = await api.post('/fragments', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
      return data;
    },
    onSuccess: (data) => {
      // Reset State
      setContent('');
      setMediaUri(null);
      setType('text');
      setLastInsight(data.insight?.content);
      
      // Refresh Timeline
      queryClient.invalidateQueries({ queryKey: ['timeline'] });
    },
    onError: (error) => {
      console.error(error);
      Alert.alert("Upload Failed", "Something went wrong saving your memory.");
    }
  });

  const resetMode = () => {
    setType('text');
    setMediaUri(null);
    setContent('');
  };

  return {
    content,
    setContent,
    type,
    setType,
    mediaUri,
    pickImage,
    detectLocation,
    isLocating,
    submit: mutate,
    isPending,
    lastInsight,
    resetMode
  };
}