
'use client';

import { useUser, useFirestore } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { updateUserProfile } from '@/lib/user';
import { Skeleton } from '@/components/ui/skeleton';
import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader } from '@/components/ui/card';


export default function MyProfileRedirectPage() {
  const { user, loading: authLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  useEffect(() => {
    if (authLoading) {
      return;
    }
    
    if (!user) {
      router.replace('/login');
      return;
    }

    if (!firestore) {
      return;
    }

    const ensureProfileAndRedirect = async () => {
        try {
            // This function ensures a profile exists and returns the UID
            const userId = await updateUserProfile(firestore, user, {});
            router.replace(`/profile/${userId}`);
        } catch (error) {
            console.error("Failed to ensure user profile, staying on page:", error);
             // If it fails, maybe stay here and show an error? For now, we do nothing.
             // The user will be stuck on a loading screen.
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
