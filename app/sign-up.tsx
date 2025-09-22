import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from '@/firebase.config';
import { PublicRoute } from "@/components/publicRoute";
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

interface InputFieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "phone-pad" | "numeric";
  iconName: keyof typeof Ionicons.glyphMap;
  error?: string;
}

const generateDisplayID = (fullName: string, studentID: string): string => {
  // Extract first name (everything before first space or comma)
  let firstName = fullName.split(/[\s,]+/)[0].toLowerCase();
  
  // Get first 4 characters, pad with last character if needed
  let namePrefix = firstName.substring(0, 4);
  if (namePrefix.length < 4) {
    const lastChar = firstName.charAt(firstName.length - 1) || 'x';
    namePrefix = namePrefix + lastChar.repeat(4 - namePrefix.length);
  }
  
  // Get last 4 digits of student ID
  const idSuffix = studentID.slice(-4);
  
  // First 4 char + last 4 ID no.
  return namePrefix + idSuffix;
};

const createUserProfile = async (user: any, formData: any) => {
  try {
    const displayID = generateDisplayID(formData.fullName, formData.studentID);

    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, {
      email: user.email,
      fullName: formData.fullName,
      displayID: displayID,
      studentID: formData.studentID,
      phoneNumber: formData.phoneNumber,
      isVolunteer: false, // Default to false, can be changed later
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
    });
    console.log('User profile created successfully');
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
};

const InputField: React.FC<InputFieldProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = "default",
  iconName,
  error,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View className="mb-4">
      <Text className="text-gray-700 font-semibold mb-2 text-base">
        {label}
      </Text>
      <View
        className={`flex-row items-center bg-white rounded-xl border px-4 py-4 ${
          error ? "border-red-300" : "border-gray-200"
        }`}
      >
        <Ionicons
          name={iconName}
          size={20}
          color={error ? "#EF4444" : "#6B7280"}
        />
        <TextInput
          className="flex-1 ml-3 text-gray-800 text-base"
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry && !showPassword}
          keyboardType={keyboardType}
          autoCapitalize={secureTextEntry ? "none" : "words"}
          autoCorrect={false}
        />
        {secureTextEntry && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            className="p-1"
          >
            <Ionicons
              name={showPassword ? "eye-off" : "eye"}
              size={20}
              color="#6B7280"
            />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text className="text-red-500 text-sm mt-1 ml-1">{error}</Text>}
    </View>
  );
};

const SignUpPage: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    studentID: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<{
    fullName?: string;
    email?: string;
    studentID?: string;
    phoneNumber?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    // Full name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = "Full name must be at least 2 characters";
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Student ID validation
    if (!formData.studentID.trim()) {
      newErrors.studentID = "Student ID is required";
    } else if (!/^\d{8}$/.test(formData.studentID)) {
      newErrors.studentID = "Student ID must be exactly 8 digits";
    }

    // Phone number validation (basic)
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (!/^\d{10,15}$/.test(formData.phoneNumber.replace(/\s/g, ''))) {
      newErrors.phoneNumber = "Please enter a valid phone number (10-15 digits)";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async (): Promise<void> => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Create user with Firebase auth
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      // Update the user's display name
      await updateProfile(user, {
        displayName: formData.fullName
      });

      // Create user profile in Firestore
      await createUserProfile(user, formData);

      const displayID = generateDisplayID(formData.fullName, formData.studentID);

      Alert.alert(
        "Account Created",
        `Welcome to GuardU! Your display ID is: ${displayID}`,
        [
          {
            text: "OK",
            onPress: () => router.replace('./(tabs)')
          },
        ]
      );
    } catch (error: any) {
      console.error('Sign up error:', error);
      
      let errorMessage = 'Account creation failed. Please try again.';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'An account with this email already exists.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password should be at least 6 characters.';
          break;
        default:
          errorMessage = error.message || errorMessage;
      }
      Alert.alert("Sign Up Failed", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const navigateToSignIn = (): void => {
    router.push({pathname: '/sign-in'});
  };

  const updateFormData = (
    field: keyof typeof formData,
    value: string
  ): void => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <PublicRoute>
    <SafeAreaView className="flex-1 bg-gray-50">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          className="flex-1 px-6"
          showsVerticalScrollIndicator={false}
        >
          <View className="items-center py-6">
            <View className="bg-green-500 p-4 rounded-full mb-4">
              <Ionicons name="person-add" size={32} color="#fff" />
            </View>
            <Text className="text-2xl font-bold text-gray-900 mb-2">
              Join Our Community
            </Text>
            <Text className="text-gray-600 text-center text-base">
              Create your account to start your safety journey
            </Text>
          </View>

          <View className="bg-white rounded-2xl p-6 shadow-sm mb-6">
            <InputField
              label="Full Name"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChangeText={(value) => updateFormData("fullName", value)}
              iconName="person"
              error={errors.fullName}
            />

            <InputField
              label="Email Address"
              placeholder="Enter your email"
              value={formData.email}
              onChangeText={(value) => updateFormData("email", value)}
              keyboardType="email-address"
              iconName="mail"
              error={errors.email}
            />

            <InputField
              label="Student ID"
              placeholder="Enter your 8-digit student ID"
              value={formData.studentID}
              onChangeText={(value) => updateFormData("studentID", value)}
              keyboardType="numeric"
              iconName="school"
              error={errors.studentID}
            />

            <InputField
              label="Phone Number"
              placeholder="Enter phone number (with country code)"
              value={formData.phoneNumber}
              onChangeText={(value) => updateFormData("phoneNumber", value)}
              keyboardType="phone-pad"
              iconName="call"
              error={errors.phoneNumber}
            />

            <InputField
              label="Password"
              placeholder="Create a password"
              value={formData.password}
              onChangeText={(value) => updateFormData("password", value)}
              secureTextEntry={true}
              iconName="lock-closed"
              error={errors.password}
            />

            <InputField
              label="Confirm Password"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChangeText={(value) => updateFormData("confirmPassword", value)}
              secureTextEntry={true}
              iconName="lock-closed"
              error={errors.confirmPassword}
            />

            <TouchableOpacity
              onPress={handleSignUp}
              disabled={loading}
              className={`py-4 rounded-xl ${
                loading ? "bg-gray-400" : "bg-green-500 active:scale-98"
              }`}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-bold text-lg text-center">
                  Create Account
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <View className="flex-row justify-center items-center mb-8">
            <Text className="text-gray-600 text-base">
              Already have an account?{" "}
            </Text>
            <TouchableOpacity onPress={navigateToSignIn} activeOpacity={0.7}>
              <Text className="text-green-600 font-semibold text-base">
                Sign In
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
    </PublicRoute>
  );
};

export default SignUpPage;
