import {
  StyleSheet,
  View,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  Text,
} from "react-native";
import React, { useState, useCallback, useEffect } from "react";
import MapView, {
  Region,
  Marker,
  Callout,
  MapPressEvent,
} from "react-native-maps";
import * as Location from "expo-location";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase.config";
import { Ionicons } from "@expo/vector-icons";
import { toggleUpvote } from "./(home)/hazardReport";
// Map zoom levels for latitude and longitude
const LAT_ZOOM = 0.01,
  LONG_ZOOM = 0.01;

interface MarkerData {
  id: string;
  hazardType: string;
  description: string;
  upvotes: number;
  upvotedBy: string[];
}

// mapPage: displays user's location and hazard reports on a map
export default function mapPage() {
  // Track current region, loading state, and hazard report data
  const [region, setRegion] = useState<Region | null>(null);
  const [loading, setLoading] = useState(true);
  const [hazardReports, setHazardReports] = useState<any[]>([]);
  const [selectedMarker, setSelectedMarker] = useState<MarkerData | null>(null);
  const [isBoxVisible, setIsBoxVisible] = useState(false);
  const [id, setId] = useState<string>("");
  const [upvotedBy, setUpvotedBy] = useState<string[]>([]);
  const [vote, setVote] = useState<number>(0);

  // Default region used when location access is denied
  const fallbackRegion: Region = {
    latitude: 2.9278,
    longitude: 101.6419,
    latitudeDelta: LAT_ZOOM,
    longitudeDelta: LONG_ZOOM,
  };

  // Navigate to hazard report form with current location (if available)
  const handleReportHazard = () => {
    if (region) {
      router.push({
        pathname: "./hazardReport",
        params: {
          latitude: region.latitude.toString(),
          longitude: region.longitude.toString(),
        },
      });
    } else {
      router.push("./hazardReport");
    }
  };

  // Fetch hazard reports from Firestore and store in state
  const fetchHazardReports = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "hazardReports"));
      const reports = querySnapshot.docs.map((doc) => {
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
      console.error("Error fetching hazard reports:", error);
    }
  };

  // Toggle upvote for a hazard report and refresh data
  const handleUpvote = async (reportId: string, currentUpvotedBy: string[]) => {
    try {
      await toggleUpvote(reportId, currentUpvotedBy);
      // Refresh the reports to get updated counts
      await fetchHazardReports();
    } catch (error) {
      Alert.alert("Error", "Failed to update upvote. Please try again.");
    }
  };

  // When screen is focused, check location and fetch hazard data - when a screen is "focused" in React, it means the user is currently viewing and interacting with that screen
  useFocusEffect(
    useCallback(() => {
      checkLocationPermissionAndGetLocation();
      fetchHazardReports();
    }, [])
  );

  //Location permisson flow

  // Check location permission and initialize map region
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
              text: "Use Default Location",
              style: "cancel",
              onPress: () => {
                setRegion(fallbackRegion);
                setLoading(false);
              },
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

  const handleMarkerPress = (marker: MarkerData) => {
    setSelectedMarker(marker);
    setIsBoxVisible(true);
    setId(marker.id);
    setUpvotedBy(marker.upvotedBy);
  };

  const handleMapPress = (e: MapPressEvent) => {
    // Only close if user didn't press on a marker
    const isMarkerPress = e.nativeEvent?.action !== "marker-press";
    if (isMarkerPress) {
      setSelectedMarker(null);
      setIsBoxVisible(false);
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
    <View style={styles.container}>
      {/* MapView displays current region and hazard markers */}
      <MapView
        style={styles.map}
        region={region}
        showsUserLocation={true}
        showsMyLocationButton={true}
        followsUserLocation={true}
        onPress={handleMapPress}
      >
        {/* Render hazard report markers with severity-based pin color */}
        {hazardReports.map((report) => (
          <Marker
            key={report.id}
            coordinate={{
              latitude: report.latitude,
              longitude: report.longitude,
            }}
            title={report.hazardType}
            // description={`${report.severity.toUpperCase()}: ${report.description}`}

            pinColor={
              report.severity === "critical"
                ? "#EF4444"
                : report.severity === "moderate"
                  ? "#F59E0B"
                  : "#10B981"
            }
            onPress={() => handleMarkerPress(report)}
          ></Marker>
        ))}
      </MapView>

      {isBoxVisible ? (
        <View className="absolute bottom-[120] mx-8 bg-white w-96 h-auto p-6 rounded-3xl z-40 shadow-md">
          <Text className="text-lg text-gray-600 font-bold mx-2">
            {selectedMarker?.hazardType}
          </Text>
          <Text className="text-gray-600 mx-2">{selectedMarker?.description}</Text>

          <TouchableOpacity
            className="bg-green-200 flex-row items-center justify-center px-4 py-3 rounded-lg shadow-sm active:bg-green-300 border border-green-300 m-2"
            onPress={() => handleUpvote(id, upvotedBy)}
          >
            <Ionicons
              name="thumbs-up"
              size={20}
              color="#166534"
              className="mr-2"
            />

            <Text className="text-green-800 font-semibold text-lg mr-2">
              {selectedMarker?.upvotes}
            </Text>

            <Text className="text-green-600 text-sm">Tap to upvote</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <></>
      )}

      {/* <FloatingBox/> */}

      {/** Floating button to report a new hazard */}
      <TouchableOpacity
        style={styles.reportButton}
        onPress={handleReportHazard}
        className="bottom-1/4"
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
    width: "100%",
    height: "100%",
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  reportButton: {
    position: "absolute",
    bottom: 60,
    right: 30,
    backgroundColor: "#ff6b6b",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  reportButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
  calloutContainer: {
    width: 50,
    // padding: 10,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  calloutDescription: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
  },
  upvoteContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  upvoteText: {
    marginLeft: 5,
    fontSize: 14,
    fontWeight: "600",
  },
  upvoteAction: {
    marginLeft: 10,
    fontSize: 12,
    color: "#007AFF",
  },
});
