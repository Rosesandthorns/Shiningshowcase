
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
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    if (!firestore) {
      setLoading(true); // Wait for firestore to be available
      return;
    }

    const profileRef = doc(firestore, 'users', user.uid);
    const unsubscribe = onSnapshot(profileRef, async (docSnap) => {
      setLoading(true);
      if (docSnap.exists()) {
        const profileData = { ...docSnap.data(), uid: docSnap.id } as UserProfile;
        
        // If the displayName in auth is different from Firestore, trust auth and update Firestore.
        // Or if the firestore doc is missing a name, create one.
        if ((user.displayName && user.displayName !== profileData.displayName) || !profileData.displayName) {
            try {
                // This call will either set the initial name or update it.
                const updatedName = await updateUserProfile(firestore, user, { displayName: user.displayName || undefined });
                 // If the name changed, we should redirect to the new canonical URL.
                if (updatedName !== profileData.displayName && router) {
                    router.replace(`/profile/${encodeURIComponent(updatedName)}`);
                }
            } catch (error) {
                console.error("Failed to auto-update displayName:", error);
            }
        } else {
             setProfile(profileData);
        }
      } else {
        // Profile doesn't exist, so create it. The listener will pick up the new document.
        try {
          await updateUserProfile(firestore, user, {});
        } catch (error) {
          console.error("Failed to create user profile:", error);
        }
      }
       setLoading(false);
    }, (error) => {
        console.error("Error fetching profile:", error);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [user, authLoading, firestore, router]);


  if (loading || authLoading || !profile) {
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
