
'use client';

import { useUser, useFirestore } from '@/firebase';
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
import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, doc } from 'firebase/firestore';
import { followUser, unfollowUser } from '@/lib/social';
import type { Pokemon } from '@/types/pokemon';
import { PokemonCard } from '../PokemonCard';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, UserCheck } from 'lucide-react';


interface ProfilePageClientProps {
  profile: UserProfile;
}

export function ProfilePageClient({ profile }: ProfilePageClientProps) {
  const { user: currentUser, loading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(true);
  const [favoritePokemon, setFavoritePokemon] = useState<Pokemon[]>([]);
  const [isFavoritesLoading, setIsFavoritesLoading] = useState(true);

  const isOwner = currentUser && currentUser.uid === profile.uid;
  const canFollow = currentUser && !isOwner;

  useEffect(() => {
    if (!canFollow || !firestore || !currentUser) {
      setIsFollowLoading(false);
      return;
    }
    const followDocRef = doc(firestore, 'users', currentUser.uid, 'following', profile.uid);
    const unsubscribe = onSnapshot(followDocRef, (doc) => {
      setIsFollowing(doc.exists());
      setIsFollowLoading(false);
    });

    return () => unsubscribe();
  }, [firestore, currentUser, profile.uid, canFollow]);

  useEffect(() => {
    if (!firestore || !profile.uid) {
        setIsFavoritesLoading(false);
        return;
    }
    const pokemonQuery = query(collection(firestore, `users/${profile.uid}/pokemon`), where('tags', 'array-contains', 'Favorite'));
    const unsubscribe = onSnapshot(pokemonQuery, (snapshot) => {
        const favorites = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Pokemon));
        setFavoritePokemon(favorites);
        setIsFavoritesLoading(false);
    });

    return () => unsubscribe();
  }, [firestore, profile.uid]);


  const handleFollowToggle = async () => {
    if (!canFollow || !firestore || !currentUser) return;
    
    setIsFollowLoading(true);
    try {
      if (isFollowing) {
        await unfollowUser(firestore, currentUser.uid, profile.uid);
        toast({ title: 'Unfollowed', description: `You are no longer following ${profile.displayName}.` });
      } else {
        await followUser(firestore, currentUser.uid, profile.uid);
        toast({ title: 'Followed!', description: `You are now following ${profile.displayName}.` });
      }
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      // The onSnapshot listener will update the final state, so we don't strictly need to setLoading(false) here,
      // but it can prevent a brief flicker if the snapshot is slow.
       setIsFollowLoading(false);
    }
  };


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
          <div className={cn("w-full max-w-2xl animate-pulse", getBorderClass(profile.state))}>
            <Card className="w-full shadow-xl overflow-hidden relative bg-transparent">
              <div className="h-48 bg-muted"></div>
              <CardHeader className="text-center -mt-16 relative z-10">
                  <Avatar className="w-24 h-24 border-4 border-background mx-auto shadow-lg bg-muted"></Avatar>
                  <div className="h-8 bg-muted rounded w-1/2 mx-auto mt-4"></div>
                  <div className="h-5 bg-muted rounded w-2/3 mx-auto mt-2"></div>
              </CardHeader>
              <CardContent className="text-center p-6 relative z-10">
                  <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                      <div className="h-10 bg-muted rounded w-24"></div>
                      <div className="h-10 bg-muted rounded w-24"></div>
                  </div>
              </CardContent>
            </Card>
          </div>
      );
  }

  const displayName = profile.displayName || 'User';
  const photoURL = profile.photoURL;
  const bannerURL = profile.bannerURL;
  const fallbackInitial = displayName.charAt(0).toUpperCase();

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
             {canFollow && (
              <Button onClick={handleFollowToggle} disabled={isFollowLoading} variant={isFollowing ? "secondary" : "default"}>
                {isFollowing ? <UserCheck className="mr-2 h-4 w-4" /> : <UserPlus className="mr-2 h-4 w-4" />}
                {isFollowing ? 'Following' : 'Follow'}
              </Button>
            )}
          </div>
          {isFavoritesLoading && (
            <div className="mt-6">
              <div className="h-8 bg-muted rounded w-1/3 mx-auto mt-4"></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                <div className="h-48 bg-muted rounded"></div>
                <div className="h-48 bg-muted rounded"></div>
                <div className="h-48 bg-muted rounded"></div>
              </div>
            </div>
          )}
          {!isFavoritesLoading && favoritePokemon.length > 0 && (
            <div className="mt-6">
              <h3 className="text-xl font-bold text-center">Favorite Hunts</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                {favoritePokemon.map(pokemon => (
                  <PokemonCard key={pokemon.id} pokemon={pokemon} />
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
