import { createContext, useContext, useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { api } from '../services/api';

// Initialize Firebase
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Check if Firebase is configured
console.log('Firebase config:', firebaseConfig);
const isFirebaseConfigured = firebaseConfig.apiKey && firebaseConfig.apiKey !== 'your_firebase_api_key';
console.log('Firebase configured:', isFirebaseConfigured);

let app, auth;

if (isFirebaseConfigured) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
}

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkAuth, setCheckAuth] = useState(0);

  useEffect(() => {
    console.log('AuthContext useEffect - isFirebaseConfigured:', isFirebaseConfigured);
    
    // Check for MetaMask authentication first
    const authToken = localStorage.getItem('authToken');
    const userData = localStorage.getItem('user');
    
    if (authToken && userData) {
      console.log('Found MetaMask authentication token');
      console.log('AuthToken:', authToken);
      console.log('UserData:', userData);
      try {
        const user = JSON.parse(userData);
        console.log('Parsed user:', user);
        setUser(user);
        setLoading(false);
        return;
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      }
    }
    
    if (!isFirebaseConfigured) {
      console.log('Firebase not configured, using demo mode');
      setUser({ uid: 'yk6q5OOywZRSmt4SOvOjdTpCftZ2', email: 'test1@gmail.com' });
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Sync user with backend
          await api.signIn(firebaseUser.email, firebaseUser.uid);
          setUser({ uid: firebaseUser.uid, email: firebaseUser.email });
        } catch (error) {
          console.error('Error syncing user:', error);
          setUser({ uid: firebaseUser.uid, email: firebaseUser.email });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [checkAuth]);

  const signUp = async (email, password) => {
    if (!isFirebaseConfigured) {
      console.log('Demo mode: signUp called with', email);
      return Promise.resolve({ uid: 'demo-user', email });
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await api.signUp(email, userCredential.user.uid);
      return userCredential.user;
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const signIn = async (email, password) => {
    if (!isFirebaseConfigured) {
      console.log('Demo mode: signIn called with', email);
      return Promise.resolve({ uid: 'demo-user', email });
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await api.signIn(email, userCredential.user.uid);
      return userCredential.user;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const logout = async () => {
    // Clear MetaMask authentication tokens
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    
    if (!isFirebaseConfigured) {
      console.log('Demo mode: logout called');
      setUser(null);
      return Promise.resolve();
    }

    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const refreshAuth = () => {
    console.log('Refreshing authentication...');
    setCheckAuth(prev => prev + 1);
  };

  const value = {
    user,
    signUp,
    signIn,
    logout,
    loading,
    refreshAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
