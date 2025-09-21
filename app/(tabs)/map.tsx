import { StyleSheet, View, Alert, ActivityIndicator } from "react-native";
import React, {useState, useEffect} from 'react';
import MapView, { Region } from 'react-native-maps';
import * as Location from 'expo-location';

export default function mapPage() {
  const [region, setRegion] = useState<Region | null>(null);
  const [loading, setLoading] = useState(true);

  // Fallback region (MMU) in case location access fails
  const fallbackRegion: Region = {
    latitude: 2.9278,
    longitude: 101.6419,
    latitudeDelta: 0.01, // Zoom level (smaller = more zoomed in)
    longitudeDelta: 0.01, // Zoom level (smaller = more zoomed in)
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

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
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
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
});