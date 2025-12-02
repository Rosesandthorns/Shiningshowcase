
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
import { useAuth, useFirestore } from '../provider';
import { doc, getDoc } from 'firebase/firestore';
import { updateUserProfile } from '@/lib/user';

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
  const firestore = useFirestore();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log(`Auth state changed: User is signed in as ${user.displayName} (${user.email})`);
        
        // Ensure user profile exists in Firestore.
        const userDocRef = doc(firestore, 'users', user.uid);
        const docSnap = await getDoc(userDocRef);
        
        if (!docSnap.exists()) {
          console.log(`User profile for ${user.uid} not found. Creating one...`);
          try {
            await updateUserProfile(firestore, user, { displayName: user.displayName || undefined });
            console.log(`Successfully created profile for ${user.uid}.`);
            // We might need to refresh the user object to get the new display name if it was generated
            await user.reload(); 
            setUser(auth.currentUser); // Set the updated user object
          } catch (error) {
            console.error("Failed to create user profile on login:", error);
          }
        } else {
           setUser(user);
        }

      } else {
        console.log("Auth state changed: No user is signed in.");
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth, firestore]);

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
