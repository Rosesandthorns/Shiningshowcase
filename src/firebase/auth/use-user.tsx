
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
        
        // Ensure user profile exists in Firestore and has a UID.
        const userDocRef = doc(firestore, 'users', user.uid);
        const docSnap = await getDoc(userDocRef);
        
        if (!docSnap.exists()) {
          // Document doesn't exist, create it.
          console.log(`User profile for ${user.uid} not found. Creating one...`);
          try {
            await updateUserProfile(firestore, user, { displayName: user.displayName || undefined });
            console.log(`Successfully created profile for ${user.uid}.`);
            await user.reload(); 
            setUser(auth.currentUser);
          } catch (error) {
            console.error("Failed to create user profile on login:", error);
            setUser(user);
          }
        } else if (!docSnap.data().uid) {
          // Document exists but is missing the UID field. This will repair it.
          console.log(`User profile for ${user.uid} is missing the 'uid' field. Updating...`);
          try {
            await updateUserProfile(firestore, user, {}); // Calling with empty data triggers the UID update.
            console.log(`Successfully updated profile for ${user.uid} with UID.`);
            setUser(auth.currentUser);
          } catch (error) {
            console.error("Failed to update user profile with UID on login:", error);
            setUser(user);
          }
        } else {
           // Document exists and is correct.
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
