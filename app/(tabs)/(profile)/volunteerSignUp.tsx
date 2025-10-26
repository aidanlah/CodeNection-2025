import { auth, db } from "@/firebase.config";
import { Ionicons } from '@expo/vector-icons';
import { onAuthStateChanged } from "firebase/auth";
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function VolunteerSignUpForm() {

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [helpOthersChecked, setHelpOthersChecked] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);

  // Firebase data fetching
  useEffect(() =>{
    const unsubscribe = onAuthStateChanged(auth, (user) =>{
      setCurrentUser(user);
    })
    return () => unsubscribe();
  },[])

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
    setSelectedAvatar(avatarOptions[index]);
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
      // update the user's volunteer status in Firebase
      if (!currentUser) {
        Alert.alert("Error", "User not authenticated");
        setIsLoading(false);
        return;
      }
      const userRef = doc(db, "users", currentUser.uid);
      await updateDoc(userRef, {
        isVolunteer: true,
        profilePicture: selectedAvatar,
        volunteerSignUpDate: serverTimestamp()
      });


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
      {/* Header */}

      <ScrollView className="flex-1 px-4 py-6">
        {/* Profile Picture Section */}
        <View className="bg-white rounded-lg p-6 shadow-sm mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-4 text-center">
            Profile Picture
          </Text>
          
          <View className="items-center mb-4">
            <View className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-4">
              {selectedAvatar ? (
                <Image 
                  source={{ uri: selectedAvatar }}
                  className="w-24 h-24 rounded-full"
                />
              ) : (
                <Ionicons name="person" size={48} color="#9CA3AF" />
              )}
            </View>
            
            {!selectedAvatar && (
              <Text className="text-gray-600 text-center mb-4 text-sm">
                Please select an avatar to help users identify you as a volunteer
              </Text>
            )}
            
            <TouchableOpacity 
              onPress={handleSelectAvatar}
              className="px-6 py-2 rounded-lg border border-gray-300"
              activeOpacity={0.8}
            >
              <Text className="text-gray-700 font-medium">
                {selectedAvatar ? "Change Avatar" : "Select Avatar"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Volunteer Commitment */}
        <View className="bg-white rounded-lg p-6 shadow-sm mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-4">
            Volunteer Commitment
          </Text>
          
          <TouchableOpacity 
            onPress={() => setHelpOthersChecked(!helpOthersChecked)}
            className="flex-row items-start mb-4"
            activeOpacity={0.8}
          >
            <View className="mr-3 mt-1">
              <Ionicons 
                name={helpOthersChecked ? "checkbox" : "square-outline"} 
                size={24} 
                color={helpOthersChecked ? "#16a34a" : "#9CA3AF"} 
              />
            </View>
            <Text className="flex-1 text-gray-700 text-base leading-6">
              I want to help others as a campus safety volunteer.
            </Text>
          </TouchableOpacity>
        </View>

        {/* Consent Section */}
        <View className="bg-white rounded-lg p-6 shadow-sm mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-4">
            Consent & Agreement
          </Text>
          
          <TouchableOpacity 
            onPress={() => setConsentChecked(!consentChecked)}
            className="flex-row items-start mb-4"
            activeOpacity={0.8}
          >
            <View className="mr-3 mt-1">
              <Ionicons 
                name={consentChecked ? "checkbox" : "square-outline"} 
                size={24} 
                color={consentChecked ? "#16a34a" : "#9CA3AF"} 
              />
            </View>
            <Text className="flex-1 text-gray-700 text-base leading-6">
              I agree to be contacted by users and take part in campus safety activities.
            </Text>
          </TouchableOpacity>
          
          <Text className="text-gray-500 text-sm mt-2">
            By checking this box, you consent to receiving notifications when users need assistance and agree to participate in campus safety initiatives.
          </Text>
        </View>

        {/* Sign Up Button */}
        <TouchableOpacity 
          onPress={handleSignUp}
          disabled={isLoading || !helpOthersChecked || !consentChecked}
          className="py-4 px-6 rounded-xl shadow-sm"
          style={{
            backgroundColor: isLoading || !helpOthersChecked || !consentChecked ? '#9CA3AF' : '#16a34a'
          }}
          activeOpacity={0.8}
        >
          <View className="flex-row items-center justify-center">
            {isLoading ? (
              <Ionicons name="refresh" size={20} color="#fff" />
            ) : (
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
            )}
            <Text className="ml-2 text-white font-bold text-lg">
              {isLoading ? 'Signing Up...' : 'Sign Up as Volunteer'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Info Section */}
        <View className="bg-blue-50 rounded-lg p-4 mt-6">
          <View className="flex-row items-start">
            <Ionicons name="information-circle" size={20} color="#3B82F6" />
            <View className="ml-3 flex-1">
              <Text className="text-blue-800 font-semibold mb-1">
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