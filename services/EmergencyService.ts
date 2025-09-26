// services/EmergencyService.ts
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDoc,
  getDocs,
  serverTimestamp, 
  GeoPoint,
  query,
  where,
  onSnapshot,
  Timestamp
} from 'firebase/firestore';
import { auth, db } from '@/firebase.config';
import { audioService, AudioUploadResult } from './AudioService';
import { locationService, LocationData } from './LocationService';
import { notificationService } from './NotificationService';

interface EmergencySession {
  id: string;
  emergencyType: string;
  status: 'active' | 'acknowledged' | 'responded' | 'resolved' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  
  // User Info
  reportedBy: string;
  userProfile?: {
    name: string;
    phone?: string;
    studentId?: string;
  };

  // Location Data
  location: GeoPoint;
  locationData?: LocationData;
  address?: string;

  // Audio Data
  audioRecording?: {
    url: string;
    fileName: string;
    uploadedAt: Date;
    duration?: number;
  };

  // Response Data
  assignedSecurity?: string[];
  assignedVolunteers?: string[];
  estimatedArrival?: Date;
  
  // Timestamps
  createdAt: Date;
  lastUpdated: Date;
  acknowledgedAt?: Date;
  resolvedAt?: Date;
  
  // Additional Data
  description?: string;
  updates: EmergencyUpdate[];
  metadata: {
    deviceInfo?: any;
    appVersion?: string;
    batteryLevel?: number;
  };
}

interface EmergencyUpdate {
  id: string;
  type: 'status_change' | 'location_update' | 'audio_received' | 'responder_assigned' | 'message' | 'resolved';
  message: string;
  timestamp: Date;
  updatedBy: string;
  data?: any;
}

interface CreateEmergencyParams {
  emergencyType: string;
  location: LocationData;
  description?: string;
  metadata?: any;
}

class EmergencyService {
  private activeSession: EmergencySession | null = null;
  private sessionListeners: Array<() => void> = [];

  /**
   * Check network connectivity
   */
  private isOnline(): boolean {
    // Basic network check - in production you'd use a more robust solution
    return navigator.onLine !== false;
  }

  /**
   * Create offline emergency session (fallback)
   */
  private async createOfflineSession(params: CreateEmergencyParams): Promise<string | null> {
    try {
      console.log('📴 Creating offline emergency session...');
      
      // Generate offline ID
      const offlineId = `offline-${Date.now()}`;
      
      // Store offline session data locally (you'd use AsyncStorage in production)
      const offlineSession: Partial<EmergencySession> = {
        id: offlineId,
        emergencyType: params.emergencyType,
        status: 'active',
        priority: this.determinePriority(params.emergencyType),
        reportedBy: auth.currentUser?.uid || 'offline-user',
        location: new GeoPoint(params.location.latitude, params.location.longitude),
        locationData: params.location,
        description: params.description,
        createdAt: new Date(),
        lastUpdated: new Date(),
        updates: [{
          id: 'initial',
          type: 'status_change',
          message: `${params.emergencyType} emergency reported (OFFLINE MODE)`,
          timestamp: new Date(),
          updatedBy: auth.currentUser?.uid || 'offline-user',
        }],
        metadata: {
          ...params.metadata,
          isOffline: true,
          appVersion: '1.0.0',
        }
      };

      // Set as active session
      this.activeSession = offlineSession as EmergencySession;
      
      // Start offline emergency protocol
      await this.initiateOfflineEmergencyProtocol(offlineId, params);
      
      console.log('✅ Offline emergency session created:', offlineId);
      return offlineId;
    } catch (error) {
      console.error('❌ Failed to create offline emergency session:', error);
      return null;
    }
  }

  /**
   * Initiate offline emergency protocol
   */
  private async initiateOfflineEmergencyProtocol(
    emergencyId: string,
    params: CreateEmergencyParams
  ): Promise<void> {
    try {
      // Start location tracking (works offline)
      await locationService.startEmergencyTracking(emergencyId);
      
      // Start audio recording (works offline)
      await audioService.startEmergencyRecording(emergencyId, params.emergencyType);
      
      // Try to notify (will queue until online)
      console.log('⚠️ Emergency services will be notified when connection is restored');
      
    } catch (error) {
      console.error('❌ Offline emergency protocol failed:', error);
    }
  }

  /**
   * Create new emergency session - Main entry point
   */
  async createEmergencySession(params: CreateEmergencyParams): Promise<string | null> {
    try {
      console.log('🚨 CREATING EMERGENCY SESSION...');
      console.log('Type:', params.emergencyType);
      console.log('Location:', `${params.location.latitude}, ${params.location.longitude}`);

      // Check if online, fallback to offline mode if needed
      if (!this.isOnline()) {
        console.warn('📴 No internet connection - using offline mode');
        return this.createOfflineSession(params);
      }

      if (!auth.currentUser) {
        throw new Error('User must be authenticated to create emergency session');
      }

      // Determine priority based on emergency type
      const priority = this.determinePriority(params.emergencyType);
      
      // Get user profile for context
      const userProfile = await this.getUserProfile(auth.currentUser.uid);

      // Create initial emergency document
      const emergencyData: Partial<EmergencySession> = {
        emergencyType: params.emergencyType,
        status: 'active',
        priority,
        reportedBy: auth.currentUser.uid,
        userProfile,
        location: new GeoPoint(params.location.latitude, params.location.longitude),
        locationData: params.location,
        description: params.description,
        updates: [{
          id: 'initial',
          type: 'status_change',
          message: `${params.emergencyType} emergency reported`,
          timestamp: new Date(),
          updatedBy: auth.currentUser.uid,
        }],
        metadata: {
          ...params.metadata,
          appVersion: '1.0.0',
        }
      };

      // Save to Firestore
      const docRef = await addDoc(collection(db, 'emergencies'), {
        ...emergencyData,
        createdAt: serverTimestamp(),
        lastUpdated: serverTimestamp(),
        // Convert Date objects to Firestore Timestamps for the updates array
        updates: emergencyData.updates?.map(update => ({
          ...update,
          timestamp: Timestamp.fromDate(update.timestamp)
        }))
      });

      const emergencyId = docRef.id;
      console.log('✅ Emergency session created:', emergencyId);

      // Set as active session
      this.activeSession = {
        id: emergencyId,
        assignedSecurity: [],
        assignedVolunteers: [],
        createdAt: new Date(),
        lastUpdated: new Date(),
        ...emergencyData
      } as EmergencySession;

      // Start emergency protocol
      await this.initiateEmergencyProtocol(emergencyId, params);

      return emergencyId;
    } catch (error) {
      console.error('❌ Failed to create emergency session:', error);
      // Fallback to offline mode
      return this.createOfflineSession(params);
    }
  }

  /**
   * Initiate full emergency protocol (location, audio, notifications)
   */
  private async initiateEmergencyProtocol(
    emergencyId: string, 
    params: CreateEmergencyParams
  ): Promise<void> {
    try {
      console.log('🚨 INITIATING EMERGENCY PROTOCOL...');

      // 1. Start location tracking
      console.log('📍 Starting location tracking...');
      const locationStarted = await locationService.startEmergencyTracking(emergencyId);
      if (locationStarted) {
        await this.addUpdate(emergencyId, {
          type: 'location_update',
          message: 'Location tracking activated',
          data: { trackingActive: true }
        });
      }

      // 2. Start audio recording
      console.log('🎤 Starting audio recording...');
      const audioStarted = await audioService.startEmergencyRecording(
        emergencyId, 
        params.emergencyType
      );
      if (audioStarted) {
        await this.addUpdate(emergencyId, {
          type: 'audio_received',
          message: 'Audio recording started',
          data: { recordingActive: true }
        });
      }

      // 3. Alert security team
      console.log('🚓 Alerting security team...');
      const securityAlerted = await notificationService.alertSecurity(
        params.emergencyType,
        params.location,
        emergencyId
      );
      if (securityAlerted) {
        await this.updateStatus(emergencyId, 'acknowledged', 'Security team notified');
      }

      // 4. Notify nearby volunteers (non-blocking)
      console.log('👥 Notifying volunteers...');
      notificationService.notifyNearbyVolunteers(
        params.location,
        params.emergencyType,
        emergencyId
      ).catch(err => console.warn('⚠️ Volunteer notification failed:', err));

      // 5. Notify emergency contacts (non-blocking)
      if (auth.currentUser) {
        console.log('📞 Notifying emergency contacts...');
        notificationService.notifyEmergencyContacts(
          auth.currentUser.uid,
          params.emergencyType,
          params.location,
          emergencyId
        ).catch(err => console.warn('⚠️ Contact notification failed:', err));
      }

      // 6. Set up real-time listeners
      this.setupEmergencyListeners(emergencyId);

      console.log('✅ Emergency protocol initiated successfully');
    } catch (error) {
      console.error('❌ Emergency protocol failed:', error);
      // Don't throw - partial success is better than total failure
    }
  }

  /**
   * Update emergency status
   */
  async updateStatus(
    emergencyId: string, 
    status: EmergencySession['status'], 
    message?: string
  ): Promise<void> {
    try {
      const emergencyRef = doc(db, 'emergencies', emergencyId);
      const updateData: any = {
        status,
        lastUpdated: serverTimestamp(),
      };

      // Set specific timestamps based on status
      switch (status) {
        case 'acknowledged':
          updateData.acknowledgedAt = serverTimestamp();
          break;
        case 'resolved':
          updateData.resolvedAt = serverTimestamp();
          // Stop tracking when resolved
          await this.stopEmergencySession(emergencyId);
          break;
      }

      await updateDoc(emergencyRef, updateData);

      // Add status update
      if (message) {
        await this.addUpdate(emergencyId, {
          type: 'status_change',
          message: `Status: ${status}${message ? ` - ${message}` : ''}`
        });
      }

      // Update local session
      if (this.activeSession && this.activeSession.id === emergencyId) {
        this.activeSession.status = status;
        this.activeSession.lastUpdated = new Date();
      }

      console.log(`✅ Emergency ${emergencyId} status updated to: ${status}`);
    } catch (error) {
      console.error('❌ Failed to update emergency status:', error);
    }
  }

  /**
   * Add update to emergency session
   */
  async addUpdate(emergencyId: string, update: Partial<EmergencyUpdate>): Promise<void> {
    try {
      const fullUpdate: EmergencyUpdate = {
        id: Date.now().toString(),
        timestamp: new Date(),
        updatedBy: auth.currentUser?.uid || 'system',
        type: 'message',
        message: '',
        ...update
      };

      const emergencyRef = doc(db, 'emergencies', emergencyId);
      
      // Get current updates array
      const currentUpdates = this.activeSession?.updates || [];
      const updatedArray = [...currentUpdates, fullUpdate];
      
      await updateDoc(emergencyRef, {
        updates: updatedArray.map(u => ({
          ...u,
          timestamp: Timestamp.fromDate(u.timestamp instanceof Date ? u.timestamp : new Date(u.timestamp))
        })),
        lastUpdated: serverTimestamp(),
      });

      // Update local session
      if (this.activeSession && this.activeSession.id === emergencyId) {
        this.activeSession.updates.push(fullUpdate);
      }

      console.log('✅ Emergency update added:', update.message);
    } catch (error) {
      console.error('❌ Failed to add emergency update:', error);
    }
  }

  /**
   * Stop emergency session and cleanup
   */
  async stopEmergencySession(emergencyId: string): Promise<void> {
    try {
      console.log('🛑 STOPPING EMERGENCY SESSION...');

      // Stop audio recording and upload final file
      const audioResult = await audioService.stopEmergencyRecording(
        emergencyId,
        this.activeSession?.emergencyType || 'UNKNOWN'
      );

      if (audioResult) {
        await this.updateEmergencyWithAudio(emergencyId, audioResult);
      }

      // Stop location tracking
      await locationService.stopTracking();

      // Clean up listeners
      this.cleanupListeners();

      // Final status update
      await this.addUpdate(emergencyId, {
        type: 'resolved',
        message: 'Emergency session ended',
      });

      this.activeSession = null;
      console.log('✅ Emergency session stopped');
    } catch (error) {
      console.error('❌ Error stopping emergency session:', error);
    }
  }

  /**
   * Update emergency with audio information
   */
  async updateEmergencyWithAudio(
    emergencyId: string, 
    audioResult: AudioUploadResult
  ): Promise<void> {
    try {
      const emergencyRef = doc(db, 'emergencies', emergencyId);
      await updateDoc(emergencyRef, {
        audioRecording: {
          url: audioResult.downloadURL,
          fileName: audioResult.fileName,
          uploadedAt: Timestamp.fromDate(audioResult.uploadedAt),
        },
        hasAudio: true,
        lastUpdated: serverTimestamp(),
      });

      await this.addUpdate(emergencyId, {
        type: 'audio_received',
        message: 'Audio recording uploaded and available for review',
        data: { audioUrl: audioResult.downloadURL }
      });

      console.log('✅ Emergency updated with audio');
    } catch (error) {
      console.error('❌ Failed to update emergency with audio:', error);
    }
  }

  /**
   * Get emergency session by ID
   */
  async getEmergencySession(emergencyId: string): Promise<EmergencySession | null> {
    try {
      const emergencyRef = doc(db, 'emergencies', emergencyId);
      const snapshot = await getDoc(emergencyRef);

      if (!snapshot.exists()) {
        return null;
      }

      const data = snapshot.data();
      return {
        id: snapshot.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        lastUpdated: data.lastUpdated?.toDate() || new Date(),
        acknowledgedAt: data.acknowledgedAt?.toDate(),
        resolvedAt: data.resolvedAt?.toDate(),
        updates: (data.updates || []).map((update: any) => ({
          ...update,
          timestamp: update.timestamp?.toDate() || new Date(update.timestamp)
        })),
      } as EmergencySession;
    } catch (error) {
      console.error('❌ Failed to get emergency session:', error);
      return null;
    }
  }

  /**
   * Setup real-time listeners for emergency updates
   */
  private setupEmergencyListeners(emergencyId: string): void {
    try {
      // Listen for emergency document changes
      const emergencyRef = doc(db, 'emergencies', emergencyId);
      const unsubscribe = onSnapshot(emergencyRef, (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          console.log('📡 Emergency update received:', data.status);
          
          // Update local session
          if (this.activeSession && this.activeSession.id === emergencyId) {
            this.activeSession = {
              ...this.activeSession,
              ...data,
              lastUpdated: data.lastUpdated?.toDate() || new Date(),
              updates: (data.updates || []).map((update: any) => ({
                ...update,
                timestamp: update.timestamp?.toDate() || new Date(update.timestamp)
              })),
            } as EmergencySession;
          }
        }
      });

      this.sessionListeners.push(unsubscribe);
    } catch (error) {
      console.error('❌ Failed to setup emergency listeners:', error);
    }
  }

  /**
   * Clean up all listeners
   */
  private cleanupListeners(): void {
    this.sessionListeners.forEach(unsubscribe => unsubscribe());
    this.sessionListeners = [];
  }

  /**
   * Determine priority based on emergency type
   */
  private determinePriority(emergencyType: string): EmergencySession['priority'] {
    const criticalTypes = ['FIRE', 'MEDICAL'];
    const highTypes = ['ROBBERY/THEFT', 'ACCIDENT'];
    
    if (criticalTypes.includes(emergencyType)) return 'critical';
    if (highTypes.includes(emergencyType)) return 'high';
    return 'medium';
  }

  /**
   * Get user profile for emergency context
   */
  private async getUserProfile(userId: string): Promise<any> {
    try {
      const userRef = doc(db, 'users', userId);
      const snapshot = await getDoc(userRef);
      
      if (snapshot.exists()) {
        const data = snapshot.data();
        return {
          name: data.displayName || data.name || 'Anonymous',
          phone: data.phoneNumber,
          studentId: data.studentId,
        };
      }
      
      return { name: 'Anonymous' };
    } catch (error) {
      console.warn('⚠️ Failed to get user profile:', error);
      return { name: 'Anonymous' };
    }
  }

  /**
   * Get active emergency session
   */
  getActiveSession(): EmergencySession | null {
    return this.activeSession;
  }

  /**
   * Check if user has active emergency
   */
  async hasActiveEmergency(userId: string): Promise<boolean> {
    try {
      const emergenciesQuery = query(
        collection(db, 'emergencies'),
        where('reportedBy', '==', userId),
        where('status', 'in', ['active', 'acknowledged', 'responded'])
      );

      const snapshot = await getDocs(emergenciesQuery);
      return !snapshot.empty;
    } catch (error) {
      console.error('❌ Failed to check active emergency:', error);
      return false;
    }
  }

  /**
   * Cancel emergency session
   */
  async cancelEmergency(emergencyId: string, reason?: string): Promise<boolean> {
    try {
      await this.updateStatus(emergencyId, 'cancelled', reason);
      await this.stopEmergencySession(emergencyId);
      
      console.log('✅ Emergency cancelled');
      return true;
    } catch (error) {
      console.error('❌ Failed to cancel emergency:', error);
      return false;
    }
  }

  /**
   * Get emergency statistics for user
   */
  async getUserEmergencyStats(userId: string): Promise<{
    total: number;
    resolved: number;
    avgResponseTime: number;
  }> {
    try {
      const emergenciesQuery = query(
        collection(db, 'emergencies'),
        where('reportedBy', '==', userId)
      );

      const snapshot = await getDocs(emergenciesQuery);
      const emergencies = snapshot.docs.map(doc => doc.data());
      
      const total = emergencies.length;
      const resolved = emergencies.filter(e => e.status === 'resolved').length;
      
      // Calculate average response time (mock implementation)
      const avgResponseTime = 0; // You'd calculate this from actual data
      
      return { total, resolved, avgResponseTime };
    } catch (error) {
      console.error('❌ Failed to get emergency stats:', error);
      return { total: 0, resolved: 0, avgResponseTime: 0 };
    }
  }

  /**
   * Cleanup emergency service
   */
  async cleanup(): Promise<void> {
    try {
      console.log('🧹 Cleaning up EmergencyService...');
      
      if (this.activeSession) {
        await this.stopEmergencySession(this.activeSession.id);
      }
      
      this.cleanupListeners();
      
      // Cleanup other services
      await audioService.cleanup();
      await locationService.cleanup();
      await notificationService.cleanup();
      
      console.log('✅ EmergencyService cleaned up');
    } catch (error) {
      console.error('❌ Error during EmergencyService cleanup:', error);
    }
  }
}

// Export singleton instance
export const emergencyService = new EmergencyService();
export default EmergencyService;

// Export types
export type { EmergencySession, EmergencyUpdate, CreateEmergencyParams };