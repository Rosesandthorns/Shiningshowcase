
'use client';

import { useUser } from '@/firebase';
import type { UserProfile } from '@/types/user';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { EditProfileClient } from '@/components/client/EditProfileClient';
import { cn } from '@/lib/utils';

interface ProfilePageClientProps {
  profile: UserProfile;
}

export function ProfilePageClient({ profile }: ProfilePageClientProps) {
  const { user: currentUser, loading } = useUser();

  const getBorderClass = (state?: string) => {
    switch (state) {
      case 'owner':
      case 'dev':
        return 'feature-card-border';
      case 'supporter':
        return 'supporter-card-border';
      default:
        return '';
    }
  };

  if (loading) {
      return (
          <Card className="w-full max-w-2xl shadow-xl animate-pulse">
              <div className="h-48 bg-muted"></div>
              <CardHeader className="text-center -mt-16">
                  <Avatar className="w-24 h-24 border-4 border-background mx-auto shadow-lg bg-muted"></Avatar>
                  <div className="h-8 bg-muted rounded w-1/2 mx-auto mt-4"></div>
                  <div className="h-5 bg-muted rounded w-2/3 mx-auto mt-2"></div>
              </CardHeader>
              <CardContent className="text-center p-6">
                  <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                      <div className="h-10 bg-muted rounded w-24"></div>
                      <div className="h-10 bg-muted rounded w-24"></div>
                  </div>
              </CardContent>
          </Card>
      );
  }

  const displayName = profile.displayName || 'User';
  const photoURL = profile.photoURL;
  const bannerURL = profile.bannerURL;
  const fallbackInitial = displayName.charAt(0).toUpperCase();

  const isOwner = currentUser && currentUser.uid === profile.uid;

  return (
    <div className={cn("w-full max-w-2xl rounded-lg", getBorderClass(profile.state))}>
      <Card className="w-full shadow-xl overflow-hidden bg-card/80 backdrop-blur-sm">
        <div className="h-48 bg-muted relative">
          {bannerURL && (
            <Image src={bannerURL} alt="Profile banner" layout="fill" objectFit="cover" unoptimized />
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
            {isOwner && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button>Edit Profile</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Edit profile</DialogTitle>
                  </DialogHeader>
                  <EditProfileClient profile={profile} />
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
