import { createContext, useContext, useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signUp = async (email, password) => {
    // For demo purposes, create a mock user
    const mockUser = {
      uid: 'demo-user-' + Date.now(),
      email: email,
      getIdToken: () => Promise.resolve('demo-token')
    };
    setUser(mockUser);
    return mockUser;
  };

  const signIn = async (email, password) => {
    // For demo purposes, create a mock user
    const mockUser = {
      uid: 'demo-user-' + Date.now(),
      email: email,
      getIdToken: () => Promise.resolve('demo-token')
    };
    setUser(mockUser);
    return mockUser;
  };

  const logout = async () => {
    setUser(null);
  };

  const value = {
    user,
    signUp,
    signIn,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
