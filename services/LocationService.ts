// services/LocationService.ts
import * as Location from 'expo-location';
import { doc, updateDoc, GeoPoint } from 'firebase/firestore';
import { db } from '@/firebase.config';

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude?: number;
  heading?: number;
  speed?: number;
  timestamp: number;
}

interface LocationResult {
  coords: LocationData;
  address?: string;
  isEmergencyLocation: boolean;
}

class LocationService {
  private watchSubscription: Location.LocationSubscription | null = null;
  private isTracking: boolean = false;
  private onLocationUpdate?: (location: LocationData) => void;
  private lastKnownLocation: LocationData | null = null;

  /**
   * Request all location permissions (foreground and background)
   */
  async requestAllPermissions(): Promise<{foreground: boolean, background: boolean}> {
    const foreground = await Location.requestForegroundPermissionsAsync();
    let background = { status: 'denied' as Location.PermissionStatus };
    
    if (foreground.status === 'granted') {
      background = await Location.requestBackgroundPermissionsAsync();
    }
    
    return {
      foreground: foreground.status === 'granted',
      background: background.status === 'granted'
    };
  }

  /**
   * Initialize location service and request permissions
   */
  async initialize(): Promise<boolean> {
    try {
      console.log('📍 Initializing LocationService...');
      
      // Check if location services are enabled
      const isEnabled = await Location.hasServicesEnabledAsync();
      if (!isEnabled) {
        console.error('❌ Location services are disabled');
        return false;
      }

      // Request permissions using the helper method
      const permissions = await this.requestAllPermissions();
      
      if (!permissions.foreground) {
        console.error('❌ Foreground location permission denied');
        return false;
      }

      if (!permissions.background) {
        console.warn('⚠️ Background location permission denied - emergency tracking limited');
      }

      console.log('✅ LocationService initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize LocationService:', error);
      return false;
    }
  }

  /**
   * Get current location with high accuracy for emergencies
   */
  async getCurrentLocation(isEmergency: boolean = false): Promise<LocationResult | null> {
    try {
      console.log(`📍 Getting current location${isEmergency ? ' (EMERGENCY)' : ''}...`);
      
      const initialized = await this.initialize();
      if (!initialized) {
        throw new Error('Failed to initialize location service');
      }

      // Use highest accuracy for emergencies
      const accuracy = isEmergency 
        ? Location.Accuracy.BestForNavigation 
        : Location.Accuracy.Balanced;

      const location = await Location.getCurrentPositionAsync({
        accuracy,
        maximumAge: isEmergency ? 0 : 60000, // No cached location for emergencies
        timeout: isEmergency ? 30000 : 15000, // Longer timeout for emergencies
      });

      const locationData: LocationData = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy || 0,
        altitude: location.coords.altitude || undefined,
        heading: location.coords.heading || undefined,
        speed: location.coords.speed || undefined,
        timestamp: location.timestamp,
      };

      // Cache the location
      this.lastKnownLocation = locationData;

      // Get address for emergency context
      let address: string | undefined;
      if (isEmergency) {
        try {
          address = await this.reverseGeocode(locationData.latitude, locationData.longitude);
        } catch (error) {
          console.warn('⚠️ Failed to get address:', error);
        }
      }

      const result: LocationResult = {
        coords: locationData,
        address,
        isEmergencyLocation: isEmergency,
      };

      console.log('✅ Location obtained:', {
        lat: locationData.latitude.toFixed(6),
        lng: locationData.longitude.toFixed(6),
        accuracy: `${locationData.accuracy?.toFixed(0)}m`,
        address: address?.substring(0, 50) + (address ? '...' : '')
      });

      return result;
    } catch (error) {
      console.error('❌ Failed to get current location:', error);
      return null;
    }
  }

  /**
   * Start continuous location tracking for emergency situations
   */
  async startEmergencyTracking(emergencyId: string): Promise<boolean> {
    try {
      console.log('🚨 Starting emergency location tracking...');
      
      if (this.isTracking) {
        console.warn('⚠️ Already tracking location');
        return true;
      }

      const initialized = await this.initialize();
      if (!initialized) {
        return false;
      }

      // Start watching location with high accuracy
      this.watchSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 5000, // Update every 5 seconds
          distanceInterval: 10, // Or every 10 meters
        },
        (location) => {
          const locationData: LocationData = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            accuracy: location.coords.accuracy || 0,
            altitude: location.coords.altitude || undefined,
            heading: location.coords.heading || undefined,
            speed: location.coords.speed || undefined,
            timestamp: location.timestamp,
          };

          // Update cached location
          this.lastKnownLocation = locationData;

          // Notify callback
          if (this.onLocationUpdate) {
            this.onLocationUpdate(locationData);
          }

          // Update emergency document with new location
          this.updateEmergencyLocation(emergencyId, locationData);
        }
      );

      this.isTracking = true;
      console.log('✅ Emergency location tracking started');
      return true;
    } catch (error) {
      console.error('❌ Failed to start location tracking:', error);
      return false;
    }
  }

  /**
   * Stop location tracking
   */
  async stopTracking(): Promise<void> {
    try {
      console.log('🛑 Stopping location tracking...');
      
      if (this.watchSubscription) {
        this.watchSubscription.remove();
        this.watchSubscription = null;
      }

      this.isTracking = false;
      console.log('✅ Location tracking stopped');
    } catch (error) {
      console.error('❌ Error stopping location tracking:', error);
    }
  }

  /**
   * Update emergency document with current location
   */
  async updateEmergencyLocation(emergencyId: string, location: LocationData): Promise<void> {
    try {
      const emergencyRef = doc(db, 'emergencies', emergencyId);
      const geoPoint = new GeoPoint(location.latitude, location.longitude);

      await updateDoc(emergencyRef, {
        location: geoPoint,
        locationData: {
          ...location,
          lastUpdated: new Date(),
        },
        locationAccuracy: location.accuracy,
        lastLocationUpdate: new Date(),
      });

      console.log('✅ Emergency location updated in Firestore');
    } catch (error) {
      console.error('❌ Failed to update emergency location:', error);
    }
  }

  /**
   * Get address from coordinates (reverse geocoding)
   */
  async reverseGeocode(latitude: number, longitude: number): Promise<string | null> {
    try {
      const addresses = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (addresses.length > 0) {
        const address = addresses[0];
        const parts = [
          address.name,
          address.street,
          address.city,
          address.region,
          address.postalCode,
          address.country,
        ].filter(Boolean);

        return parts.join(', ');
      }

      return null;
    } catch (error) {
      console.error('❌ Reverse geocoding failed:', error);
      return null;
    }
  }

  /**
   * Get coordinates from address (forward geocoding)
   */
  async geocode(address: string): Promise<LocationData | null> {
    try {
      const locations = await Location.geocodeAsync(address);
      
      if (locations.length > 0) {
        const location = locations[0];
        return {
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: 0,
          timestamp: Date.now(),
        };
      }

      return null;
    } catch (error) {
      console.error('❌ Geocoding failed:', error);
      return null;
    }
  }

  /**
   * Calculate distance between two points in meters
   */
  calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lng2 - lng1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  /**
   * Find nearby volunteers within specified radius
   */
  async findNearbyVolunteers(
    emergencyLocation: LocationData,
    radiusInMeters: number = 1000
  ): Promise<any[]> {
    try {
      // TODO: Query Firestore for volunteers with location
      // This would use geohash or similar for efficient geo queries
      console.log(`🔍 Finding volunteers within ${radiusInMeters}m...`);
      
      // Mock implementation - replace with real Firestore geo query
      const mockVolunteers = [
        {
          id: 'vol-001',
          name: 'Alex',
          location: { lat: emergencyLocation.latitude + 0.001, lng: emergencyLocation.longitude + 0.001 },
          verified: true,
          available: true,
        },
        {
          id: 'vol-002',
          name: 'Sarah',
          location: { lat: emergencyLocation.latitude - 0.002, lng: emergencyLocation.longitude + 0.002 },
          verified: true,
          available: true,
        },
      ];

      // Filter by distance and calculate actual distances
      const nearbyVolunteers = mockVolunteers
        .map(volunteer => {
          const distance = this.calculateDistance(
            emergencyLocation.latitude,
            emergencyLocation.longitude,
            volunteer.location.lat,
            volunteer.location.lng
          );
          return { ...volunteer, distance };
        })
        .filter(volunteer => volunteer.distance <= radiusInMeters)
        .sort((a, b) => a.distance - b.distance);

      console.log(`✅ Found ${nearbyVolunteers.length} nearby volunteers`);
      return nearbyVolunteers;
    } catch (error) {
      console.error('❌ Failed to find nearby volunteers:', error);
      return [];
    }
  }

  /**
   * Set callback for location updates
   */
  setLocationUpdateCallback(callback: (location: LocationData) => void): void {
    this.onLocationUpdate = callback;
  }

  /**
   * Get last known location
   */
  getLastKnownLocation(): LocationData | null {
    return this.lastKnownLocation;
  }

  /**
   * Check if currently tracking location
   */
  isCurrentlyTracking(): boolean {
    return this.isTracking;
  }

  /**
   * Get location permission status
   */
  async getPermissionStatus(): Promise<{
    foreground: string;
    background: string;
  }> {
    try {
      const foreground = await Location.getForegroundPermissionsAsync();
      const background = await Location.getBackgroundPermissionsAsync();

      return {
        foreground: foreground.status,
        background: background.status,
      };
    } catch (error) {
      console.error('❌ Error checking location permissions:', error);
      return {
        foreground: 'undetermined',
        background: 'undetermined',
      };
    }
  }

  /**
   * Share location via emergency contacts
   */
  async shareLocationWithContacts(
    location: LocationData,
    emergencyType: string,
    message?: string
  ): Promise<void> {
    try {
      console.log('📤 Sharing location with emergency contacts...');
      
      const address = await this.reverseGeocode(location.latitude, location.longitude);
      const mapsUrl = `https://maps.google.com/?q=${location.latitude},${location.longitude}`;
      
      const shareMessage = message || 
        `🚨 EMERGENCY (${emergencyType})\n` +
        `Location: ${address || 'Coordinates provided'}\n` +
        `Maps: ${mapsUrl}\n` +
        `Time: ${new Date().toLocaleString()}`;

      // TODO: Send via SMS/messaging to emergency contacts
      console.log('📱 Emergency message:', shareMessage);
      
    } catch (error) {
      console.error('❌ Failed to share location:', error);
    }
  }

  /**
   * Cleanup location service
   */
  async cleanup(): Promise<void> {
    try {
      console.log('🧹 Cleaning up LocationService...');
      
      await this.stopTracking();
      this.onLocationUpdate = undefined;
      this.lastKnownLocation = null;
      
      console.log('✅ LocationService cleaned up');
    } catch (error) {
      console.error('❌ Error during LocationService cleanup:', error);
    }
  }
}

// Export singleton instance
export const locationService = new LocationService();
export default LocationService;

// Export types
export type { LocationData, LocationResult };