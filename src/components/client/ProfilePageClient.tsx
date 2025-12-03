
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
import { Badge } from '@/components/ui/badge';

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

  const renderStateBadge = () => {
    if (profile.state === 'owner' || profile.state === 'dev') {
      return <Badge className="bg-blue-500 text-white ml-2">Dev</Badge>;
    }
    if (profile.state === 'supporter') {
      return <Badge variant="outline" className="border-yellow-500 text-yellow-500 text-xs ml-2">Support</Badge>;
    }
    return null;
  };

  return (
    <div className={cn("w-full max-w-2xl", getBorderClass(profile.state))}>
      <Card className="w-full shadow-xl overflow-hidden relative bg-transparent">
        <div className="h-48 bg-muted relative">
          {bannerURL && (
            <Image src={bannerURL} alt="Profile banner" layout="fill" objectFit="cover" unoptimized />
          )}
        </div>
        <CardHeader className="text-center -mt-16 relative z-10">
          <Avatar className="w-24 h-24 border-4 border-background mx-auto shadow-lg">
            {photoURL && <AvatarImage src={photoURL} alt={displayName} />}
            <AvatarFallback>{fallbackInitial}</AvatarFallback>
          </Avatar>
          <div className="flex justify-center items-center mt-4">
             <CardTitle className="text-3xl font-bold font-headline">{displayName}</CardTitle>
             {renderStateBadge()}
          </div>
          {currentUser?.email && isOwner && <CardDescription>{currentUser.email}</CardDescription>}
        </CardHeader>
        <CardContent className="text-center p-6 relative z-10">
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
