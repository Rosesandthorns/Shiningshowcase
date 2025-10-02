
'use client';

import { useUser, useFirestore } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { updateUserProfile } from '@/lib/user';

interface UserProfile {
  displayName?: string;
}

export default function ProfileRedirectPage() {
  const { user, loading: authLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const [status, setStatus] = useState('loading'); // 'loading', 'redirecting', 'error', 'prompt'

  const ensureProfileAndRedirect = useCallback(async () => {
    if (!user) {
      setStatus('prompt');
      return;
    }

    setStatus('redirecting');
    try {
      const profileRef = doc(firestore, 'users', user.uid);
      const docSnap = await getDoc(profileRef);

      let userDisplayName: string | null = null;
      if (docSnap.exists() && docSnap.data()?.displayName) {
        userDisplayName = docSnap.data().displayName;
      } else {
        // This function will now create the profile and return the name
        userDisplayName = await updateUserProfile(firestore, user, {});
      }
      
      if (userDisplayName) {
        router.replace(`/profile/${encodeURIComponent(userDisplayName)}`);
      } else {
        setStatus('error');
      }
    } catch (error) {
      console.error("Failed to ensure profile and redirect:", error);
      setStatus('error');
    }
  }, [user, firestore, router]);


  useEffect(() => {
    if (!authLoading) {
      ensureProfileAndRedirect();
    }
  }, [authLoading, ensureProfileAndRedirect]);

  if (status === 'loading') {
    return (
      <div className="flex flex-col min-h-screen bg-background text-foreground">
        <Header />
        <main className="flex-1 container mx-auto p-4 md:p-6 flex justify-center items-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Authenticating...</p>
            </div>
        </main>
      </div>
    );
  }

  if (status === 'redirecting') {
    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground">
            <Header />
            <main className="flex-1 container mx-auto p-4 md:p-6 flex justify-center items-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading your profile...</p>
                </div>
            </main>
        </div>
    );
  }

  if (status === 'prompt') {
     return (
      <div className="flex flex-col min-h-screen bg-background text-foreground">
        <Header />
        <main className="flex-1 container mx-auto p-4 md:p-6 flex justify-center items-center">
          <Card className="w-full max-w-md text-center shadow-lg">
            <CardHeader>
              <CardTitle>Access Denied</CardTitle>
              <CardDescription>You must be signed in to view your profile.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/login">Sign In</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // status === 'error'
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
        <Header />
        <main className="flex-1 container mx-auto p-4 md:p-6 flex justify-center items-center">
            <Card className="w-full max-w-md text-center shadow-lg">
            <CardHeader>
              <CardTitle>Error</CardTitle>
              <CardDescription>Could not load your profile. Please try again later.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => router.push('/')}>Go Home</Button>
            </CardContent>
          </Card>
        </main>
    </div>
  );
}
