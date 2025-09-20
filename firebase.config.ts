// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// Note: Analytics may not work properly in React Native, so we'll omit it for now
// import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
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
// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);


// Test function (remove this after testing)
export const testFirebaseConnection = () => {
  console.log("Firebase app name:", app.name);
  console.log("Firebase auth instance:", auth.app.name);
  console.log("Firestore instance:", db.app.name);
  console.log("✅ Firebase configuration is working!");
};

// this stays
export default app;