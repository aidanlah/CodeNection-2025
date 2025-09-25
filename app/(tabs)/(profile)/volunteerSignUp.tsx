import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, Image, ScrollView, StatusBar, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
// import { auth } from "@/firebase.config";
// import { updateDoc, doc } from "firebase/firestore";

export default function VolunteerSignUpForm() {
  // Define user type
  interface User {
    displayName: string;
    profilePicture: string | null;
  }

  // Mock user data - replace with your Firebase data fetching
  const [user, setUser] = useState<User>({
    displayName: "Wade Warren",
    profilePicture: null, // Will be null initially
  });

  const [helpOthersChecked, setHelpOthersChecked] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Handle back navigation
  const handleGoBack = () => {
    console.log("Navigate back to profile page");
    // router.back(); or navigation.goBack();
  };

  // Avatar options
  const avatarOptions = [
    "https://ui-avatars.com/api/?name=W+W&background=16a34a&color=fff&size=200",
    "https://ui-avatars.com/api/?name=Wade+Warren&background=3b82f6&color=fff&size=200", 
    "https://ui-avatars.com/api/?name=V+W&background=ef4444&color=fff&size=200",
    "https://ui-avatars.com/api/?name=Student&background=8b5cf6&color=fff&size=200",
    "https://ui-avatars.com/api/?name=Helper&background=f59e0b&color=fff&size=200"
  ];

  // Select avatar helper function
  const selectAvatar = (index: number) => {
    if (index >= 0 && index < avatarOptions.length) {
      setUser(prev => ({
        ...prev, 
        profilePicture: avatarOptions[index]
      }));
    }
  };

  // Handle avatar selection (since we can't upload images)
  const handleSelectAvatar = () => {
    Alert.alert(
      "Select Avatar",
      "Choose an avatar to represent you",
      [
        {
          text: "Green Avatar",
          onPress: () => selectAvatar(0)
        },
        {
          text: "Blue Avatar", 
          onPress: () => selectAvatar(1)
        },
        {
          text: "Red Avatar",
          onPress: () => selectAvatar(2)
        },
        {
          text: "Purple Avatar",
          onPress: () => selectAvatar(3)
        },
        {
          text: "Random Avatar",
          onPress: () => selectAvatar(Math.floor(Math.random() * avatarOptions.length))
        },
        {
          text: "Cancel",
          style: "cancel"
        }
      ]
    );
  };

  // Handle volunteer sign up
  const handleSignUp = async () => {
    if (!helpOthersChecked) {
      Alert.alert("Required", "Please confirm that you want to help others as a campus safety volunteer.");
      return;
    }

    if (!consentChecked) {
      Alert.alert("Required", "Please agree to be contacted by users and take part in campus safety activities.");
      return;
    }

    setIsLoading(true);

    try {
      // Here you would update the user's volunteer status in Firebase
      // const userRef = doc(db, "users", auth.currentUser.uid);
      // await updateDoc(userRef, {
      //   isVolunteer: true,
      //   profilePicture: user.profilePicture,
      //   volunteerSignUpDate: new Date()
      // });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      Alert.alert(
        "Success!",
        "You have successfully signed up as a campus safety volunteer. Welcome to the team!",
        [
          {
            text: "OK",
            onPress: () => {
              console.log("Navigate back to profile");
              // Navigate back to profile page
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to sign up as volunteer. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="light-content" backgroundColor="#F9FAFB" />
      
      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: -10, paddingBottom: 32 }}
      >
        {/* Profile Picture Section */}
        <View className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <Text className="text-xl font-bold text-gray-900 mb-6 text-center">
            Profile Picture
          </Text>
          
          <View className="items-center mb-6">
            <View className="w-28 h-28 bg-gray-200 rounded-full flex items-center justify-center mb-4">
              {user.profilePicture ? (
                <Image 
                  source={{ uri: user.profilePicture }}
                  className="w-28 h-28 rounded-full"
                />
              ) : (
                <Ionicons name="person" size={56} color="#9CA3AF" />
              )}
            </View>
            
            {!user.profilePicture && (
              <Text className="text-gray-600 text-center mb-4 text-sm px-4 leading-5">
                Please select an avatar to help users identify you as a volunteer
              </Text>
            )}
            
            <TouchableOpacity 
              onPress={handleSelectAvatar}
              className="px-6 py-3 rounded-lg border border-gray-300 bg-gray-50"
              activeOpacity={0.8}
            >
              <Text className="text-gray-700 font-semibold">
                {user.profilePicture ? "Change Avatar" : "Select Avatar"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Volunteer Commitment */}
        <View className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <Text className="text-xl font-bold text-gray-900 mb-6">
            Volunteer Commitment
          </Text>
          
          <TouchableOpacity 
            onPress={() => setHelpOthersChecked(!helpOthersChecked)}
            className="flex-row items-start"
            activeOpacity={0.8}
          >
            <View className="mr-4 mt-1">
              <Ionicons 
                name={helpOthersChecked ? "checkbox" : "checkmark-outline"} 
                size={18} 
                color={helpOthersChecked ? "#16a34a" : "#9CA3AF"} 
              />
            </View>
            <Text className="flex-1 text-gray-700 text-base leading-6">
              I want to help others as a campus safety volunteer.
            </Text>
          </TouchableOpacity>
        </View>

        {/* Consent Section */}
        <View className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <Text className="text-xl font-bold text-gray-900 mb-6">
            Consent & Agreement
          </Text>
          
          <TouchableOpacity 
            onPress={() => setConsentChecked(!consentChecked)}
            className="flex-row items-start mb-4"
            activeOpacity={0.8}
          >
            <View className="mr-4 mt-1">
              <Ionicons 
                name={consentChecked ? "checkbox" : "checkmark-outline"} 
                size={18} 
                color={consentChecked ? "#16a34a" : "#9CA3AF"} 
              />
            </View>
            <Text className="flex-1 text-gray-700 text-base leading-6">
              I agree to be contacted by users and take part in campus safety activities.
            </Text>
          </TouchableOpacity>
          
          <Text className="text-gray-500 text-sm leading-5 pl-8">
            By checking this box, you consent to receiving notifications when users need assistance and agree to participate in campus safety initiatives.
          </Text>
        </View>

        {/* Sign Up Button */}
        <TouchableOpacity 
          onPress={handleSignUp}
          disabled={isLoading || !helpOthersChecked || !consentChecked}
          className="py-4 px-6 rounded-xl shadow-sm mb-6"
          style={{
            backgroundColor: isLoading || !helpOthersChecked || !consentChecked ? '#9CA3AF' : '#16a34a'
          }}
          activeOpacity={0.8}
        />
          <View className="flex-row items-center justify-center">
            {isLoading ? (
              <Ionicons name="refresh" size={20} color="#fff" />
            ) : (
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
            )}
            <Text className="ml-2 text-white font-bold text-lg">
              {isLoading ? 'Signing Up...' : 'Sign Up as Volunteer'}
        <View className="flex-row justify-center mt-4">
          <TouchableOpacity
            onPress={handleSignUp}
            disabled={isLoading || !helpOthersChecked || !consentChecked}
            className="px-4 py-2 rounded-full"
            style={{
              backgroundColor: isLoading || !helpOthersChecked || !consentChecked ? '#9CA3AF' : '#16a34a',
              minWidth: 160
            }}
            activeOpacity={0.8}
          >
            <Text className="text-white font-medium text-sm text-center">
              {isLoading ? 'Signing Up...' : 'Sign Up'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Info Section */}
        <View className="bg-blue-50 rounded-xl p-5">
          <View className="flex-row items-start">
            <Ionicons name="information-circle" size={22} color="#3B82F6" />
            <View className="ml-3 flex-1">
              <Text className="text-blue-800 font-bold mb-2 text-base">
                What does being a volunteer mean?
              </Text>
              <Text className="text-blue-700 text-sm leading-5">
                As a campus safety volunteer, you'll help fellow students by responding to safety requests, participating in campus patrols, and contributing to a safer campus environment.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}