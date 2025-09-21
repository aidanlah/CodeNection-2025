import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Redirect, RelativePathString } from 'expo-router';
import { useAuth } from '@/components/authContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: RelativePathString;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  fallback = "/sign-in" 
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <View className="bg-green-500 p-4 rounded-full mb-4">
          <ActivityIndicator size="large" color="#ffffff" />
        </View>
      </View>
    );
  }

  if (!user) {
    return <Redirect href='/sign-in' />;
  }

  return <>{children}</>;
};