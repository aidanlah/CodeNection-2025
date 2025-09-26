import { StyleSheet, View, Alert, ActivityIndicator, TouchableOpacity, Text } from "react-native";
import React, { useState, useCallback } from 'react';
import MapView, { Region, Marker, Callout } from 'react-native-maps';
import * as Location from 'expo-location';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/firebase.config';
import { Ionicons } from '@expo/vector-icons';
import { toggleUpvote } from './(home)/hazardReport';

const LAT_ZOOM = 0.01, LONG_ZOOM = 0.01;

export default function mapPage() {
  const [region, setRegion] = useState<Region | null>(null);
  const [loading, setLoading] = useState(true);
  const [hazardReports, setHazardReports] = useState<any[]>([]);

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

  // Fetch hazard reports from Firestore
  const fetchHazardReports = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'hazardReports'));
      const reports = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          latitude: data.location.latitude,
          longitude: data.location.longitude,
          hazardType: data.hazardType,
          severity: data.severity,
          description: data.description,
          upvotes: data.upvotes || 0,
          upvotedBy: data.upvotedBy || [],
        };
      });
      setHazardReports(reports);
    } catch (error) {
      console.error('Error fetching hazard reports:', error);
    }
  };

  const handleUpvote = async (reportId: string, currentUpvotedBy: string[]) => {
    try {
      await toggleUpvote(reportId, currentUpvotedBy);
      // Refresh the reports to get updated counts
      await fetchHazardReports();
    } catch (error) {
      Alert.alert('Error', 'Failed to update upvote. Please try again.');
    }
  };

  useFocusEffect(
    useCallback(() => {
      checkLocationPermissionAndGetLocation();
      fetchHazardReports();
    }, [])
  );

  const checkLocationPermissionAndGetLocation = async () => {
    setLoading(true);
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Location Access Required',
          'GuardU needs access to your location to show nearby safety information and your current position on the map.',
          [
            {
              text: 'Use Default Location',
              style: 'cancel',
              onPress: () => {
                setRegion(fallbackRegion);
                setLoading(false);
              },
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
      >
        {/* Render hazard report markers */}
        {hazardReports.map(report => (
          <Marker
            key={report.id}
            coordinate={{
              latitude: report.latitude,
              longitude: report.longitude,
            }}
            title={report.hazardType}
            description={`${report.severity.toUpperCase()}: ${report.description}`}
            pinColor={
              report.severity === 'critical' ? '#EF4444' :
              report.severity === 'moderate' ? '#F59E0B' :
              '#10B981'
            }
          >
            {/* Custom callout with upvote button */}
            <Callout onPress={() => handleUpvote(report.id, report.upvotedBy)}>
              <View style={styles.calloutContainer}>
                <Text style={styles.calloutTitle}>{report.hazardType}</Text>
                <Text style={styles.calloutDescription}>{report.description}</Text>
                <View style={styles.upvoteContainer}>
                  <Ionicons name="thumbs-up" size={16} color="#666" />
                  <Text style={styles.upvoteText}>{report.upvotes}</Text>
                  <Text style={styles.upvoteAction}>Tap to upvote</Text>
                </View>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

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
  calloutContainer: {
    width: 200,
    padding: 10,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  calloutDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  upvoteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  upvoteText: {
    marginLeft: 5,
    fontSize: 14,
    fontWeight: '600',
  },
  upvoteAction: {
    marginLeft: 10,
    fontSize: 12,
    color: '#007AFF',
  },
});