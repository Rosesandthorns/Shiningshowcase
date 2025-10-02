
"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { auth, onAuthStateChanged, User } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      if (user) {
        // This check prevents the toast from showing on every page load
        // A more robust way would be to check getRedirectResult, but this is simpler
        if (sessionStorage.getItem('justLoggedIn')) {
          toast({
            title: "Signed In",
            description: `Welcome back, ${user.displayName}!`,
          });
          sessionStorage.removeItem('justLoggedIn');
        }
      }
    });

    return () => unsubscribe();
  }, [toast]);

  if (loading) {
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
     )
  }

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
