import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

interface LocationInputProps {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  iconName: keyof typeof Ionicons.glyphMap;
}

const LocationInput: React.FC<LocationInputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  iconName,
}) => {
  return (
    <View className="mb-6">
      <Text className="text-gray-700 font-semibold mb-2 text-base">{label}</Text>
      <View className="flex-row items-center bg-white rounded-xl border border-gray-200 px-4 py-4 shadow-sm">
        <Ionicons name={iconName} size={20} color="#6B7280" />
        <TextInput
          className="flex-1 ml-3 text-gray-800 text-base"
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          value={value}
          onChangeText={onChangeText}
          autoCapitalize="words"
          autoCorrect={false}
        />
      </View>
    </View>
  );
};

const JourneyPlannerPage: React.FC = () => {
  const [startingLocation, setStartingLocation] = useState<string>('');
  const [destination, setDestination] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleGoBack = (): void => {
    router.back();
  };

  const handleSwapLocations = (): void => {
    const temp = startingLocation;
    setStartingLocation(destination);
    setDestination(temp);
  };

  const handleCurrentLocation = (): void => {
    setStartingLocation('Current Location');
    Alert.alert('Location', 'Using your current location');
  };

  const handleStartJourney = async (): Promise<void> => {
    if (!startingLocation.trim() || !destination.trim()) {
      Alert.alert('Error', 'Please enter both starting location and destination');
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate API call or navigation setup
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      Alert.alert(
        'Journey Started',
        `From: ${startingLocation}\nTo: ${destination}`,
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigate to map or tracking screen
              console.log('Journey started:', { startingLocation, destination });
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to start journey. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    
    <View className="flex-1 bg-gray-50">
      
       <ScrollView className="flex-1 px-4 py-6">
        <View className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <LocationInput
            label="Starting Location"
            placeholder="Enter starting point"
            value={startingLocation}
            onChangeText={setStartingLocation}
            iconName="location"
          />

          <View className="items-center mb-6">
            <TouchableOpacity
              onPress={handleSwapLocations}
              className="bg-gray-100 p-3 rounded-full"
              activeOpacity={0.7}
            >
              <Ionicons name="swap-vertical" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <LocationInput
            label="Destination"
            placeholder="Enter destination"
            value={destination}
            onChangeText={setDestination}
            iconName="flag"
          />

          <TouchableOpacity
            onPress={handleCurrentLocation}
            className="flex-row items-center justify-center bg-blue-50 py-3 px-4 rounded-xl mb-6"
            activeOpacity={0.7}
          >
            <Ionicons name="locate" size={20} color="#3B82F6" />
            <Text className="ml-2 text-blue-600 font-semibold">
              Use Current Location
            </Text>
          </TouchableOpacity>
        </View>

        <View className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <Text className="text-lg font-bold text-gray-900 mb-4">
            Safety Features
          </Text>
          
          <View className="space-y-3">
            <View className="flex-row items-center">
              <Ionicons name="shield-checkmark" size={20} color="#10B981" />
              <Text className="ml-3 text-gray-700">Real-time location sharing</Text>
            </View>
            
            <View className="flex-row items-center">
              <Ionicons name="people" size={20} color="#10B981" />
              <Text className="ml-3 text-gray-700">Buddy tracking enabled</Text>
            </View>
            
            <View className="flex-row items-center">
              <Ionicons name="warning" size={20} color="#10B981" />
              <Text className="ml-3 text-gray-700">Hazard alerts on route</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleStartJourney}
          disabled={isLoading || !startingLocation.trim() || !destination.trim()}
          className={`py-4 px-6 rounded-xl shadow-sm ${
            isLoading || !startingLocation.trim() || !destination.trim()
              ? 'bg-gray-400'
              : 'bg-green-500 active:scale-98'
          }`}
          activeOpacity={0.8}
        >
          <View className="flex-row items-center justify-center">
            {isLoading ? (
              <Ionicons name="refresh" size={20} color="#fff" />
            ) : (
              <Ionicons name="navigate" size={20} color="#fff" />
            )}
            <Text className="ml-2 text-white font-bold text-lg">
              {isLoading ? 'Planning Route...' : 'Start Journey'}
            </Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
    
  );
};

export default JourneyPlannerPage;