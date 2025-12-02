
'use client';

import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Header } from '@/components/Header';
import { Card, CardHeader, CardContent } from '@/components/ui/card';

export default function MyProfileRedirectPage() {
  const { user, loading: authLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    // Wait until the authentication state is resolved.
    if (authLoading) {
      return; 
    }
    
    // If auth is resolved and there's no user, redirect to login.
    if (!user) {
      router.replace('/login');
      return;
    }

    // If we have a user, redirect to their UID-based profile page.
    // This is the most reliable way to handle the user's own profile.
    router.replace(`/profile/${user.uid}`);

  }, [user, authLoading, router]);

  // Display a full-page loading skeleton while we wait for auth and redirect.
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
