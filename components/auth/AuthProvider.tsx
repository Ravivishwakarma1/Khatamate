'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { subscribeToAuthChanges, signOutUser, getAuthCookie, setAuthCookie } from '@/lib/firebase/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Quick initial check from storage/cookies
    if (typeof window !== 'undefined') {
      const savedUserStr = localStorage.getItem('khataflow_user');
      const hasCookie = getAuthCookie();
      if (savedUserStr && hasCookie && !user) {
        try {
          const parsed = JSON.parse(savedUserStr);
          // Set temporary object until Firebase Auth finishes initializing
          setUser(parsed as any);
        } catch (e) {}
      }
    }

    const unsubscribe = subscribeToAuthChanges((firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        setAuthCookie(firebaseUser.email || firebaseUser.uid);
      } else {
        // Check if there is still a valid cookie or localStorage item (e.g. demo mode)
        const hasCookie = getAuthCookie();
        if (!hasCookie) {
          setUser(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await signOutUser();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
