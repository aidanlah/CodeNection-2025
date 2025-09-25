import { auth, db } from "@/firebase.config";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  getIdToken,
} from "firebase/auth";
import { PublicRoute } from "@/components/publicRoute";
import { SessionManager } from "@/services/sessionManager";


interface InputFieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address";
  iconName: keyof typeof Ionicons.glyphMap;
  error?: string;
}

const updateLastLoginTime = async (userId: string) => {
  try {
    console.log("Attempting to update last login for user:", userId);

    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      lastLoginAt: serverTimestamp(),
    });
    console.log(userId);
    console.log("Last login time updated successfully");
  } catch (error: any) {
    console.error("Error updating last login time:", error);

    if (error.code === "permission-denied") {
      console.log(
        "Permission denied - check if user document exists with correct ID"
      );
    } else if (error.code === "not-found") {
      console.log("User document not found - may need to create profile");
    }
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
          autoCapitalize="none"
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

const SignInPage: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );

  const { width } = Dimensions.get('window');
  const imageSize = Math.min(width * 0.6, 200); // Responsive sizing

  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!password.trim()) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = async (): Promise<void> => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Auth with Firebase
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Update last login time
      await updateLastLoginTime(user.uid);

      // Store session
      const token = await getIdToken(user);
      await SessionManager.storeSession(user, token)
      console.log('page: session stored')
      
    } catch (error: any) {
      console.error("Sign in error:", error);

      let errorMessage = "Sign In Failed. Please try again.";
      switch (error.code) {
        case "auth/user-not-found":
          errorMessage = "No account found with this email address.";
          break;
        case "auth/wrong-password":
          errorMessage = "Incorrect password.";
          break;
        case "auth/invalid-email":
          errorMessage = "Invalid email address.";
          break;
        case "auth/invalid-credential":
          errorMessage = "Invalid email or password.";
          break;
        case "auth/user-disabled":
          errorMessage = "This account has been disabled.";
          break;
        case "auth/too-many-requests":
          errorMessage = "Too many failed attempts. Please try again later.";
          break;
        case "auth/network-request-failed":
          errorMessage = "Network issue. Please check your connection.";
          break;
        default:
          errorMessage = error.message || errorMessage;
      }
      Alert.alert("Sign In Failed", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (): Promise<void> => {
    if (!email.trim()) {
      Alert.alert("Email Required", "Please enter your email address first");
      return;
    }

    try {
      // Sending password reset email
      await sendPasswordResetEmail(auth, email);
      Alert.alert(
        "Password Reset",
        "A password reset email has been sent to your email address"
      );
    } catch (error: any) {
      console.error("Password reset error:", error);

      let errorMessage = "Failed to send password reset email.";

      switch (error.code) {
        case "auth/user-not-found":
          errorMessage = "No account found with this email address.";
          break;
        case "auth/invalid-email":
          errorMessage = "Invalid email address.";
          break;
        default:
          errorMessage = error.message || errorMessage;
      }

      Alert.alert("Error", errorMessage);
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
          contentContainerStyle={{ paddingBottom: 50 }}
        >
          {/* Logo Section - Fixed container with proper spacing */}
          <View className="items-center py-6 mt-4">
            <View className="items-center justify-center" style={{ minHeight: imageSize + 40 }}>
              <Image
                source={require("@/assets/images/guardu.png")}
                style={{
                  width: imageSize,
                  height: imageSize,
                }}
                resizeMode="contain"
              />
            </View>
            <Text className="text-3xl font-bold text-gray-700 mb-2 mt-4">
              WELCOME BACK
            </Text>
          </View>

          {/* Form Section */}
          <View className="bg-white rounded-2xl p-6 shadow-sm mb-6">
            <InputField
              label="Email Address"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              iconName="mail"
              error={errors.email}
            />


              <InputField
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={true}
                iconName="lock-closed"
                error={errors.password}
              />

              
            <TouchableOpacity
              onPress={handleForgotPassword}
              className="self-end mb-6"
              activeOpacity={0.7}
            >
              <Text className="text-green-700 font-medium">
                Forgot Password?
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSignIn}
              disabled={loading}
              className={`py-4 rounded-xl ${
                loading ? "bg-gray-400" : "bg-green-600 active:scale-98"
              }`}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-bold text-lg text-center">
                  Sign In
)}
                </Text>
              </TouchableOpacity>


            </View>

          
          {/* Sign Up Link */}
          <View className="flex-row justify-center items-center mb-8">
            <Text className="text-gray-600 text-base">
              Don't have an account?{" "}
            </Text>
            
            

              <Link href={"/sign-up"}>
                <Text className="text-green-600 font-semibold text-base">
                  Sign Up
                </Text>
              </Link>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </PublicRoute>
  );
};

export default SignInPage;
