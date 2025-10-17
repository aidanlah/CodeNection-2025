// RequestDetailScreen.tsx - Displays details of a buddy walk request and handles accept/decline actions
import React, { useCallback, useState } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import { router } from 'expo-router';

// Request metadata passed via route or fetched from backend
interface RequestDetails {
  id: string;
  userName: string;
  requestTime: string;
  location: string;
  specialNotes: string;
  estimatedDuration: string;
  userRating: number;
}

interface RouteParams {
  requestId?: string;
  notificationId?: string;
}

// Sample request
const sampleRequest: RequestDetails = {
  id: 'req_001',
  userName: 'Sarah Chen',
  requestTime: '2:30 PM - Today',
  location: 'Main Library to Student Dorms',
  specialNotes: 'Walking alone after evening study session. Would prefer a female buddy if possible.',
  estimatedDuration: '15 minutes',
  userRating: 4.8
};

const RequestDetailScreen: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [request] = useState<RequestDetails>(sampleRequest);
  const route = useRoute();
  const params = route.params as RouteParams;

  // Status bar configuration
  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle('light-content', true);
      if (Platform.OS === 'android') {
        StatusBar.setBackgroundColor('#16a34a', true);
      }
    }, [])
  );

  // Navigate back to previous screen
  const handleGoBack = (): void => {
    router.back();
  };

  // Decline request with confirmation and simulated notification removal
  const handleDecline = (): void => {
    Alert.alert(
      'Decline Request',
      'Are you sure you want to decline this buddy request?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Decline',
          style: 'destructive',
          onPress: () => {
            // Simulate notification removal and user feedback
            Alert.alert(
              'Request Declined',
              'The user has been notified that you cannot accept this request. The notification has been removed.',
              [
                {
                  text: 'OK',
                  onPress: () => {
                    router.back();
                    // In production: dispatch action or call API to update notification status
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  // Accept request and navigate to outfit prompt screen
  const handleAccept = async (): Promise<void> => {
    setIsLoading(true);
    
    try {
      // Simulate backend processing delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Navigate to outfit submission screen with request context
      router.push({
        pathname: '/OutfitPromptScreen',
        params: {
        requestId: params?.requestId || request.id,
        notificationId: params?.notificationId,
        userName: request.userName,
      }
  });

    } catch (error) {
      Alert.alert('Error', 'Failed to accept request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Render star rating with full, half, and empty icons
  const renderStarRating = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Ionicons key={i} name="star" size={16} color="#FCD34D" />);
    }
    
    if (hasHalfStar) {
      stars.push(<Ionicons key="half" name="star-half" size={16} color="#FCD34D" />);
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Ionicons key={`empty-${i}`} name="star-outline" size={16} color="#D1D5DB" />);
    }
    
    return stars;
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-green-600" style={{ paddingTop: StatusBar.currentHeight || 44 }}>
        <View className="px-4 py-4">
          <View className="flex-row items-center justify-between">
            <TouchableOpacity onPress={handleGoBack} className="p-2">
              <Ionicons name="chevron-back" size={24} color="white" />
            </TouchableOpacity>
            
            <Text className="text-white text-lg font-semibold">Buddy Request</Text>
            
            <View className="p-2" />
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 px-4 py-6">
        {/* Volunteer Notice Card - Explains purpose of the request */}
        <View className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg mb-6">
          <View className="flex-row items-start">
            <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-3 mt-1">
              <Ionicons name="information-circle" size={24} color="#2563eb" />
            </View>
            <View className="flex-1">
              <Text className="text-blue-800 font-bold text-lg mb-1">
                Volunteer Request
              </Text>
              <Text className="text-blue-700 text-sm leading-relaxed">
                A student needs a buddy for a safe walk. Review the details below and accept if you're available to help.
              </Text>
            </View>
          </View>
        </View>

        {/* User Info Card  - Displays requester name, rating, and verification status */}
        <View className="bg-white rounded-2xl p-6 shadow-sm mb-4">
          <View className="flex-row items-center mb-4">
            <View className="w-16 h-16 bg-green-100 rounded-full items-center justify-center mr-4">
              <Ionicons name="person" size={32} color="#16a34a" />
            </View>
            <View className="flex-1">
              <Text className="text-xl font-bold text-gray-900">{request.userName}</Text>
              <View className="flex-row items-center mt-1">
                <View className="flex-row mr-2">
                  {renderStarRating(request.userRating)}
                </View>
                <Text className="text-gray-600 text-sm">({request.userRating})</Text>
              </View>
              <View className="flex-row items-center mt-1">
                <Ionicons name="shield-checkmark" size={16} color="#10B981" />
                <Text className="text-green-600 text-sm ml-1 font-medium">Verified Student</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Request Details Card - Displays time, route, duration, and special notes */}
        <View className="bg-white rounded-2xl p-6 shadow-sm mb-4">
          <Text className="text-lg font-bold text-gray-900 mb-4">Request Details</Text>
          
          <View className="space-y-4">
            <View className="flex-row items-start">
              <Ionicons name="time" size={20} color="#6B7280" />
              <View className="ml-3 flex-1">
                <Text className="text-gray-900 font-semibold">Date & Time</Text>
                <Text className="text-gray-600">{request.requestTime}</Text>
              </View>
            </View>

            <View className="flex-row items-start">
              <Ionicons name="location" size={20} color="#6B7280" />
              <View className="ml-3 flex-1">
                <Text className="text-gray-900 font-semibold">Route</Text>
                <Text className="text-gray-600">{request.location}</Text>
              </View>
            </View>

            <View className="flex-row items-start">
              <Ionicons name="hourglass" size={20} color="#6B7280" />
              <View className="ml-3 flex-1">
                <Text className="text-gray-900 font-semibold">Estimated Duration</Text>
                <Text className="text-gray-600">{request.estimatedDuration}</Text>
              </View>
            </View>

            {request.specialNotes && (
              <View className="flex-row items-start">
                <Ionicons name="document-text" size={20} color="#6B7280" />
                <View className="ml-3 flex-1">
                  <Text className="text-gray-900 font-semibold">Special Notes</Text>
                  <Text className="text-gray-600 leading-relaxed">{request.specialNotes}</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Safety Features Card 
            - Highlights active safety protocols during the walk
            - Reassures volunteers and requesters of built-in protections
        */}
        <View className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <Text className="text-lg font-bold text-gray-900 mb-4">Safety Features Active</Text>
          
          <View className="space-y-3">
            <View className="flex-row items-center">
              <Ionicons name="location" size={20} color="#10B981" />
              <Text className="ml-3 text-gray-700">Real-time location tracking</Text>
            </View>
            
            <View className="flex-row items-center">
              <Ionicons name="chatbubble" size={20} color="#10B981" />
              <Text className="ml-3 text-gray-700">In-app messaging available</Text>
            </View>
            
            <View className="flex-row items-center">
              <Ionicons name="shield-checkmark" size={20} color="#10B981" />
              <Text className="ml-3 text-gray-700">Emergency contacts notified</Text>
            </View>

            <View className="flex-row items-center">
              <Ionicons name="warning" size={20} color="#10B981" />
              <Text className="ml-3 text-gray-700">SOS button active during walk</Text>
            </View>
          </View>
        </View>

        {/* Volunteer Responsibilities Card 
            - Sets expectations for behavior and safety
            - Reinforces accountability and respectful conduct
        */}
        <View className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-lg mb-6">
          <View className="flex-row items-start">
            <Ionicons name="alert-circle" size={20} color="#F59E0B" className="mt-1" />
            <View className="ml-3 flex-1">
              <Text className="text-amber-800 font-semibold mb-2">Volunteer Guidelines:</Text>
              <Text className="text-amber-700 text-sm leading-relaxed">
                • Meet at the specified location promptly{'\n'}
                • Stay with the requester throughout the entire walk{'\n'}
                • Keep your phone charged and location sharing on{'\n'}
                • Report any incidents or concerns immediately{'\n'}
                • Be respectful and maintain appropriate boundaries
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons - Decline or Accept */}
        <View className="flex-row space-x-3">
          <TouchableOpacity
            onPress={handleDecline}
            className="flex-1 bg-gray-200 py-4 px-6 rounded-xl"
            activeOpacity={0.7}
          >
            <View className="flex-row items-center justify-center">
              <Ionicons name="close" size={20} color="#6B7280" />
              <Text className="ml-2 text-gray-700 font-bold text-lg">Decline</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleAccept}
            disabled={isLoading}
            className={`flex-1 py-4 px-6 rounded-xl ${
              isLoading ? 'bg-gray-400' : 'bg-green-500'
            }`}
            activeOpacity={0.8}
          >
            <View className="flex-row items-center justify-center">
              {isLoading ? (
                <Ionicons name="refresh" size={20} color="white" />
              ) : (
                <Ionicons name="checkmark" size={20} color="white" />
              )}
              <Text className="ml-2 text-white font-bold text-lg">
                {isLoading ? 'Processing...' : 'Accept Request'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Bottom Info Card - Confirms location sharing and safety commitment */}
        <View className="mt-4 bg-gray-50 p-4 rounded-lg">
          <Text className="text-gray-600 text-sm text-center">
            By accepting this request, you agree to help ensure a safe walk for your fellow student. 
            Your location will be shared with campus security during the walk.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default RequestDetailScreen;