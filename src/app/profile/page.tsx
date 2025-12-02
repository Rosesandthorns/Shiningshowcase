
'use client';

import { useUser, useFirestore } from '@/firebase';
import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { doc, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { EditProfileClient } from '@/components/client/EditProfileClient';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { updateUserProfile } from '@/lib/user';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface UserProfile {
  uid: string;
  displayName?: string;
  photoURL?: string;
  bannerURL?: string;
}

export default function MyProfilePage() {
  const { user, loading: authLoading } = useUser();
  const firestore = useFirestore();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (authLoading || !firestore) return;

    if (!user) {
      setLoading(false);
      return;
    }

    const profileRef = doc(firestore, 'users', user.uid);
    const unsubscribe = onSnapshot(profileRef, async (docSnap) => {
      if (docSnap.exists()) {
        const profileData = { ...docSnap.data(), uid: docSnap.id } as UserProfile;
        // If the displayName is missing from the document for some reason, fix it.
        if (!profileData.displayName) {
            try {
                const updatedName = await updateUserProfile(firestore, user, {});
                profileData.displayName = updatedName;
            } catch (error) {
                console.error("Failed to auto-update displayName:", error);
            }
        }
        setProfile(profileData);
        setLoading(false);
      } else {
        // Profile doesn't exist, so create it with a unique display name.
        try {
          await updateUserProfile(firestore, user, {});
          // The listener will pick up the new document, no need to set state here.
        } catch (error) {
          console.error("Failed to create user profile:", error);
          setLoading(false);
        }
      }
    }, (error) => {
        console.error("Error fetching profile:", error);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [user, authLoading, firestore]);

   useEffect(() => {
    // If the user logs out, redirect them away from the profile page.
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  if (loading || authLoading) {
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

  if (!user) {
    return (
      <div className="flex flex-col min-h-screen bg-background text-foreground">
        <Header />
        <main className="flex-1 container mx-auto p-4 md:p-6 flex justify-center items-center">
          <Card className="w-full max-w-md text-center shadow-lg">
            <CardHeader>
              <CardTitle>Access Your Profile</CardTitle>
              <CardDescription>You need to be signed in to view your profile page.</CardDescription>
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

  if (!profile) {
    // This state can happen if profile creation fails or is in progress.
    return (
       <div className="flex flex-col min-h-screen bg-background text-foreground">
        <Header />
        <main className="flex-1 container mx-auto p-4 md:p-6 flex justify-center items-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Setting up your profile...</p>
            </div>
        </main>
      </div>
    )
  }

  const displayName = profile.displayName || 'User';
  const photoURL = profile.photoURL;
  const bannerURL = profile.bannerURL;
  const fallbackInitial = displayName.charAt(0).toUpperCase();

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-6 flex justify-center items-start pt-12">
        <Card className="w-full max-w-2xl shadow-xl overflow-hidden">
          <div className="h-48 bg-muted relative">
            {bannerURL && (
              <Image src={bannerURL} alt="Profile banner" layout="fill" objectFit="cover" unoptimized/>
            )}
          </div>
          <CardHeader className="text-center -mt-16">
            <Avatar className="w-24 h-24 border-4 border-background mx-auto shadow-lg">
              {photoURL && <AvatarImage src={photoURL} alt={displayName} />}
              <AvatarFallback>{fallbackInitial}</AvatarFallback>
            </Avatar>
            <CardTitle className="text-3xl font-bold font-headline mt-4">{displayName}</CardTitle>
            {user.email && <CardDescription>{user.email}</CardDescription>}
          </CardHeader>
          <CardContent className="text-center p-6 space-x-2">
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogTrigger asChild>
                <Button>Edit Profile</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Edit profile</DialogTitle>
                </DialogHeader>
                <EditProfileClient user={user} profile={profile} onSave={() => setIsEditDialogOpen(false)} />
              </DialogContent>
            </Dialog>
            <Button asChild variant="outline">
              <Link href={`/profile/${encodeURIComponent(displayName)}/list`}>My List</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/profile/${encodeURIComponent(displayName)}/analytics`}>My Analytics</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
