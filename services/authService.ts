import { 
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    User,
    updateProfile,
    sendPasswordResetEmail
  } from 'firebase/auth';
  import { doc, setDoc, getDoc } from 'firebase/firestore';
  import { auth, db } from '@/firebase.config';
  
  export interface UserData {
    uid: string;
    email: string;
    displayName: string;
    createdAt: Date;
  }
  
  export class AuthService {
    // Sign up with email and password
    static async signUp(email: string, password: string, displayName: string): Promise<User> {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
  
        // Update user profile with display name
        await updateProfile(user, {
          displayName: displayName
        });
  
        // Save user data to Firestore
        const userData: UserData = {
          uid: user.uid,
          email: user.email!,
          displayName: displayName,
          createdAt: new Date()
        };
  
        await setDoc(doc(db, 'users', user.uid), userData);
  
        return user;
      } catch (error: any) {
        throw new Error(error.message);
      }
    }
  
    // Sign in with email and password
    static async signIn(email: string, password: string): Promise<User> {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user;
      } catch (error: any) {
        throw new Error(error.message);
      }
    }
  
    // Sign out
    static async signOut(): Promise<void> {
      try {
        await signOut(auth);
      } catch (error: any) {
        throw new Error(error.message);
      }
    }
  
    // Reset password
    static async resetPassword(email: string): Promise<void> {
      try {
        await sendPasswordResetEmail(auth, email);
      } catch (error: any) {
        throw new Error(error.message);
      }
    }
  
    // Get user data from Firestore
    static async getUserData(uid: string): Promise<UserData | null> {
      try {
        const docRef = doc(db, 'users', uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          return docSnap.data() as UserData;
        }
        return null;
      } catch (error: any) {
        throw new Error(error.message);
      }
    }
  
    // Get current user
    static getCurrentUser(): User | null {
      return auth.currentUser;
    }
  }
  