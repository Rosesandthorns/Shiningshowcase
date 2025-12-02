
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

type ProfilePageProps = {
  params: {
    userId: string;
  };
};

// This is a React Server Component.
// It fetches the profile data on the server before rendering.
export default async function ProfilePage({ params }: ProfilePageProps) {
  const { firestore } = initializeFirebase();
  const profileUserId = params.userId;

  let profile;
  try {
    // Fetch the user's profile from Firestore on the server.
    profile = await getUserProfile(firestore, profileUserId);
  } catch (error) {
    console.error(`[Server Page Error] Failed to fetch profile for userId ${profileUserId}:`, error);
    // In a real app, you might render a generic error page here.
    // For now, we'll proceed to notFound().
    profile = null;
  }
  

  // If no profile is found for the given userId, render a 404 page.
  // This is the correct way to handle "not found" cases in a server component.
  if (!profile) {
    console.log(`[Server Page] No profile found for ${profileUserId}, rendering 404.`);
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
            {/* The client component handles interactive elements like the edit button */}
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
