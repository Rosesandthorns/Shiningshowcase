
'use client';

import { useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import { useState, useMemo } from 'react';
import { EditProfileClient } from '@/components/client/EditProfileClient';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import type { UserProfile } from '@/types/user';

interface ProfilePageClientProps {
  profile: UserProfile;
}

// This client component handles interactive parts of the profile page,
// like the "Edit Profile" dialog. The user's own auth state is checked here.
export function ProfilePageClient({ profile }: ProfilePageClientProps) {
  const { user: currentUser, loading: authLoading } = useUser();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Determine if the currently logged-in user is the owner of this profile.
  const isOwner = useMemo(() => {
    return !authLoading && currentUser && profile && currentUser.uid === profile.uid;
  }, [currentUser, profile, authLoading]);

  // Don't render anything until we know the auth state.
  if (authLoading) {
    return null;
  }
  
  if (!isOwner) {
    return null;
  }

  // Only render the "Edit Profile" button if the current user is the owner.
  return (
    <>
      {currentUser?.email && <CardDescription>{currentUser.email}</CardDescription>}
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
    </>
  );
}
