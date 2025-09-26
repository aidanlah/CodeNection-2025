import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
  Vibration,
  StatusBar,
  Pressable,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

//Import these for backend implementation when ready
import { Audio } from 'expo-av';
import * as Location from 'expo-location';
import { auth, db } from '@/firebase.config';

// Import services
import { emergencyService } from '@/services/EmergencyService';
import { locationService } from '@/services/LocationService';
import { audioService } from '@/services/AudioService';

interface EmergencySession {
  id: string;
  emergencyType: string;
  location: {
    latitude: number;
    longitude: number;
  };
  audioRecording?: string;
  timestamp: Date;
  status: 'active' | 'responded' | 'resolved';
  reportedBy: string;
}

// Create ErrorBoundary component for emergency pages
class EmergencyErrorBoundary extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text>Emergency service error. Please call security directly.</Text>
        </View>
      );
    }

    return this.props.children;
  }
}

export default function VoiceMessagePage() {
  const params = useLocalSearchParams();
  const emergencyType = params.emergencyType as string || 'EMERGENCY';
  
  // State management
  const [isRecording, setIsRecording] = useState(false);
  const [isPressing, setIsPressing] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'failed'>('connecting');
  const [securityNotified, setSecurityNotified] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [securityETA, setSecurityETA] = useState('2-5 min');

  // Animation references
  const bounceAnim = useRef(new Animated.Value(1)).current;
  const waveAnimations = useRef(
    Array.from({ length: 12 }, () => new Animated.Value(0.3))
  ).current;
  const staticWaveAnimations = useRef(
    Array.from({ length: 12 }, () => new Animated.Value(0.4))
  ).current;
  
  // Timer reference for cleanup
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-start recording and location sharing when component mounts
  useEffect(() => {
    initializeEmergencySession();
    startBounceAnimation();
    startStaticWaveAnimation();
    
    return () => {
      cleanup();
    };
  }, []);

  // Start audio level simulation when recording starts
  useEffect(() => {
    if (isRecording) {
      simulateAudioWaves();
    }
  }, [isRecording]);

  const initializeEmergencySession = async () => {
    try {
      console.log('🚨 EMERGENCY SESSION STARTING');
      console.log('Emergency Type:', emergencyType);
      
      // Simulate connection process
      setTimeout(() => {
        setConnectionStatus('connected');
        setSecurityNotified(true);
        console.log('✅ Emergency session connected');
      }, 2000);
      
    } catch (error) {
      console.error('⚠️ Emergency initialization failed:', error);
      setConnectionStatus('failed');
    }
  };

  const startRecordingTimer = () => {
    timerRef.current = setInterval(() => {
      setRecordingDuration(prev => prev + 1);
    }, 1000);
  };

  const stopRecordingTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startBounceAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const startStaticWaveAnimation = () => {
    staticWaveAnimations.forEach((anim, index) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 0.2 + (Math.sin(index * 0.5) + 1) * 0.15,
            duration: 1500 + index * 200,
            useNativeDriver: false,
          }),
          Animated.timing(anim, {
            toValue: 0.1 + (Math.sin(index * 0.3) + 1) * 0.1,
            duration: 1200 + index * 150,
            useNativeDriver: false,
          }),
        ])
      ).start();
    });
  };

  const simulateAudioWaves = () => {
    const animateWaves = () => {
      waveAnimations.forEach((anim, index) => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(anim, {
              toValue: Math.random() * 0.8 + 0.5,
              duration: 100 + Math.random() * 150,
              useNativeDriver: false,
            }),
            Animated.timing(anim, {
              toValue: 0.2 + Math.random() * 0.3,
              duration: 100 + Math.random() * 150,
              useNativeDriver: false,
            }),
          ])
        ).start();
      });
    };

    if (isRecording) {
      animateWaves();
      setTimeout(simulateAudioWaves, 200);
    }
  };

  const handleBackPress = () => {
    Alert.alert(
      'End Emergency Call?',
      'Are you sure you want to end this emergency session?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Call',
          style: 'destructive',
          onPress: () => {
            router.back();
          }
        }
      ]
    );
  };

  const handleMicPress = () => {
    setIsPressing(true);
    setIsRecording(true);
    startRecordingTimer();
    Vibration.vibrate(50);
    
    // Stop bounce animation when pressed
    bounceAnim.stopAnimation();
    Animated.timing(bounceAnim, {
      toValue: 0.9,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const handleMicRelease = () => {
    setIsPressing(false);
    setIsRecording(false);
    stopRecordingTimer();
    
    // Resume bounce animation
    Animated.timing(bounceAnim, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }).start(() => {
      startBounceAnimation();
    });
  };

  const handleEndEmergency = () => {
    Alert.alert(
      'End Emergency Call?',
      'Are you sure you want to end this emergency session?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Call',
          style: 'destructive',
          onPress: () => {
            router.back();
          }
        }
      ]
    );
  };

  const cleanup = async () => {
    console.log('🧹 CLEANING UP EMERGENCY SESSION');
    
    // Clean up timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // Clean up audio service
    await audioService.cleanup();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusMessage = () => {
    switch (connectionStatus) {
      case 'connecting':
        return 'Connecting to emergency services...';
      case 'connected':
        return 'Connected to emergency services';
      case 'failed':
        return 'Connection failed. Please try again.';
      default:
        return 'Connecting...';
    }
  };

  const getEmergencyColor = () => {
    return '#16a34a';
  };

  return (
    <EmergencyErrorBoundary>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#16a34a" />
        
        {/* Custom Header with Back Button */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={handleBackPress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{`${emergencyType} EMERGENCY`}</Text>
          <View style={styles.backButton} />
        </View>
        
        <View style={styles.content}>
          {/* Connection Status with Location Info */}
          <View style={styles.statusSection}>
            <View style={styles.statusIndicator}>
              <Ionicons 
                name={connectionStatus === 'connected' ? 'checkmark-circle' : 'radio'} 
                size={18} 
                color={connectionStatus === 'connected' ? '#4CAF50' : '#FFA500'} 
              />
              <View style={styles.statusTextContainer}>
                <Text style={styles.statusText}>{getStatusMessage()}</Text>
                {connectionStatus === 'connected' && (
                  <Text style={styles.locationSubtitle}>Location is being shared</Text>
                )}
              </View>
            </View>

            {/* Security Status - directly below connection status */}
            {securityNotified && (
              <View style={styles.securityCard}>
                <Ionicons name="shield-checkmark" size={18} color="#2196F3" />
                <View style={styles.securityInfo}>
                  <Text style={styles.securityText}>Security en route</Text>
                  <Text style={styles.etaText}>ETA: {securityETA}</Text>
                </View>
              </View>
            )}
          </View>

          {/* Audio Visualization - centered and prominent */}
          <View style={styles.audioContainer}>
            <View style={styles.audioLineContainer}>
              {isRecording ? (
                <View style={styles.waveform}>
                  {waveAnimations.map((anim, index) => (
                    <Animated.View
                      key={index}
                      style={[
                        styles.wave,
                        {
                          height: anim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [10, 70],
                          }),
                          backgroundColor: '#16a34a',
                        }
                      ]}
                    />
                  ))}
                </View>
              ) : (
                <View style={styles.waveform}>
                  {staticWaveAnimations.map((anim, index) => (
                    <Animated.View
                      key={index}
                      style={[
                        styles.staticWave,
                        {
                          height: anim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [8, 35],
                          }),
                          backgroundColor: '#16a34a',
                          opacity: 0.6,
                        }
                      ]}
                    />
                  ))}
                </View>
              )}
            </View>
            
            <Text style={styles.holdToTalkText}>
              {isRecording ? `Recording: ${formatTime(recordingDuration)}` : 'Hold to talk'}
            </Text>
          </View>

          {/* Emergency Instructions */}
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionText}>
              • Stay calm and speak clearly
            </Text>
            <Text style={styles.instructionText}>
              • Describe your exact location
            </Text>
            <Text style={styles.instructionText}>
              • Explain what happened
            </Text>
            <Text style={styles.instructionText}>
              • Follow security's instructions
            </Text>
          </View>
        </View>

        {/* Bottom Controls */}
        <View style={styles.bottomControls}>
          {/* Mic Button */}
          <Animated.View style={{ transform: [{ scale: bounceAnim }] }}>
            <Pressable
              style={[
                styles.micButton, 
                { 
                  backgroundColor: getEmergencyColor(),
                  borderColor: isPressing ? 'white' : 'transparent',
                  borderWidth: isPressing ? 3 : 0,
                }
              ]}
              onPressIn={handleMicPress}
              onPressOut={handleMicRelease}
            >
              <Ionicons 
                name="mic" 
                size={32} 
                color="white" 
              />
            </Pressable>
          </Animated.View>

          {/* End call button - below the mic button */}
          <TouchableOpacity 
            style={styles.endCallButton}
            onPress={handleEndEmergency}
          >
            <Ionicons name="call" size={20} color="white" />
            <Text style={styles.endCallText}>End Emergency Call</Text>
          </TouchableOpacity>
        </View>
      </View>
    </EmergencyErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFE5E5',
  },
  header: {
    backgroundColor: '#16a34a',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  statusSection: {
    gap: 12,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  statusTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  statusText: {
    fontSize: 15,
    color: '#333',
    fontWeight: '600',
  },
  locationSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  securityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  securityInfo: {
    marginLeft: 12,
    flex: 1,
  },
  securityText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  etaText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  audioContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  audioLineContainer: {
    width: '90%',
    alignItems: 'center',
    justifyContent: 'center',
    height: 80,
    marginBottom: 16,
  },
  waveform: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 80,
    width: '100%',
    gap: 5,
  },
  wave: {
    width: 4,
    borderRadius: 2,
    opacity: 0.9,
  },
  staticWave: {
    width: 4,
    borderRadius: 2,
  },
  holdToTalkText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  instructionsContainer: {
    backgroundColor: '#E3F2FD',
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  instructionText: {
    fontSize: 14,
    color: '#1976D2',
    marginBottom: 8,
    lineHeight: 20,
  },
  bottomControls: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    alignItems: 'center',
    gap: 20,
  },
  micButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#16a34a',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  endCallButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    backgroundColor: '#FF4444',
    minWidth: 180,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  endCallText: {
    color: 'white',
    marginLeft: 6,
    fontWeight: '600',
    fontSize: 14,
  },
});