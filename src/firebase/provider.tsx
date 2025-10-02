'use client';

import {
  createContext,
  useContext,
  type ReactNode,
} from 'react';
import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';

export type FirebaseContextValue = {
  firebaseApp: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
};

const FirebaseContext = createContext<FirebaseContextValue | undefined>(
  undefined,
);

export type FirebaseProviderProps = {
  children: ReactNode;
  value: FirebaseContextValue;
};

export function FirebaseProvider({
  children,
  value,
}: FirebaseProviderProps) {
  const FirebaseContextProvider = FirebaseContext.Provider;
  return (
    <FirebaseContextProvider value={value}>{children}</FirebaseContextProvider>
  );
}

export function useFirebase() {
  const context = useContext(FirebaseContext);

  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }

  return context;
}

export function useFirebaseApp() {
  const { firebaseApp } = useFirebase();
  return firebaseApp;
}

export function useAuth() {
  const { auth } = useFirebase();
  return auth;
}

export function useFirestore() {
  const { firestore } = useFirebase();
  return firestore;
}
