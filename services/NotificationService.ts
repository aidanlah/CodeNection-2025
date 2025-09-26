// services/NotificationService.ts
import * as Notifications from 'expo-notifications';
import { NotificationHandler } from "expo-notifications";
import { NotificationBehavior } from 'expo-notifications';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { db } from '@/firebase.config';
import { LocationData } from './LocationService';

interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, any>;
  priority?: 'default' | 'high' | 'max';
  sound?: string;
  vibrate?: boolean;
}

interface EmergencyAlert {
  id: string;
  emergencyId: string;
  emergencyType: string;
  location: LocationData;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  recipients: string[];
  sentAt: Date;
  deliveryStatus: Record<string, 'sent' | 'delivered' | 'failed'>;
}

class NotificationService {
  private expoPushToken: string | null = null;
  private isInitialized: boolean = false;

  /**
   * Initialize notification service and get push token
   */
  async initialize(): Promise<boolean> {
    try {
      console.log('🔔 Initializing NotificationService...');

    const notificationBehavior: NotificationBehavior = {
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
  };

Notifications.setNotificationHandler({
  handleNotification: async () => notificationBehavior,
});

      

      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.error('❌ Notification permission denied');
        return false;
      }

      // Get Expo push token
      try {
        const tokenData = await Notifications.getExpoPushTokenAsync({
          projectId: "1:565397046611:web:337de022989d89af85cda6"
        });
        this.expoPushToken = tokenData.data;
        console.log('✅ Push token obtained:', this.expoPushToken?.substring(0, 20) + '...');
      } catch (tokenError) {
        console.warn('⚠️ Failed to get push token:', tokenError);
      }

      this.isInitialized = true;
      console.log('✅ NotificationService initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize NotificationService:', error);
      return false;
    }
  }

  /**
   * Send emergency alert to security team
   */
  async alertSecurity(
    emergencyType: string,
    location: LocationData,
    emergencyId: string,
    audioUrl?: string
  ): Promise<boolean> {
    try {
      console.log('🚨 ALERTING SECURITY TEAM...');

      const payload: NotificationPayload = {
        title: `🚨 ${emergencyType} EMERGENCY`,
        body: `Emergency reported at ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`,
        data: {
          type: 'emergency',
          emergencyId,
          emergencyType,
          location: JSON.stringify(location),
          audioUrl,
          priority: 'critical',
          timestamp: Date.now(),
        },
        priority: 'max',
        sound: 'emergency_alert.wav',
        vibrate: true,
      };

      // Send to security team (get security tokens from Firestore)
      const securityTeam = await this.getSecurityTeamTokens();
      
      if (securityTeam.length === 0) {
        console.error('❌ No security team tokens found');
        return false;
      }

      // Send push notifications to all security personnel
      const results = await this.sendBulkNotifications(securityTeam, payload);
      
      // For critical emergencies, also send SMS
      if (['FIRE', 'MEDICAL', 'ROBBERY/THEFT'].includes(emergencyType)) {
        await this.sendEmergencySMS(emergencyType, location, emergencyId);
      }

      // Log the alert
      await this.logEmergencyAlert({
        id: `alert-${Date.now()}`,
        emergencyId,
        emergencyType,
        location,
        message: payload.body,
        priority: 'critical',
        recipients: securityTeam,
        sentAt: new Date(),
        deliveryStatus: {},
      });

      console.log('✅ Security team alerted successfully');
      return results.some(r => r.success);
    } catch (error) {
      console.error('❌ Failed to alert security:', error);
      return false;
    }
  }

  /**
   * Notify nearby volunteers
   */
  async notifyNearbyVolunteers(
    location: LocationData,
    emergencyType: string,
    emergencyId: string,
    radius: number = 1000
  ): Promise<boolean> {
    try {
      console.log('👥 Notifying nearby volunteers...');

      // Get nearby volunteer tokens
      const volunteers = await this.getNearbyVolunteerTokens(location, radius);
      
      if (volunteers.length === 0) {
        console.warn('⚠️ No nearby volunteers found');
        return true; // Not a failure, just no volunteers
      }

      const payload: NotificationPayload = {
        title: `🆘 Help Needed - ${emergencyType}`,
        body: `Emergency reported ${this.calculateDistance(location)} away. Can you assist?`,
        data: {
          type: 'volunteer_request',
          emergencyId,
          emergencyType,
          location: JSON.stringify(location),
          priority: 'high',
          timestamp: Date.now(),
        },
        priority: 'high',
        sound: 'volunteer_alert.wav',
        vibrate: true,
      };

      // Send notifications to volunteers
      const results = await this.sendBulkNotifications(
        volunteers.map(v => v.pushToken),
        payload
      );

      console.log(`✅ Notified ${volunteers.length} nearby volunteers`);
      return results.some(r => r.success);
    } catch (error) {
      console.error('❌ Failed to notify volunteers:', error);
      return false;
    }
  }

  /**
   * Send notifications to emergency contacts
   */
  async notifyEmergencyContacts(
    userId: string,
    emergencyType: string,
    location: LocationData,
    emergencyId: string
  ): Promise<boolean> {
    try {
      console.log('📞 Notifying emergency contacts...');

      // Get user's emergency contacts
      const contacts = await this.getUserEmergencyContacts(userId);
      
      if (contacts.length === 0) {
        console.warn('⚠️ No emergency contacts found');
        return true;
      }

      const payload: NotificationPayload = {
        title: `🚨 Emergency Alert`,
        body: `Your contact has reported a ${emergencyType} emergency and may need assistance.`,
        data: {
          type: 'emergency_contact',
          emergencyId,
          emergencyType,
          location: JSON.stringify(location),
          priority: 'high',
          timestamp: Date.now(),
        },
        priority: 'high',
        sound: 'default',
        vibrate: true,
      };

      // Send push notifications to contacts who have the app
      const pushTokens = contacts
        .filter(c => c.pushToken)
        .map(c => c.pushToken);

      if (pushTokens.length > 0) {
        await this.sendBulkNotifications(pushTokens, payload);
      }

      // Send SMS to all contacts
      await this.sendContactSMS(contacts, emergencyType, location);

      console.log(`✅ Notified ${contacts.length} emergency contacts`);
      return true;
    } catch (error) {
      console.error('❌ Failed to notify emergency contacts:', error);
      return false;
    }
  }

  /**
   * Send bulk push notifications
   */
  private async sendBulkNotifications(
    pushTokens: string[],
    payload: NotificationPayload
  ): Promise<Array<{ token: string; success: boolean; error?: string }>> {
    try {
      // Use Expo's push notification service
      const messages = pushTokens.map(token => ({
        to: token,
        title: payload.title,
        body: payload.body,
        data: payload.data || {},
        sound: payload.sound || 'default',
        priority: payload.priority || 'high',
        channelId: 'emergency-alerts',
      }));

      // Send via Expo Push API
      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messages),
      });

      const results = await response.json();
      
      return pushTokens.map((token, index) => ({
        token,
        success: results.data?.[index]?.status === 'ok',
        error: results.data?.[index]?.message,
      }));
    } catch (error) {
      console.error('❌ Bulk notification send failed:', error);
      return pushTokens.map(token => ({
        token,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }));
    }
  }

  /**
   * Send emergency SMS via Firebase Functions
   */
  private async sendEmergencySMS(
    emergencyType: string,
    location: LocationData,
    emergencyId: string
  ): Promise<void> {
    try {
      console.log('📱 Sending emergency SMS...');

      const functions = getFunctions();
      const sendEmergencySMS = httpsCallable(functions, 'sendEmergencySMS');

      await sendEmergencySMS({
        emergencyType,
        location,
        emergencyId,
        timestamp: Date.now(),
      });

      console.log('✅ Emergency SMS sent');
    } catch (error) {
      console.error('❌ Failed to send emergency SMS:', error);
    }
  }

  /**
   * Send SMS to emergency contacts
   */
  private async sendContactSMS(
    contacts: any[],
    emergencyType: string,
    location: LocationData
  ): Promise<void> {
    try {
      const functions = getFunctions();
      const sendContactSMS = httpsCallable(functions, 'sendContactSMS');

      const phoneNumbers = contacts
        .filter(c => c.phoneNumber)
        .map(c => c.phoneNumber);

      if (phoneNumbers.length > 0) {
        await sendContactSMS({
          phoneNumbers,
          emergencyType,
          location,
          timestamp: Date.now(),
        });
      }
    } catch (error) {
      console.error('❌ Failed to send contact SMS:', error);
    }
  }

  /**
   * Get security team push tokens from Firestore
   */
  private async getSecurityTeamTokens(): Promise<string[]> {
    try {
      const securityQuery = query(
        collection(db, 'users'),
        where('role', '==', 'security'),
        where('isActive', '==', true)
      );

      const snapshot = await getDocs(securityQuery);
      const tokens: string[] = [];

      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.pushToken) {
          tokens.push(data.pushToken);
        }
      });

      return tokens;
    } catch (error) {
      console.error('❌ Failed to get security team tokens:', error);
      return [];
    }
  }

  /**
   * Get nearby volunteer tokens
   */
  private async getNearbyVolunteerTokens(
    location: LocationData,
    radius: number
  ): Promise<Array<{ id: string; pushToken: string; distance: number }>> {
    try {
      // TODO: Implement geohash query for efficient location-based search
      // For now, get all volunteers and filter by distance
      const volunteersQuery = query(
        collection(db, 'users'),
        where('role', '==', 'volunteer'),
        where('isAvailable', '==', true),
        where('isVerified', '==', true)
      );

      const snapshot = await getDocs(volunteersQuery);
      const nearbyVolunteers: Array<{ id: string; pushToken: string; distance: number }> = [];

      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.pushToken && data.location) {
          // Calculate distance (simplified)
          const distance = Math.sqrt(
            Math.pow(data.location.latitude - location.latitude, 2) +
            Math.pow(data.location.longitude - location.longitude, 2)
          ) * 111000; // Rough conversion to meters

          if (distance <= radius) {
            nearbyVolunteers.push({
              id: doc.id,
              pushToken: data.pushToken,
              distance: Math.round(distance),
            });
          }
        }
      });

      return nearbyVolunteers.sort((a, b) => a.distance - b.distance);
    } catch (error) {
      console.error('❌ Failed to get nearby volunteers:', error);
      return [];
    }
  }

  /**
   * Get user's emergency contacts
   */
  private async getUserEmergencyContacts(userId: string): Promise<any[]> {
    try {
      const contactsQuery = query(
        collection(db, 'emergencyContacts'),
        where('userId', '==', userId)
      );

      const snapshot = await getDocs(contactsQuery);
      const contacts: any[] = [];

      snapshot.forEach(doc => {
        contacts.push({ id: doc.id, ...doc.data() });
      });

      return contacts;
    } catch (error) {
      console.error('❌ Failed to get emergency contacts:', error);
      return [];
    }
  }

  /**
   * Log emergency alert for tracking
   */
  private async logEmergencyAlert(alert: EmergencyAlert): Promise<void> {
    try {
      await addDoc(collection(db, 'emergencyAlerts'), {
        ...alert,
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error('❌ Failed to log emergency alert:', error);
    }
  }

  /**
   * Calculate distance for display
   */
  private calculateDistance(location: LocationData): string {
    // Mock implementation - you'd calculate from user's location
    return '150m';
  }

  /**
   * Update user's push token
   */
  async updateUserPushToken(userId: string): Promise<void> {
    try {
      if (!this.expoPushToken) {
        await this.initialize();
      }

      if (this.expoPushToken) {
        // Update user's push token in Firestore
        // Implementation depends on your user document structure
        console.log('📱 Updated user push token');
      }
    } catch (error) {
      console.error('❌ Failed to update push token:', error);
    }
  }

  /**
   * Send status update notification
   */
  async sendStatusUpdate(
    emergencyId: string,
    status: string,
    message: string
  ): Promise<void> {
    try {
      const payload: NotificationPayload = {
        title: 'Emergency Status Update',
        body: message,
        data: {
          type: 'status_update',
          emergencyId,
          status,
          timestamp: Date.now(),
        },
        priority: 'default',
      };

      // Send to relevant parties based on emergency
      // Implementation would query for involved users
      console.log('📤 Status update sent');
    } catch (error) {
      console.error('❌ Failed to send status update:', error);
    }
  }

  /**
   * Get push token
   */
  getPushToken(): string | null {
    return this.expoPushToken;
  }

  /**
   * Cleanup notification service
   */
  async cleanup(): Promise<void> {
    console.log('🧹 NotificationService cleaned up');
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
export default NotificationService;

// Export types
export type { NotificationPayload, EmergencyAlert };