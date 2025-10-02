'use client';

import {
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import {
  useEffect,
  useState,
  createContext,
  useContext,
  type ReactNode,
} from 'react';
import { useAuth } from '../provider';

export type UserState = {
  user: User | null;
  loading: boolean;
};

const UserContext = createContext<UserState>({
  user: null,
  loading: true,
});

export function UserProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      if (user) {
        console.log(`Auth state changed: User is signed in as ${user.displayName} (${user.email})`);
      } else {
        console.log("Auth state changed: No user is signed in.");
      }
    });

    return () => unsubscribe();
  }, [auth]);

  return (
    <UserContext.Provider value={{ user, loading }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => {
  const context = useContext(UserContext);

  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }

  return context;
};
