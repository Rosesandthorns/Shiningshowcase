'use client';

import {
  type ReactNode,
  useState,
  useEffect,
} from 'react';
import { initializeFirebase } from '.';
import {
  FirebaseProvider,
  type FirebaseContextValue,
} from './provider';
import { Skeleton } from '@/components/ui/skeleton';

export type FirebaseClientProviderProps = {
  children: ReactNode;
};

export function FirebaseClientProvider({
  children,
}: FirebaseClientProviderProps) {
  const [firebase, setFirebase] = useState<FirebaseContextValue | null>(null);

  useEffect(() => {
    const { firebaseApp, auth } = initializeFirebase();
    setFirebase({ firebaseApp, auth });
  }, []);

  if (!firebase) {
    return (
      <div className="flex flex-col min-h-screen">
            <header className="bg-primary text-primary-foreground shadow-md">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <Skeleton className="h-7 w-64" />
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-5 w-16" />
                        <Skeleton className="h-5 w-12" />
                        <Skeleton className="h-5 w-20" />
                        <Skeleton className="h-10 w-10 rounded-full" />
                    </div>
                </div>
            </header>
            <main className="flex-1 container mx-auto p-6">
                <Skeleton className="h-screen w-full" />
            </main>
        </div>
    );
  }

  return <FirebaseProvider value={firebase}>{children}</FirebaseProvider>;
}
