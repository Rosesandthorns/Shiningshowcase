
import { initializeFirebase } from '@/firebase';
import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { getUserProfile } from '@/lib/pokemonApi';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ProfilePageClient } from '@/components/client/ProfilePageClient';
import type { UserProfile } from '@/types/user';

type ProfilePageProps = {
  params: {
    userId: string;
  };
};

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { firestore } = initializeFirebase();
  const profileId = params.userId;

  const profile: UserProfile | null = await getUserProfile(firestore, profileId);
  
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
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <ProfilePageClient profile={profile} />

            <div className="flex justify-center gap-2">
              <Button asChild variant="outline">
                <Link href={`/profile/${profile.uid}/list`}>View List</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={`/profile/${profile.uid}/analytics`}>View Analytics</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
