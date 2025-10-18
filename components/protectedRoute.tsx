import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Redirect, RelativePathString } from 'expo-router';
import { useAuth } from '@/components/authContext';

// Props: wraps children and optionally redirects to a fallback route
interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: RelativePathString;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  fallback = "/sign-in" 
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

  // Redirect to fallback route if no session is found
  if (!session) {
    return <Redirect href='/sign-in' />;
  }

  // Render protected content once authenticated
  return <>{children}</>;
};