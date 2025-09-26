import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Alert, 
  Vibration, 
  TouchableOpacity,
  StatusBar,
  ScrollView
} from "react-native";
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Button from "@/components/button";

const EMERGENCY_TYPES = [
  {
    id: 'ROBBERY/THEFT',
    title: 'ROBBERY/THEFT',
    color: '#16a34a',
    priority: 'moderate',
    icon: 'bag' as keyof typeof Ionicons.glyphMap,
  },
  {
    id: 'FIRE',
    title: 'FIRE',
    color: '#16a34a',
    priority: 'high',
    icon: 'flame' as keyof typeof Ionicons.glyphMap,
  },
  {
    id: 'ACCIDENT',
    title: 'ACCIDENT',
    color: '#16a34a',
    priority: 'high',
    icon: 'car-sport' as keyof typeof Ionicons.glyphMap,
  },
  {
    id: 'MEDICAL',
    title: 'MEDICAL',
    color: '#16a34a',
    priority: 'high',
    icon: 'medical' as keyof typeof Ionicons.glyphMap,
  },
  {
    id: 'OTHERS',
    title: 'OTHERS',
    color: '#16a34a',
    priority: 'moderate',
    icon: 'help-circle' as keyof typeof Ionicons.glyphMap,
  }
];

export default function SOSPage() {
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const handleEmergencyTypeSelect = (emergencyType: typeof EMERGENCY_TYPES[0]) => {
    Vibration.vibrate(100);
    
    if (emergencyType.priority === 'high') {
      Alert.alert(
        emergencyType.title,
        `This will immediately alert security and emergency services. Are you sure you need assistance?`,
        [
          { 
            text: 'Cancel', 
            style: 'cancel',
            onPress: () => setSelectedType(null)
          },
          { 
            text: 'YES', 
            style: 'destructive',
            onPress: () => proceedToVoiceMessage(emergencyType.id)
          }
        ]
      );
    } else {
      Alert.alert(
        emergencyType.title,
        'Report emergency?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'YES', 
            onPress: () => proceedToVoiceMessage(emergencyType.id)
          }
        ]
      );
    }
  };

  const proceedToVoiceMessage = (emergencyType: string) => {
    console.log(`🚨 Emergency Type Selected: ${emergencyType}`);
    
    router.push({
      pathname: '/voice-message',
      params: { emergencyType }
    });
  };

  const handleBackPress = () => {
    Alert.alert(
      'Exit Emergency?',
      'Are you sure you want to exit the emergency screen?',
      [
        { text: 'Stay', style: 'cancel' },
        { text: 'Exit', onPress: () => router.back() }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#16a34a" />
      
      {/* Extended Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBackPress}
        >
          <Ionicons name="chevron-back" size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Emergency Services</Text>
        <View style={styles.backButton} />
      </View>
      
      <View style={styles.content}>
        <View style={styles.headerSection}>
          <View style={styles.warningIconContainer}>
            <Ionicons name="warning" size={36} color="#FF4444" />
          </View>
          <Text style={styles.headerSubtitle}>Select Emergency Type</Text>
          <Text style={styles.headerDescription}>
            Choose the type of emergency to get the fastest response
          </Text>
        </View>

        <View style={styles.emergencyGrid}>
          {EMERGENCY_TYPES.map((emergency) => (
            <TouchableOpacity
              key={emergency.id}
              style={[
                styles.emergencyButton,
                { backgroundColor: emergency.color }
              ]}
              onPress={() => handleEmergencyTypeSelect(emergency)}
              activeOpacity={0.8}
            >
              <View style={styles.buttonContent}>
                <View style={styles.iconContainer}>
                  <Ionicons 
                    name={emergency.icon} 
                    size={28} 
                    color="white" 
                    style={styles.buttonIcon}
                  />
                </View>
                <Text style={styles.emergencyButtonText}>
                  {emergency.title}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#16a34a',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 12,
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
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerSection: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: '100%',
    marginBottom: 10,
  },
  warningIconContainer: {
    width: 56,
    height: 56,
    backgroundColor: '#FFF5F5',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
    textAlign: 'center',
  },
  headerDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 22,
  },
  emergencyGrid: {
    width: '100%',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    justifyContent: 'center',
  },
  emergencyButton: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 70,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  iconContainer: {
    marginRight: 15,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonIcon: {
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  emergencyButtonText: {
    fontSize: 20,
    fontWeight: '800',
    color: 'white',
    textAlign: 'center',
    flex: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});