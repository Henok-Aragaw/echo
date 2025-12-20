import { Tabs } from 'expo-router';
import { Home, Clock, Sparkles, Settings as SettingsIcon } from 'lucide-react-native';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false, // We will build custom headers in screens or use simple ones
        tabBarStyle: { 
            backgroundColor: '#0c0a09', 
            borderTopColor: '#292524',
            height: 60,
            paddingBottom: 8,
            paddingTop: 8,
        },
        tabBarActiveTintColor: '#fafaf9', // stone-50
        tabBarInactiveTintColor: '#78716c', // stone-500
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen 
        name="home" 
        options={{ 
            tabBarIcon: ({ color }) => <Home size={24} color={color} /> 
        }} 
      />
      <Tabs.Screen 
        name="timeline" 
        options={{ 
            tabBarIcon: ({ color }) => <Clock size={24} color={color} /> 
        }} 
      />
      <Tabs.Screen 
        name="echoes" 
        options={{ 
            tabBarIcon: ({ color }) => <Sparkles size={24} color={color} /> 
        }} 
      />
       <Tabs.Screen 
        name="settings" 
        options={{ 
            tabBarIcon: ({ color }) => <SettingsIcon size={24} color={color} /> 
        }} 
      />
    </Tabs>
  );
}