import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import MapView, { Marker, Region } from "react-native-maps";
import * as Location from "expo-location";
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

const LAT_ZOOM = 0.01,
  LONG_ZOOM = 0.01;

export default function walkWithMePage() {
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

  const fallbackRegion: Region = {
    latitude: 2.9278,
    longitude: 101.6419,
    latitudeDelta: LAT_ZOOM,
    longitudeDelta: LONG_ZOOM,
  };

  const checkLocationPermissionAndGetLocation = async () => {
    setLoading(true);
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== "granted") {
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

  useEffect(() => {
    checkLocationPermissionAndGetLocation();
  }, []);

  const handleMapPress = (event: any) => {
    const { coordinate } = event.nativeEvent;

    if (!startPoint) {
      setStartPoint(coordinate);
    } else if (!destination) {
      setDestination(coordinate);
    } else {
      // Reset both points
      setStartPoint(coordinate);
      setDestination(null);
    }
  };

  if (loading || !region) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#b7ccf6ff" />
      </View>
    );
  }
  return (
    <View className="flex-1">
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
            pinColor="green"
          />
        )}

        {destination && (
          <Marker
            coordinate={destination}
            title="Destination"
            pinColor="red"
          />
        )}
      </MapView>
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
