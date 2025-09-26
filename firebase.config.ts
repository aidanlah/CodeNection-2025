import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyC2Am4RLNpn3t5sHoM84luhy2TiVHsZqzg",
  authDomain: "guardu-umonash.firebaseapp.com",
  projectId: "guardu-umonash",
  storageBucket: "guardu-umonash.firebasestorage.app",
  messagingSenderId: "565397046611",
  appId: "1:565397046611:web:337de022989d89af85cda6",
  measurementId: "G-R3HTE8EQ21"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);
