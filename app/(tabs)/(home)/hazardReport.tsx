import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import MapView, { Marker, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { collection, addDoc, serverTimestamp, GeoPoint, doc, updateDoc, arrayUnion, arrayRemove, increment } from 'firebase/firestore';
import { auth, db } from '@/firebase.config';

interface HazardReport {
  location: GeoPoint;
  description: string;
  hazardType: string;
  reportedBy: string;
  timestamp: any;
  severity: string;
  upvotes: number;
  upvotedBy: string[];
}

const HAZARD_TYPES = [
  'Poor Lighting',
  'Broken Infrastructure',
  'Suspicious Activity',
  'Unsafe Area',
  'Other'
];

const SEVERITY_LEVELS = [
  { value: 'low', label: 'Low', color: '#10B981', description: 'Minor concern' },
  { value: 'moderate', label: 'Moderate', color: '#F59E0B', description: 'Needs attention' },
  { value: 'critical', label: 'Critical', color: '#EF4444', description: 'Immediate action required' }
];

export const toggleUpvote = async (reportId: string, currentUpvotedBy: string[]) => {
  if (!auth.currentUser) {
    throw new Error('Must be logged in to upvote');
  }

  const userId = auth.currentUser.uid;
  const reportRef = doc(db, 'hazardReports', reportId);
  
  const hasUpvoted = currentUpvotedBy.includes(userId);

  try {
    if (hasUpvoted) {
      // Remove upvote
      await updateDoc(reportRef, {
        upvotes: increment(-1),
        upvotedBy: arrayRemove(userId)
      });
    } else {
      // Add upvote
      await updateDoc(reportRef, {
        upvotes: increment(1),
        upvotedBy: arrayUnion(userId)
      });
    }
    return !hasUpvoted; // Return new upvote state
  } catch (error) {
    console.error('Error toggling upvote:', error);
    throw error;
  }
};

export default function HazardReportPage() {
  const params = useLocalSearchParams();
  const [description, setDescription] = useState('');
  const [selectedHazardType, setSelectedHazardType] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('');
  const [markerLocation, setMarkerLocation] = useState<{latitude: number, longitude: number} | null>(null);
  const [region, setRegion] = useState<Region | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Fallback region (MMU)
  const fallbackRegion: Region = {
    latitude: 2.9278,
    longitude: 101.6419,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  useEffect(() => {
    initializeLocation();
  }, []);

  // Add this updated initializeLocation function
  const initializeLocation = async () => {
    try {
      // If coordinates passed from map tab
      if (params.latitude && params.longitude) {
        const lat = parseFloat(params.latitude as string);
        const lng = parseFloat(params.longitude as string);
        
        const paramRegion: Region = {
          latitude: lat,
          longitude: lng,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };
        
        setRegion(paramRegion);
        setMarkerLocation({ latitude: lat, longitude: lng });
        setLoading(false);
        return;
      }

      // Check current location permission status
      const { status: currentStatus } = await Location.getForegroundPermissionsAsync();
      
      if (currentStatus !== 'granted') {
        Alert.alert(
          'Location Access Required',
          'GuardU needs access to your location to help you report hazards accurately. This helps other students know exactly where the hazard is located.',
          [
            {
              text: 'Use Default Location',
              style: 'cancel',
              onPress: () => {
                setRegion(fallbackRegion);
                setLoading(false);
              }
            },
            {
              text: 'Allow Location',
              onPress: async () => {
                await requestLocationPermission();
              }
            }
          ]
        );
      } else {
        await getCurrentLocation();
      }
      
    } catch (error) {
      console.error('Error initializing location:', error);
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
          'You can still report hazards, but you\'ll need to manually select the location on the map. You can enable location access in your device settings later.',
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
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };

      setRegion(currentRegion);
      setLoading(false);
    } catch (error) {
      console.error('Error getting current location:', error);
      Alert.alert(
        'Location Error',
        'Unable to get your current location. You can manually select the hazard location on the map.',
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

  const handleMapPress = (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setMarkerLocation({ latitude, longitude });
  };

  const handleSubmitReport = async () => {
    if (!markerLocation) {
      Alert.alert('Error', 'Please select a location on the map');
      return;
    }

    if (!selectedHazardType) {
      Alert.alert('Error', 'Please select a hazard type');
      return;
    }

    if (!selectedSeverity) {
      Alert.alert('Error', 'Please select a severity level');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Error', 'Please provide a description');
      return;
    }

    if (description.trim().length < 10) {
      Alert.alert('Error', 'Description must be at least 10 characters long');
      return;
    }

    if (description.trim().length > 1000) {
      Alert.alert('Error', 'Description must be less than 1000 characters');
      return;
    }

    if (!auth.currentUser) {
      Alert.alert('Error', 'You must be logged in to report a hazard');
      return;
    }

    setSubmitting(true);

    try {
      const geoPoint = new GeoPoint(markerLocation.latitude, markerLocation.longitude);

      const hazardReport: HazardReport = {
        location: geoPoint,
        description: description.trim(),
        hazardType: selectedHazardType,
        reportedBy: auth.currentUser.uid,
        timestamp: serverTimestamp(),
        severity: selectedSeverity,
        upvotes: 1,
        upvotedBy: [auth.currentUser.uid]
      };

      console.log('Submitting hazard report:', hazardReport);

      await addDoc(collection(db, 'hazardReports'), hazardReport);

      Alert.alert(
        'Report Submitted',
        'Thank you for reporting this hazard. Your report helps keep the community safe.',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      console.error('Error submitting report:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      let errorMessage = 'Failed to submit report. Please try again.';
      
      if (error.code === 'permission-denied') {
        errorMessage = 'Permission denied. Please check your login status and try again.';
      } else if (error.code === 'invalid-argument') {
        errorMessage = 'Invalid data provided. Please check all fields and try again.';
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !region) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#b7ccf6ff" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex1}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.subtitle}>Tap on the map to select location:</Text>
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              region={region}
              onPress={handleMapPress}
              showsUserLocation={true}
            >
              {markerLocation && (
                <Marker
                  coordinate={markerLocation}
                  title="Hazard Location"
                  pinColor="red"
                />
              )}
            </MapView>
          </View>

          <Text style={styles.subtitle}>Hazard Type:</Text>
          <View style={styles.hazardTypeContainer}>
            {HAZARD_TYPES.map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.hazardTypeButton,
                  selectedHazardType === type && styles.selectedHazardType,
                ]}
                onPress={() => setSelectedHazardType(type)}
              >
                <Text
                  style={[
                    styles.hazardTypeText,
                    selectedHazardType === type && styles.selectedHazardTypeText,
                  ]}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.subtitle}>Severity Level:</Text>
          <View style={styles.severityContainer}>
            {SEVERITY_LEVELS.map((severity) => (
              <TouchableOpacity
                key={severity.value}
                style={[
                  styles.severityButton,
                  selectedSeverity === severity.value && {
                    backgroundColor: severity.color,
                    borderColor: severity.color,
                  },
                ]}
                onPress={() => setSelectedSeverity(severity.value)}
              >
                <View style={styles.severityContent}>
                  <Text
                    style={[
                      styles.severityLabel,
                      selectedSeverity === severity.value && styles.selectedSeverityText,
                    ]}
                  >
                    {severity.label}
                  </Text>
                  <Text
                    style={[
                      styles.severityDescription,
                      selectedSeverity === severity.value && styles.selectedSeverityText,
                    ]}
                  >
                    {severity.description}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.subtitle}>Description:</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Describe the hazard in detail (minimum 10 characters)..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            maxLength={1000}
          />
          <Text style={styles.characterCount}>
            {description.length}/1000 characters
          </Text>

          <TouchableOpacity
            style={[styles.submitButton, submitting && styles.disabledButton]}
            onPress={handleSubmitReport}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.submitButtonText}>Submit Report</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.back()}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  flex1: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  mapContainer: {
    height: 200,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 15,
  },
  map: {
    flex: 1,
  },
  hazardTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 15,
  },
  hazardTypeButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: 'white',
  },
  selectedHazardType: {
    backgroundColor: '#b7ccf6ff',
    borderColor: '#b7ccf6ff',
  },
  hazardTypeText: {
    color: '#666',
    fontSize: 14,
  },
  selectedHazardTypeText: {
    color: 'white',
    fontWeight: '600',
  },
  severityContainer: {
    gap: 10,
    marginBottom: 15,
  },
  severityButton: {
    padding: 15,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: 'white',
  },
  severityContent: {
    alignItems: 'center',
  },
  severityLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  severityDescription: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  selectedSeverityText: {
    color: 'white',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    minHeight: 100,
    marginBottom: 5,
  },
  characterCount: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'right',
    marginBottom: 15,
  },
  submitButton: {
    backgroundColor: '#96b5f5ff',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  disabledButton: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: 'black',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#ec8888ff', // red color code
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  cancelButtonText: {
    color: 'black',
    fontSize: 16,
  },
});
