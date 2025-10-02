
'use client';

import { useUser, useFirestore } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) {
      return; // Wait for auth state to settle
    }
    if (!user) {
      setLoading(false); // No user, stop loading and show sign-in prompt
      return;
    }

    const fetchProfileAndRedirect = async () => {
      const profileRef = doc(firestore, 'users', user.uid);
      const docSnap = await getDoc(profileRef);
      
      let profile: UserProfile | null = null;
      let userDisplayName: string | null = null;

      if (docSnap.exists()) {
        profile = docSnap.data() as UserProfile;
        userDisplayName = profile.displayName ?? null;
      }

      // If displayName is still not found, it might be a new user.
      // Let's ensure a profile document is created.
      if (!userDisplayName) {
        try {
            // This function will create/update the profile, ensuring a displayName.
            // It will use email part or UID as fallback if necessary.
            await updateUserProfile(firestore, user, {}); 
            const updatedDocSnap = await getDoc(profileRef); // Re-fetch the doc
            if (updatedDocSnap.exists()) {
                const updatedProfile = updatedDocSnap.data() as UserProfile;
                userDisplayName = updatedProfile.displayName!;
            } else {
                 // Extreme fallback, should not happen
                userDisplayName = user.displayName || user.uid;
            }
        } catch (error) {
            console.error("Failed to ensure user profile:", error);
             // Fallback redirect to prevent getting stuck
            userDisplayName = user.displayName || user.uid;
        }
      }
      
      if(userDisplayName) {
        router.replace(`/profile/${encodeURIComponent(userDisplayName)}`);
      } else {
        // If all else fails, prevent a loop.
        setLoading(false); 
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

  // This content is shown while redirecting or if something went wrong
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
