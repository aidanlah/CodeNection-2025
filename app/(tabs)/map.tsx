import { StyleSheet, View, Alert, ActivityIndicator, TouchableOpacity, Text } from "react-native";
import React, { useState } from 'react';
import MapView, { Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';

// Zoom level (smaller = more zoomed in)
const 
  LAT_ZOOM = 0.01,
  LONG_ZOOM = 0.01;

export default function mapPage() {
  const [region, setRegion] = useState<Region | null>(null);
  const [loading, setLoading] = useState(true);

  // Fallback region (MMU) in case location access fails
  const fallbackRegion: Region = {
    latitude: 2.9278,
    longitude: 101.6419,
    latitudeDelta: LAT_ZOOM,
    longitudeDelta: LONG_ZOOM,
  };

  const handleReportHazard = () => {
    if (region) {
      router.push({
        pathname: './hazardReport',
        params: {
          latitude: region.latitude.toString(),
          longitude: region.longitude.toString(),
        },
      });
    } else {
      router.push('./hazardReport');
    }
  };

  // Check location permission every time the screen is focused
  useFocusEffect(
    React.useCallback(() => {
      checkLocationPermissionAndGetLocation();
    }, [])
  );

  const checkLocationPermissionAndGetLocation = async () => {
    setLoading(true);
    
    try {
      // Check current permission status
      const { status } = await Location.getForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        // Permission not granted, prompt user
        Alert.alert(
          'Location Access Required',
          'GuardU needs access to your location to show nearby safety information and your current position on the map.',
          [
            {
              text: 'Cancel',
              onPress: () => {
                setRegion(fallbackRegion);
                setLoading(false);
              },
              style: 'cancel',
            },
            {
              text: 'Allow Location',
              onPress: async () => {
                await requestLocationPermission();
              },
            },
          ]
        );
      } else {
        // Permission already granted, get location
        await getCurrentLocation();
      }
    } catch (error) {
      console.error('Error checking location permission:', error);
      setRegion(fallbackRegion);
      setLoading(false);
    }
  };

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status === 'granted') {
        await getCurrentLocation();
      } else {
        Alert.alert(
          'Location Permission Denied',
          'Without location access, we\'ll show the default map view. You can enable location access in your device settings.',
          [
            {
              text: 'OK',
              onPress: () => {
                setRegion(fallbackRegion);
                setLoading(false);
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
      setRegion(fallbackRegion);
      setLoading(false);
    }
  };


  const getCurrentLocation = async () => {
    try {
      // Request permission to access location
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Location Permission Required',
          'Please enable location services to show your current location on the map.',
          [
            {
              text: 'OK',
              onPress: () => {
                // Use fallback region if permission denied
                setRegion(fallbackRegion);
                setLoading(false);
              }
            }
          ]
        );
        return;
      }

      // Get current position
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
      console.error('Error getting location:', error);
      Alert.alert(
        'Location Error',
        'Unable to get your current location. Using default location.',
        [
          {
            text: 'OK',
            onPress: () => {
              setRegion(fallbackRegion);
              setLoading(false);
            }
          }
        ]
      );
    }
  };

  // Don't render map until we have a region
  if (loading || !region) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#b7ccf6ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={region}
        showsUserLocation={true}
        showsMyLocationButton={true}
        followsUserLocation={true}
      />

      {/* Button */}
      <TouchableOpacity
        style={styles.reportButton}
        onPress={handleReportHazard}
      >
        <Text style={styles.reportButtonText}>Report Hazard</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  reportButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#ff6b6b',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  reportButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
});