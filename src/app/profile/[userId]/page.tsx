
import { initializeFirebase } from '@/firebase';
import { Header } from '@/components/Header';
import { getUserProfile } from '@/lib/pokemonApi';
import { notFound } from 'next/navigation';
import { ProfilePageClient } from '@/components/client/ProfilePageClient';

type ProfilePageProps = {
  params: {
    userId: string;
  };
};

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { firestore } = initializeFirebase();
  const profileId = params.userId;

  const profile = await getUserProfile(firestore, profileId);

  if (!profile) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-6 flex justify-center items-start pt-12">
        <ProfilePageClient profile={profile} />
      </main>
    </div>
  );
}
