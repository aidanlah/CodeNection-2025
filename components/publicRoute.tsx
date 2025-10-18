import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '@/components/authContext';

// Props: wraps public-only pages and redirects authenticated users
interface PublicRouteProps {
  children: React.ReactNode;
  redirectTo?: string;// Optional redirect path for logged-in users
}

export const PublicRoute: React.FC<PublicRouteProps> = ({ 
  children, 
  redirectTo = '/(tabs)' 
}) => {
  const { session, loading } = useAuth();// Get auth state from context

  // Show loading spinner while auth state is being resolved
  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <View className="bg-green-500 p-4 rounded-full mb-4">
          <ActivityIndicator size="large" color="#ffffff" />
        </View>
      </View>
    );
  }

   // Redirect authenticated users away from public-only pages
  if (session) {
    return <Redirect href='/' />;
  }

  // Render public content for unauthenticated users
  return <>{children}</>;
};