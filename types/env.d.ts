// Type declarations for environment variables imported via '@env'
// Used with react-native-dotenv or similar plugins to enable type-safe access
// 
declare module '@env' {
  export const FIREBASE_API_KEY: string;
  export const FIREBASE_APP_ID: string;
  export const FIREBASE_MEASUREMENT_ID: string;
}
