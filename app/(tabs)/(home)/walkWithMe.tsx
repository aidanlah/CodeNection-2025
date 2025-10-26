import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  ActivityIndicator,
  Image,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import MapView, { Marker, Region } from "react-native-maps";
import * as Location from "expo-location";
import {
  addDoc,
  collection,
  GeoPoint,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "@/firebase.config";
import { useFocusEffect } from "@react-navigation/native";

// Props for reusable location input component
interface LocationInputProps {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  iconName: keyof typeof Ionicons.glyphMap;
}

// Data model for BuddyUp request stored in Firestore
interface BuddyUp {
  createdAt: any;
  destination: GeoPoint;
  startLocation: GeoPoint;
  hasVolunteer: boolean;
  status: string;
  userId: string;
  type: string;
}

// Reusable input field with icon, label, and styled container
// Used for entering location names or descriptions
const LocationInput: React.FC<LocationInputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  iconName,
}) => {
  return (
    <View className="mb-6">
      <Text className="text-gray-700 font-semibold mb-2 text-base">
        {label}
      </Text>
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

// Map zoom levels for latitude and longitude
const LAT_ZOOM = 0.01,
  LONG_ZOOM = 0.01;

// walkWithMePage: lets users pin start and destination points on a map
// Submits a BuddyUp request to Firestore with location metadata
export default function walkWithMePage() {
  // Track current location, pinned points, map region, and submission states
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [startPoint, setStartPoint] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [destination, setDestination] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [region, setRegion] = useState<Region | null>(null);
  const [submitBuddyUp, setSubmitBuddyUp] = useState(false);
  const [submitTrack, setSubmitTrack] = useState(false);

  // Default map region (MMU campus) used when location access is denied
  const fallbackRegion: Region = {
    latitude: 2.9278,
    longitude: 101.6419,
    latitudeDelta: LAT_ZOOM,
    longitudeDelta: LONG_ZOOM,
  };

  // Check location permission and initialize map region
  // Prompts user to allow access or fallback to default
  const checkLocationPermissionAndGetLocation = async () => {
    setLoading(true);
    try {
      const { status: currentStatus } =
        await Location.getForegroundPermissionsAsync();
      if (currentStatus !== "granted") {
        Alert.alert(
          "Location Access Required",
          "GuardU needs access to your location to show nearby safety information and your current position on the map.",
          [
            {
              text: "Cancel",
              onPress: () => {
                setRegion(fallbackRegion);
                setLoading(false);
              },
              style: "cancel",
            },
            {
              text: "Allow Location",
              onPress: async () => {
                await requestLocationPermission();
              },
            },
          ]
        );
      } else {
        await getCurrentLocation();
      }
    } catch (error) {
      console.error("Error checking location permission:", error);
      setRegion(fallbackRegion);
      setLoading(false);
    }
  };

  // Request location permission from user
  // If granted, fetch current GPS location
  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        await getCurrentLocation();
      } else {
        Alert.alert(
          "Location Permission Denied",
          "Without location access, we'll show the default map view. You can enable location access in your device settings.",
          [
            {
              text: "OK",
              onPress: () => {
                setRegion(fallbackRegion);
                setLoading(false);
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error("Error requesting location permission:", error);
      setRegion(fallbackRegion);
      setLoading(false);
    }
  };

  // Get user's current GPS location and update map region
  // Falls back to default if location fails
  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Location Permission Required",
          "Please enable location services to show your current location on the map.",
          [
            {
              text: "OK",
              onPress: () => {
                setRegion(fallbackRegion);
                setLoading(false);
              },
            },
          ]
        );
        return;
      }
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const currentRegion: Region = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: LAT_ZOOM,
        longitudeDelta: LONG_ZOOM,
      };
      setLocation(location.coords);
      setRegion(currentRegion);
      setLoading(false);
    } catch (error) {
      console.error("Error getting location:", error);
      Alert.alert(
        "Location Error",
        "Unable to get your current location. Using default location.",
        [
          {
            text: "OK",
            onPress: () => {
              setRegion(fallbackRegion);
              setLoading(false);
            },
          },
        ]
      );
    }
  };

  // Run location check every time screen comes into focus
  useFocusEffect(
    useCallback(() => {
      checkLocationPermissionAndGetLocation();
    }, [])
  );

  // Handle map taps to place start and destination markers
  // Resets if both are already placed
  const handleMapPress = (event: any) => {
    const { coordinate } = event.nativeEvent;

    if (!startPoint) {
      setStartPoint(coordinate); // First tap → set start point
    } else if (!destination) {
      setDestination(coordinate);  // Second tap → set destination
    } else {
      setStartPoint(coordinate); // Third tap → reset: new start point
      setDestination(null); // Clear old destination
    }
  };

  // Use current GPS location as start point
  const useCurrent = () => {
    setStartPoint(location);
  };

  // Clear both markers from the map
  const clearMarkers = () => {
    setStartPoint(null);
    setDestination(null);
  };

  // Submit BuddyUp request to Firestore
  // Includes start/destination GeoPoints and user metadata
  const handleBuddyUp = async () => {
    if (!startPoint) {
      Alert.alert("Error", "Please pin a start point");
      return;
    }
    if (!destination) {
      Alert.alert("Error", "Please pin a destination");
      return;
    }
    if (!auth.currentUser) {
      Alert.alert("Error", "You must be logged in to report a hazard");
      return;
    }

    setSubmitBuddyUp(true);

    try {
      const start = new GeoPoint(startPoint.latitude, startPoint.longitude);
      const dest = new GeoPoint(destination.latitude, destination.longitude);

      const buddyUp: BuddyUp = {
        createdAt: serverTimestamp(),
        destination: dest,
        hasVolunteer: false,
        startLocation: start,
        status: "pending",
        userId: auth.currentUser.uid,
        type: "buddyUp",
      };

      console.log("Submitting buddyup request:", buddyUp);

      await addDoc(collection(db, "buddyUp"), buddyUp);

      Alert.alert("Request Submitted", "Waiting for volunteer", [
        {
          text: "OK",
          // onPress: () => router.back(),
        },
      ]);
      // Handle Firestore errors gracefully:
      // - permission-denied → user not logged in
      // - invalid-argument → missing or malformed data
    } catch (error: any) {
      console.error("Error submitting request:", error.message);
      let errorMessage = "Failed to submit request. Please try again.";
      if (error.code === "permission-denied") {
        errorMessage =
          "Permission denied. Please check your login status and try again.";
      } else if (error.code === "invalid-argument") {
        errorMessage =
          "Invalid data provided. Please check all fields and try again.";
      }
      Alert.alert("Error", errorMessage);
    } finally {
      setSubmitBuddyUp(false);
    }
  };

  // Submit Safe Track request to Firestore
  // Includes start/destination GeoPoints and user metadata
  const handleSafeTrack = async () => {
    // Validate required fields before submitting
    if (!startPoint) {
      Alert.alert("Error", "Please pin a start point");
      return;
    }
    if (!destination) {
      Alert.alert("Error", "Please pin a destination");
      return;
    }
    if (!auth.currentUser) {
      Alert.alert("Error", "You must be logged in to report a hazard");
      return;
    }

    setSubmitTrack(true);

    try {
      // Convert coordinates to Firestore GeoPoints
      const start = new GeoPoint(startPoint.latitude, startPoint.longitude);
      const dest = new GeoPoint(destination.latitude, destination.longitude);

      // Construct Safe Track request object
      const buddyUp: BuddyUp = {
        createdAt: serverTimestamp(),
        destination: dest,
        hasVolunteer: false,
        startLocation: start,
        status: "pending",
        userId: auth.currentUser.uid,
        type: "safeTrack",
      };

      console.log("Submitting Safe Track request:", buddyUp);

      await addDoc(collection(db, "buddyUp"), buddyUp);

      // Confirmation alert
      Alert.alert(
        "Request Submitted",
        "Sharing location with trusted buddies",
        [
          {
            text: "OK",
            // onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      console.error("Error submitting request:", error.message);
      let errorMessage = "Failed to submit request. Please try again.";
      if (error.code === "permission-denied") {
        errorMessage =
          "Permission denied. Please check your login status and try again.";
      } else if (error.code === "invalid-argument") {
        errorMessage =
          "Invalid data provided. Please check all fields and try again.";
      }
      Alert.alert("Error", errorMessage);
    } finally {
      setSubmitTrack(false);// Re-enable button after submission
    }
  };

  // Show loading spinner while location or region is being initialized
  if (loading || !region) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#b7ccf6ff" />
      </View>
    );
  }
  return (
    <View className=" relative flex-1 items-center">
      {/* Floating instruction bubble at top of screen
        Informs user to tap on the map to place pins */}
      <View className="p-[15] absolute bg-white z-40 top-[5px] rounded-full justify-center items-center ">
        <Text className="">Tap on map</Text>
      </View>
       {/* MapView shows current region and listens for user taps to place markers
      Displays "Start Point" and "Destination" markers based on user input */}
      <MapView
        style={styles.map}
        region={region}
        onPress={handleMapPress}
        showsUserLocation={true}
        showsMyLocationButton={true}
        followsUserLocation={true}
      >
        {startPoint && (
          <Marker
            coordinate={startPoint}
            title="Start Point"
            pinColor="orange"
          />
        )}

        {destination && (
          <Marker coordinate={destination} title="Destination" pinColor="red" />
        )}
      </MapView>

<View className="w-full h-1/3 absolute bottom-2 rounded-t-[50px] bg-green-500 "></View>
      {/* Bottom sheet with action buttons and location controls */}
        <View className="w-full h-1/3 absolute bottom-0 bg-white rounded-t-[50px] z-40 flex-1 items-center justify-center">
        {/*  "My location" button sets startPoint to current GPS location
         "Reset" button clears both startPoint and destination markers */}
          <View className="flex flex-row gap-2">
            <TouchableOpacity
              className="w-32 border-2 rounded-[10px] p-[15] border-[#FFD66B] items-center"
              onPress={useCurrent}
            >
              <Text className="text-gray-600 text-base">My location</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="w-32 border-2 rounded-[10px] p-[15] border-red-300 items-center"
              onPress={clearMarkers}
            >
              <Text className="text-gray-600 text-base">Reset</Text>
            </TouchableOpacity>
          </View>

          <View className="flex flex-row gap-2 mt-5">
            {/*  BuddyUp button: submits a request for a walking companion
             Shows loading spinner while submitting */}
            <TouchableOpacity
              className="size-32 bg-[#DDF4E7] rounded-[10px] p-[15] border-gray-500 items-center justify-center"
              onPress={handleBuddyUp}
              disabled={submitBuddyUp}
            >
              {submitBuddyUp ? (
                <ActivityIndicator color="white" />
              ) : (
                <View className="flex-1 items-center justify-center w-full">
                  <Image
                    source={require("@/assets/images/buddy.png")}
                    className="w-3/4 h-3/4 rounded-3xl mb-1"
                    resizeMode="cover"
                  ></Image>
                  <Text className="text-gray-600 text-base font-bold">
                    BuddyUp
                  </Text>
                </View>
              )}
            </TouchableOpacity>

              {/* Safe Track button: shares location with trusted buddies
            Shows loading spinner while submitting */}
            <TouchableOpacity
              className="size-32 bg-[#DDF4E7] rounded-[10px] p-[15] border-gray-500 items-center justify-center"
              onPress={handleSafeTrack}
              disabled={submitTrack}
            >
              {submitTrack ? (
                <ActivityIndicator color="white" />
              ) : (
                <View className="flex-1 items-center justify-center w-full">
                  <Image
                    source={require("@/assets/images/track.png")}
                    className="w-3/4 h-3/4 rounded-3xl mb-1"
                    resizeMode="cover"
                  ></Image>
                  <Text className="text-gray-600 text-base font-bold">
                    Safe Track
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: "100%",
    height: "100%",
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
});
