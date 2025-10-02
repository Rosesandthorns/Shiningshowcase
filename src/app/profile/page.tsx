
'use client';

import { useUser, useFirestore } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface UserProfile {
  displayName?: string;
}

export default function ProfileRedirectPage() {
  const { user, loading: authLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) {
      return;
    }
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchProfileAndRedirect = async () => {
      const profileRef = doc(firestore, 'users', user.uid);
      const docSnap = await getDoc(profileRef);
      if (docSnap.exists()) {
        const profile = docSnap.data() as UserProfile;
        if (profile.displayName) {
          router.replace(`/profile/${profile.displayName}`);
        } else {
          // Fallback if firestore doc exists but has no displayName
          router.replace(`/profile/${user.uid}`);
        }
      } else {
        // Fallback for new users or if doc doesn't exist, redirect to a generic page
        // Or handle creation of profile doc first
        const displayName = user.displayName || user.uid;
        router.replace(`/profile/${displayName}`);
      }
    };

    fetchProfileAndRedirect();
  }, [user, authLoading, firestore, router]);


  if (loading || authLoading) {
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

  if (!user) {
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

  // This content is shown while redirecting
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
        <Header />
        <main className="flex-1 container mx-auto p-4 md:p-6 flex justify-center items-center">
             <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Redirecting to your profile...</p>
            </div>
        </main>
    </div>
  );
}
