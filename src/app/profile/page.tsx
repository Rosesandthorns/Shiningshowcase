
'use client';

import { useUser, useFirestore } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { updateUserProfile } from '@/lib/user';
import { Skeleton } from '@/components/ui/skeleton';
import { Header } from '@/components/Header';
import { Card, CardHeader, CardContent } from '@/components/ui/card';


export default function MyProfileRedirectPage() {
  const { user, loading: authLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  useEffect(() => {
    if (authLoading) {
      return; // Wait until auth state is confirmed
    }
    
    if (!user) {
      // If not logged in after auth check, redirect to login
      router.replace('/login');
      return;
    }

    if (!firestore) {
      return; // Wait for firestore to be available
    }

    // This is the core logic: ensure a profile exists and redirect to it using the stable UID.
    const ensureProfileAndRedirect = async () => {
        try {
            // This function ensures a profile exists with a display name and returns the user's UID.
            const userId = await updateUserProfile(firestore, user, {});
            // Redirect to the stable, UID-based URL.
            router.replace(`/profile/${userId}`);
        } catch (error) {
            console.error("Failed to ensure user profile:", error);
            // If profile creation fails, the user will be stuck here with a loading screen.
            // A more robust solution might show an error message.
        }
    };

    ensureProfileAndRedirect();

  }, [user, authLoading, firestore, router]);

  // Display a full-page loading skeleton while the redirect is in progress.
  return (
      <div className="flex flex-col min-h-screen bg-background text-foreground">
        <Header />
        <main className="flex-1 container mx-auto p-4 md:p-6 flex justify-center items-start pt-12">
          <Card className="w-full max-w-2xl shadow-xl">
            <Skeleton className="h-48 w-full" />
            <CardHeader className="text-center -mt-16">
              <Skeleton className="h-24 w-24 rounded-full mx-auto border-4 border-background" />
              <Skeleton className="h-8 w-48 mx-auto mt-4" />
              <Skeleton className="h-5 w-64 mx-auto mt-2" />
            </CardHeader>
            <CardContent className="text-center p-6">
              <Skeleton className="h-10 w-24 mx-auto" />
            </CardContent>
          </Card>
        </main>
      </div>
  );
}
