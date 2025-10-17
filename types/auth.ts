import { User } from "firebase/auth";


// Minimal user info stored in session (decoupled from Firebase's full User object)
export interface UserSession {
    uid: string;
    //Optional fields:
    // email: string | null;
    // displayName: string | null;
    // photoURL: string | null;
    // emailVerified: boolean;
    // lastLogin: string;
  }
  
  // Tokens used for secure API access and session refresh
  export interface AuthTokens {
    idToken?: string | null; // Firebase ID token for authenticated requests
    lastRefresh: string;    // Timestamp of last token refresh
  }
  

  // Full session payload stored in memory or local storage
  export interface SessionData {
    user: UserSession;  // Simplified user info
    tokens: AuthTokens; // Auth tokens for API access
    timestamp: string; // When this session was created or updated
  }
  
  // Context shape exposed via useAuth() hook
  export interface AuthContextType {
    user: User | null;            // Full Firebase user object (optional)
    session: UserSession | null; // Simplified session info
    loading: boolean;             // Whether auth state is still resolving
    logout: () => Promise<void>; // Function to log out and clear session
    isAuthenticated: boolean;   // True if session is valid and user is logged in
  }