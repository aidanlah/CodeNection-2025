// services/AudioService.ts
import { Audio } from 'expo-av';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export interface AudioUploadResult {
  downloadURL: string;
  fileName: string;
  uploadedAt: Date;
}

class AudioService {
  private recording: Audio.Recording | null = null;
  private isRecording: boolean = false;
  private audioLevelCallback?: (level: number) => void;

  async initialize(): Promise<boolean> {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
      return true;
    } catch (error) {
      console.error('Failed to initialize AudioService:', error);
      return false;
    }
  }

  async startEmergencyRecording(emergencyId: string, emergencyType: string): Promise<boolean> {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') return false;

      await this.initialize();
      
      this.recording = new Audio.Recording();
      await this.recording.prepareToRecordAsync({
        ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
        android: {
          extension: '.m4a',
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
        },
        ios: {
          extension: '.m4a',
          outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
          audioQuality: Audio.IOSAudioQuality.HIGH,
        },
      } as Audio.RecordingOptions);

      await this.recording.startAsync();
      this.isRecording = true;

      // Set up audio level monitoring
      this.recording.setOnRecordingStatusUpdate((status) => {
        if (this.audioLevelCallback && status.metering) {
          this.audioLevelCallback(status.metering);
        }
      });

      return true;
    } catch (error) {
      console.error('Failed to start recording:', error);
      return false;
    }
  }

  async stopEmergencyRecording(emergencyId: string, emergencyType: string): Promise<AudioUploadResult | null> {
    try {
      if (!this.recording || !this.isRecording) return null;

      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI();
      this.isRecording = false;

      if (!uri) return null;

      // Upload to Firebase Storage
      const fileName = `emergency-audio/${emergencyId}-${Date.now()}.m4a`;
      const response = await fetch(uri);
      const blob = await response.blob();
      
      const storage = getStorage();
      const storageRef = ref(storage, fileName);
      
      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);

      return {
        downloadURL,
        fileName,
        uploadedAt: new Date(),
      };
    } catch (error) {
      console.error('Failed to stop recording:', error);
      return null;
    }
  }

  setAudioLevelCallback(callback: (level: number) => void): void {
    this.audioLevelCallback = callback;
  }

  async cleanup(): Promise<void> {
    if (this.recording && this.isRecording) {
      await this.recording.stopAndUnloadAsync();
    }
    this.recording = null;
    this.isRecording = false;
    this.audioLevelCallback = undefined;
  }
}

export const audioService = new AudioService();