import { auth } from "@/firebase.config";
import { SessionManager } from "@/services/sessionManager";
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { signOut } from "firebase/auth";
import React, { useState } from 'react';
import { Alert, Image, ScrollView, StatusBar, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfilePage() {

  const router = useRouter();
  
  // Mock user data - replace with your Firebase data fetching
  const [user, setUser] = useState({
    displayName: "User name",
    fullName: "User name",
    studentID: "Student number",
    profilePicture: null,
    emergencyContacts: [
      {
        name: "Example name",
        phone: "+60123456789",
        relationship: "Father"
      }
    ],
    isVolunteer: false
  });

  const [isVolunteering, setIsVolunteering] = useState(false);

  const handleLogout = async (): Promise<void> => {
    try {
      await SessionManager.clearSession();
      await signOut(auth);
      console.log("user logged out");
      // navigate to login screen after successful logout
      router.replace('/sign-in'); 
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  // Function to handle volunteer toggle
  const handleVolunteerToggle = () => {
    setIsVolunteering(!isVolunteering);
    // Here you would update the user's volunteer status in Firebase
    setUser(prev => ({
      ...prev,
      isVolunteer: !prev.isVolunteer
    }));
  };

  // Function to handle becoming a volunteer
  const handleBecomeVolunteer = () => {
    router.push('./volunteerSignUp');
  };

  // Function to handle adding emergency contact
  const handleAddEmergencyContact = () => {
    router.push('./emergencyContacts');
  };

  // Function to handle viewing volunteer records
  const handleViewRecords = () => {
    console.log("Navigate to volunteer records");
  };

  return (

    <View style={{ flex: 1, backgroundColor: '#16a34a' }}>
      <StatusBar barStyle="light-content" backgroundColor="#16a34a" />
      
      <SafeAreaView style={{ flex: 1, backgroundColor: 'transparent' }}>

        {/* This is your header content with the green background */}
        <View className="px-4 py-6 relative pt-4">
          <Text className="text-2xl font-semibold text-center text-white mb-6">
            Personal Profile
          </Text>
          <TouchableOpacity 
            onPress={handleLogout}
            className="absolute top-4 right-4 bg-red-500 px-3 py-1 rounded"
            activeOpacity={0.8}
          >
            <View className="flex-row items-center">
              <Ionicons name="log-out" size={16} color="white" />
              <Text className="text-white text-sm font-medium ml-1">
                Logout
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* The rest of your content goes here, inside the ScrollView */}
        <ScrollView className="flex-1 bg-gray-50 rounded-t-lg">
          {/* Profile Picture and Name - Below the green header */}
          <View className="bg-white rounded-lg p-6 shadow-sm mx-4 mt-6 mb-6">
            <View className="items-center">
              <View className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                {user.profilePicture ? (
                  <Image 
                    source={{ uri: user.profilePicture }} 
                    className="w-20 h-20 rounded-full"
                  />
                ) : (
                  <Ionicons name="person" size={40} color="#9CA3AF" />
                )}
              </View>
              <Text className="text-xl font-semibold text-gray-900 mb-1">
                {user.displayName}
              </Text>
              <Text className="text-gray-500 text-sm">{user.studentID}</Text>
            </View>
          </View>

          {/* Emergency Contacts */}
          <View className="bg-white rounded-lg shadow-sm mb-6 mx-4">
            <View className="p-4 border-b border-gray-100 flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Ionicons name="call" size={20} color="#16a34a" />
                <Text className="text-lg font-semibold text-gray-900 ml-2">
                  Emergency Contacts
                </Text>
              </View>
              <TouchableOpacity onPress={handleAddEmergencyContact} activeOpacity={0.7}>
                <Text className="text-sm font-medium text-green-600">Edit</Text>
              </TouchableOpacity>
            </View>

            <View className="p-4">
              {user.emergencyContacts && user.emergencyContacts.length > 0 ? (
                user.emergencyContacts.map((contact, index) => (
                  <View key={index} className="flex-row items-center justify-between py-3 border-b border-gray-50">
                    <View className="flex-row items-center flex-1">
                      <View className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                        <Ionicons name="person" size={20} color="#9CA3AF" />
                      </View>
                      <View className="flex-1">
                        <Text className="font-medium text-gray-900">{contact.name}</Text>
                        <Text className="text-sm text-gray-500">{contact.relationship}</Text>
                      </View>
                    </View>
                    <Text className="text-sm text-gray-600">{contact.phone}</Text>
                  </View>
                ))
              ) : (
                <View className="items-center py-6">
                  <Text className="text-gray-500 mb-2">No emergency contacts added</Text>
                  <TouchableOpacity onPress={handleAddEmergencyContact}>
                    <Text className="text-sm font-medium" style={{color: '#16a34a'}}>
                      Add Emergency Contact
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>

          {/* Volunteering Section */}
          <View className="bg-white rounded-lg shadow-sm mb-6 mx-4">
            <View className="p-4 border-b border-gray-100">
              <View className="flex-row items-center">
                <Ionicons name="people" size={20} color="#16a34a" />
                <Text className="text-lg font-semibold text-gray-900 ml-2">
                  Volunteering
                </Text>
              </View>
            </View>
            
            <View className="p-4">
              {user.isVolunteer ? (
                <View>
                  <View className="flex-row items-center justify-between mb-4">
                    <Text className="text-gray-700">Volunteering</Text>
                    <TouchableOpacity onPress={handleVolunteerToggle}>
                      <View className={`w-12 h-6 rounded-full ${isVolunteering ? 'bg-blue-500' : 'bg-gray-300'}`} style={isVolunteering ? {backgroundColor: '#16a34a'} : {}}>
                        <View className={`w-5 h-5 bg-white rounded-full mt-0.5 ${isVolunteering ? 'ml-6' : 'ml-0.5'}`} />
                      </View>
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity 
                    onPress={handleViewRecords}
                    className="flex-row items-center justify-between p-2 rounded hover:bg-gray-50"
                    activeOpacity={0.7}
                  >
                    <Text className="text-gray-700">View Records</Text>
                    <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity 
                  onPress={handleBecomeVolunteer}
                  className="w-full py-3 px-4 rounded-lg flex-row items-center justify-center"
                  style={{backgroundColor: '#16a34a'}}
                  activeOpacity={0.8}
                >
                  <Ionicons name="heart" size={20} color="white" />
                  <Text className="text-white font-medium ml-2">
                    Become a Volunteer
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}