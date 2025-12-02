
'use client';

import { useUser, useFirestore } from '@/firebase';
import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { doc, onSnapshot } from 'firebase/firestore';
import { useEffect, useState, useMemo } from 'react';
import { EditProfileClient } from '@/components/client/EditProfileClient';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface UserProfile {
  uid: string;
  displayName?: string;
  photoURL?: string;
  bannerURL?: string;
}

type ProfilePageProps = {
  params: {
    userId: string;
  };
};

export default function ProfilePage({ params }: ProfilePageProps) {
  const { user: currentUser, loading: authLoading } = useUser();
  const firestore = useFirestore();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // The userId is now directly from the URL param
  const userIdFromParam = params.userId;

  useEffect(() => {
    if (!firestore || !userIdFromParam) {
        if (!loading) {
          setProfile(null);
        }
        return;
    };

    setLoading(true);
    // Directly use the userId from the URL to get the document.
    const userRef = doc(firestore, 'users', userIdFromParam);

    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const profileData = docSnap.data() as Omit<UserProfile, 'uid'>;
        setProfile({ ...profileData, uid: docSnap.id });
      } else {
        // This user ID does not exist in Firestore.
        setProfile(null);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching profile:", error);
      setLoading(false);
      setProfile(null);
    });

    return () => unsubscribe();
  }, [firestore, userIdFromParam]);

  const isOwner = useMemo(() => {
    return !authLoading && currentUser && profile && currentUser.uid === profile.uid;
  }, [currentUser, profile, authLoading]);

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
            </CardHeader>
            <CardContent className="text-center p-6">
               <Skeleton className="h-6 w-32 mx-auto" />
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // If after loading, the profile is still null, it means the user ID doesn't exist.
  if (!profile) {
    notFound();
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
            {isOwner && currentUser?.email && <CardDescription>{currentUser.email}</CardDescription>}
          </CardHeader>
          <CardContent className="text-center p-6 space-x-2">
            {isOwner && (
              <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogTrigger asChild>
                  <Button>Edit Profile</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Edit profile</DialogTitle>
                  </DialogHeader>
                  {currentUser && <EditProfileClient user={currentUser} profile={profile} onSave={() => setIsEditDialogOpen(false)} />}
                </DialogContent>
              </Dialog>
            )}
            <Button asChild variant="outline">
              <Link href={`/profile/${profile.uid}/list`}>View List</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/profile/${profile.uid}/analytics`}>View Analytics</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
