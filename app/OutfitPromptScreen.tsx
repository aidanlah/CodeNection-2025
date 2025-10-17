// OutfitPromptScreen.tsx - Handles volunteer outfit submission and meeting point confirmation
import React, { useCallback, useState } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import { router } from 'expo-router';

// Route params passed from notification or request screen
interface RouteParams {
  requestId?: string;
  notificationId?: string;
  userName?: string;
}

const OutfitPromptScreen: React.FC = () => {
  // Form state for outfit description and meeting point
  const [outfitDescription, setOutfitDescription] = useState<string>('');
  const [meetingPoint, setMeetingPoint] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  // Extract route parameters (e.g. requestId, userName)
  const route = useRoute();
  const params = route.params as RouteParams;

  // Configure status bar appearance on screen focus
  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle('light-content', true);
      if (Platform.OS === 'android') {
        StatusBar.setBackgroundColor('#16a34a', true);
      }
    }, [])
  );

  // Confirm before navigating back (cancels acceptance)
  const handleGoBack = (): void => {
    Alert.alert(
      'Cancel Request Accept',
      'Are you sure you want to go back? Your acceptance will be cancelled.',
      [
        {
          text: 'Stay Here',
          style: 'cancel',
        },
        {
          text: 'Go Back',
          style: 'destructive',
          onPress: () => router.back(),
        },
      ]
    );
  };

  // Validate and submit outfit + meeting point
  const handleSubmitOutfit = async (): Promise<void> => {
    if (!outfitDescription.trim()) {
      Alert.alert('Description Required', 'Please describe what you\'ll be wearing so the user can recognize you.');
      return;
    }

    if (!meetingPoint.trim()) {
      Alert.alert('Meeting Point Required', 'Please specify where you\'ll be waiting to meet the requester.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call to:
      // 1. Send outfit + meeting point to the requester
      // 2. Remove the original notification
      // 3. Create "volunteer accepted" notification
      // 4. Update the volunteer's notification to history
      
      await new Promise(resolve => setTimeout(resolve, 2000));

      Alert.alert(
        'Request Accepted Successfully!',
        `Your acceptance has been sent to ${params?.userName || 'the requester'}. They will receive a notification with your outfit description and meeting location.\n\nYou will both receive each other's contact information shortly.`,
        [
          {
            text: 'View My Notifications',
            onPress: () => {
              // Navigate back to notifications to see updated status
              router.push('/(tabs)/notification');
            },
          },
          {
            text: 'Go to Home',
            onPress: () => {
              router.push('/');
            },
          },
        ]
      );

      // Simulate the backend creating a notification for the requester
      simulateNotificationCreation();

    } catch (error) {
      Alert.alert('Error', 'Failed to submit outfit description. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Simulated backend logic for notification updates
  const simulateNotificationCreation = () => {
    console.log('Creating notification for requester:', {
      type: 'volunteer_accepted',
      volunteerOutfit: outfitDescription,
      meetingPoint: meetingPoint,
      requestId: params?.requestId,
    });
    
    // Remove original notification from volunteer's alerts
    console.log('Removing original notification:', params?.notificationId);
    
    // Add to volunteer's history
    console.log('Adding to volunteer history: Request accepted');
  };

  // Suggested outfit descriptions for quick selection
  const suggestedOutfits = [
    'Blue jacket, holding a green umbrella',
    'Red backpack, wearing glasses',
    'Black hoodie, carrying a water bottle',
    'White t-shirt, blue jeans',
    'Grey sweater, yellow cap'
  ];

  // Suggested meeting points for quick selection
  const suggestedMeetingPoints = [
    'Main Library entrance',
    'Student Center lobby',
    'Bus stop near Main Gate',
    'Campus bookstore entrance',
    'Coffee shop on ground floor'
  ];

  // Autofill handler for suggestion taps
  const handleSuggestionPress = (suggestion: string, type: 'outfit' | 'meeting') => {
    if (type === 'outfit') {
      setOutfitDescription(suggestion);
    } else {
      setMeetingPoint(suggestion);
    }
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
            
            <Text className="text-white text-lg font-semibold">Volunteer Details</Text>
            
            <View className="p-2" />
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 px-4 py-6">
         {/* Success Message Card
            - Confirms volunteer acceptance
            - Prompts user to provide outfit and meeting details
        */}
        <View className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg mb-6">
          <View className="flex-row items-start">
            <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center mr-3 mt-1">
              <Ionicons name="checkmark-circle" size={24} color="#16a34a" />
            </View>
            <View className="flex-1">
              <Text className="text-green-800 font-bold text-lg mb-1">
                Thanks for accepting!
              </Text>
              <Text className="text-green-700 text-sm leading-relaxed">
                Please provide your outfit details and meeting location so {params?.userName || 'the requester'} can easily find and recognize you.
              </Text>
            </View>
          </View>
        </View>

        {/* Outfit Description Input Card
          - Text input for describing volunteer's appearance
          - Includes character counter and quick suggestions
      */}
        <View className="bg-white rounded-2xl p-6 shadow-sm mb-4">
          <Text className="text-lg font-bold text-gray-900 mb-4">What will you be wearing?</Text>
          
          <View className="mb-4">
            <Text className="text-gray-700 font-semibold mb-3">Outfit description:</Text>
            <View className="bg-gray-50 rounded-xl border border-gray-200 p-4">
              <TextInput
                className="text-gray-800 text-base min-h-[80px]"
                placeholder="Blue jacket, holding a green umbrella"
                placeholderTextColor="#9CA3AF"
                value={outfitDescription}
                onChangeText={setOutfitDescription}
                multiline={true}
                textAlignVertical="top"
                maxLength={200}
                autoCapitalize="sentences"
                autoCorrect={true}
              />
            </View>
            <Text className="text-gray-400 text-xs mt-2 text-right">
              {outfitDescription.length}/200 characters
            </Text>
          </View>

          {/* Outfit Suggestions */}
          <View className="mb-4">
            <Text className="text-gray-700 font-semibold mb-3">Quick outfit suggestions:</Text>
            <View className="flex-row flex-wrap">
              {suggestedOutfits.map((suggestion, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleSuggestionPress(suggestion, 'outfit')}
                  className="bg-blue-50 border border-blue-200 rounded-full px-3 py-2 mr-2 mb-2"
                  activeOpacity={0.7}
                >
                  <Text className="text-blue-700 text-sm">{suggestion}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Meeting Point Input Card
            - Text input for specifying where the volunteer will wait
            - Includes character counter and quick suggestions
        */}
        <View className="bg-white rounded-2xl p-6 shadow-sm mb-4">
          <Text className="text-lg font-bold text-gray-900 mb-4">Where will you wait?</Text>
          
          <View className="mb-4">
            <Text className="text-gray-700 font-semibold mb-3">Meeting location:</Text>
            <View className="bg-gray-50 rounded-xl border border-gray-200 p-4">
              <TextInput
                className="text-gray-800 text-base min-h-[60px]"
                placeholder="Main Library entrance"
                placeholderTextColor="#9CA3AF"
                value={meetingPoint}
                onChangeText={setMeetingPoint}
                multiline={true}
                textAlignVertical="top"
                maxLength={150}
                autoCapitalize="sentences"
                autoCorrect={true}
              />
            </View>
            <Text className="text-gray-400 text-xs mt-2 text-right">
              {meetingPoint.length}/150 characters
            </Text>
          </View>

          {/* Meeting Point Suggestions */}
          <View className="mb-4">
            <Text className="text-gray-700 font-semibold mb-3">Suggested meeting points:</Text>
            <View className="flex-row flex-wrap">
              {suggestedMeetingPoints.map((suggestion, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleSuggestionPress(suggestion, 'meeting')}
                  className="bg-green-50 border border-green-200 rounded-full px-3 py-2 mr-2 mb-2"
                  activeOpacity={0.7}
                >
                  <Text className="text-green-700 text-sm">{suggestion}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Important Info Card
          - Tips for visibility, safety, and coordination
      */}
        <View className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-lg mb-6">
          <View className="flex-row items-start">
            <Ionicons name="information-circle" size={20} color="#F59E0B" className="mt-1" />
            <View className="ml-3 flex-1">
              <Text className="text-amber-800 font-semibold mb-1">Important Tips:</Text>
              <Text className="text-amber-700 text-sm leading-relaxed">
                • Be as specific as possible with colors and distinctive features{'\n'}
                • Choose a well-lit, easily recognizable meeting point{'\n'}
                • Arrive at the meeting point 5 minutes early{'\n'}
                • Keep your phone charged and location sharing active{'\n'}
                • Contact the requester if your appearance changes
              </Text>
            </View>
          </View>
        </View>

        {/* Submit Button
          - Disabled until both fields are filled
          - Shows loading state while submitting
      */}
        <TouchableOpacity
          onPress={handleSubmitOutfit}
          disabled={isSubmitting || !outfitDescription.trim() || !meetingPoint.trim()}
          className={`py-4 px-6 rounded-xl shadow-sm ${
            isSubmitting || !outfitDescription.trim() || !meetingPoint.trim()
              ? 'bg-gray-400'
              : 'bg-green-500'
          }`}
          activeOpacity={0.8}
        >
          <View className="flex-row items-center justify-center">
            {isSubmitting ? (
              <Ionicons name="refresh" size={20} color="white" />
            ) : (
              <Ionicons name="send" size={20} color="white" />
            )}
            <Text className="ml-2 text-white font-bold text-lg">
              {isSubmitting ? 'Confirming Acceptance...' : 'Confirm & Send Details'}
            </Text>
          </View>
        </TouchableOpacity>
        
        {/* Post-submission Info
          - Explains what happens after confirmation
      */}
        <View className="mt-4 bg-gray-50 p-4 rounded-lg">
          <Text className="text-gray-600 text-sm text-center">
            After submitting, {params?.userName || 'the requester'} will receive a notification with your details. 
            You'll both get each other's contact information and can coordinate the meetup time.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default OutfitPromptScreen;