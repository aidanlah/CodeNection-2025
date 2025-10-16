import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC2Am4RLNpn3t5sHoM84luhy2TiVHsZqzg",
  authDomain: "guardu-umonash.firebaseapp.com",
  projectId: "guardu-umonash",
  storageBucket: "guardu-umonash.firebasestorage.app",
  messagingSenderId: "565397046611",
  appId: "1:565397046611:web:337de022989d89af85cda6",
  measurementId: "G-R3HTE8EQ21"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});
export const db = getFirestore(app);

