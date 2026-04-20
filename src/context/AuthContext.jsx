import { createContext, useContext, useEffect, useState } from 'react';
import {
  auth,
  subscribeToAuth,
  loginWithEmail,
  loginWithGoogle,
  logout,
  registerWithEmail,
  getCurrentUser,
  getUserMetadata,
} from '../services/firebase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [metadata, setMetadata] = useState(null);

  useEffect(() => {
    const unsubscribe = subscribeToAuth(async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        const meta = await getUserMetadata(firebaseUser.uid);
        setMetadata(meta);
      } else {
        setUser(null);
        setMetadata(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    const u = await loginWithEmail(email, password);
    const meta = await getUserMetadata(u.uid);
    setMetadata(meta);
    return u;
  };

  const googleLogin = async () => {
    const u = await loginWithGoogle();
    const meta = await getUserMetadata(u.uid);
    setMetadata(meta);
    return u;
  };

  const register = async (email, password, displayName) => {
    const u = await registerWithEmail(email, password, displayName);
    const meta = await getUserMetadata(u.uid);
    setMetadata(meta);
    return u;
  };

  const signout = async () => {
    await logout();
    setUser(null);
    setMetadata(null);
  };

  const refreshMetadata = async () => {
    if (user) {
      const meta = await getUserMetadata(user.uid);
      setMetadata(meta);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      metadata,
      login,
      googleLogin,
      register,
      signout,
      refreshMetadata,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
