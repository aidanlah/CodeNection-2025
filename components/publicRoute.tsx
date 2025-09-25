import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '@/components/authContext';

interface PublicRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export const PublicRoute: React.FC<PublicRouteProps> = ({ 
  children, 
  redirectTo = '/(tabs)' 
}) => {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <View className="bg-green-500 p-4 rounded-full mb-4">
          <ActivityIndicator size="large" color="#ffffff" />
        </View>
      </View>
    );
  }

  if (session) {
    return <Redirect href='/' />;
  }

  return <>{children}</>;
};