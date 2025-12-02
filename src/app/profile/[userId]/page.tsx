
import { initializeFirebase } from '@/firebase';
import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { getUserProfile } from '@/lib/pokemonApi';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { UserProfile } from '@/types/user';
import { cookies } from 'next/headers';
import { getAuth } from 'firebase-admin/auth';
import { EditProfileClient } from '@/components/client/EditProfileClient';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

// This is a helper function for server-side auth checking.
// It should not be used in client components.
async function getCurrentUser() {
  const session = cookies().get('session')?.value;
  if (!session) return null;

  try {
    // We need to initialize the admin app here to verify the session cookie.
    // This is a standard pattern for server-side auth in Next.js with Firebase.
    const { getAdminApp } = await import('@/firebase/admin');
    getAdminApp(); // Ensures admin app is initialized
    
    const decodedIdToken = await getAuth().verifySessionCookie(session, true);
    // We fetch the full user object from auth to get all details
    const user = await getAuth().getUser(decodedIdToken.uid);
    return user;
  } catch (error) {
    console.warn("[Auth Check Failed on Server]:", error);
    return null;
  }
}


type ProfilePageProps = {
  params: {
    userId: string;
  };
};

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { firestore } = initializeFirebase();
  const profileId = params.userId;

  const [profile, currentUser] = await Promise.all([
    getUserProfile(firestore, profileId),
    getCurrentUser()
  ]);

  if (!profile) {
    notFound();
  }

  const displayName = profile.displayName || 'User';
  const photoURL = profile.photoURL;
  const bannerURL = profile.bannerURL;
  const fallbackInitial = displayName.charAt(0).toUpperCase();

  const isOwner = currentUser && currentUser.uid === profile.uid;

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
            {currentUser?.email && isOwner && <CardDescription>{currentUser.email}</CardDescription>}
          </CardHeader>
          <CardContent className="text-center p-6">
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <Button asChild variant="outline">
                <Link href={`/profile/${profile.uid}/list`}>View List</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={`/profile/${profile.uid}/analytics`}>View Analytics</Link>
              </Button>
               {isOwner && currentUser && (
                <Dialog>
                    <DialogTrigger asChild>
                    <Button>Edit Profile</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Edit profile</DialogTitle>
                    </DialogHeader>
                    {/* The EditProfileClient still needs the user object which we can only get on the client */}
                    <EditProfileClient profile={profile} />
                    </DialogContent>
                </Dialog>
             )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
