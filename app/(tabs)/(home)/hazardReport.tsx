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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import MapView, { Marker, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/firebase.config';

interface HazardReport {
  location: {
    latitude: number;
    longitude: number;
  };
  description: string;
  hazardType: string;
  reportedBy: string;
  timestamp: any;
}

const HAZARD_TYPES = [
  'Poor Lighting',
  'Broken Infrastructure',
  'Suspicious Activity',
  'Unsafe Area',
  'Other'
];

export default function HazardReportPage() {
  const params = useLocalSearchParams();
  const [description, setDescription] = useState('');
  const [selectedHazardType, setSelectedHazardType] = useState('');
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

      // Otherwise get current location
      const { status } = await Location.getForegroundPermissionsAsync();
      
      if (status === 'granted') {
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
      } else {
        setRegion(fallbackRegion);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error getting location:', error);
      setRegion(fallbackRegion);
      setLoading(false);
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

    if (!description.trim()) {
      Alert.alert('Error', 'Please provide a description');
      return;
    }

    if (!auth.currentUser) {
      Alert.alert('Error', 'You must be logged in to report a hazard');
      return;
    }

    setSubmitting(true);

    try {
      const hazardReport: HazardReport = {
        location: markerLocation,
        description: description.trim(),
        hazardType: selectedHazardType,
        reportedBy: auth.currentUser.uid,
        timestamp: serverTimestamp(),
      };

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
    } catch (error) {
      console.error('Error submitting report:', error);
      Alert.alert('Error', 'Failed to submit report. Please try again.');
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
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Report a Hazard</Text>
        
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

        <Text style={styles.subtitle}>Description:</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Describe the hazard in detail..."
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    marginTop: 15,
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
  textInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    minHeight: 100,
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: '#b7ccf6ff',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  disabledButton: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
  },
});
