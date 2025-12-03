'use client';

import { useUser, useFirestore } from '@/firebase';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { collection, query, orderBy, limit, onSnapshot, getDocs } from 'firebase/firestore';
import { useEffect, useState, useMemo } from 'react';
import { useMemoFirebase } from '@/hooks/use-memo-firebase';
import type { Hunt } from '@/types/hunts';
import type { Pokemon } from '@/types/pokemon';
import type { UserProfile } from '@/types/user';
import { Target, BarChart3, Clock, Hash, Sparkles, Users } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from './ui/button';
import { PokemonCard } from './PokemonCard';

function formatTime(totalSeconds: number) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return [hours, minutes, seconds]
        .map(v => v.toString().padStart(2, '0'))
        .join(':');
}


function DashboardSkeleton() {
    return (
        <main className="flex-1 container mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
            <div className="space-y-6">
                <Skeleton className="h-80 w-full" />
                <Skeleton className="h-40 w-full" />
            </div>
        </main>
    );
}

export function Dashboard() {
    const { user } = useUser();
    const firestore = useFirestore();

    const [latestHunt, setLatestHunt] = useState<Hunt | null>(null);
    const [recentPokemon, setRecentPokemon] = useState<Pokemon | null>(null);
    const [allPokemon, setAllPokemon] = useState<Pokemon[]>([]);
    const [following, setFollowing] = useState<UserProfile[]>([]);
    const [followingFeed, setFollowingFeed] = useState<Pokemon | null>(null);
    const [loading, setLoading] = useState(true);

    const userId = user?.uid;

    // Memoize queries
    const huntsQuery = useMemoFirebase(() => userId ? query(collection(firestore, `users/${userId}/hunts`), orderBy('createdAt', 'desc'), limit(1)) : null, [firestore, userId]);
    const pokemonQuery = useMemoFirebase(() => userId ? query(collection(firestore, `users/${userId}/pokemon`), orderBy('caughtAt', 'desc')) : null, [firestore, userId]);
    const followingQuery = useMemoFirebase(() => userId ? query(collection(firestore, `users/${userId}/following`)) : null, [firestore, userId]);


    // Fetch user's data
    useEffect(() => {
        if (!userId || !firestore) return;
        setLoading(true);

        const unsubscribes = [
            onSnapshot(huntsQuery!, snapshot => {
                const hunt = snapshot.docs[0]?.data() as Hunt;
                setLatestHunt(hunt || null);
            }),
            onSnapshot(pokemonQuery!, snapshot => {
                const pokemon = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Pokemon));
                setAllPokemon(pokemon);
                setRecentPokemon(pokemon[0] || null);
            }),
            onSnapshot(followingQuery!, async (snapshot) => {
                const followedUsers = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile));
                setFollowing(followedUsers);

                // Fetch latest pokemon from followed users
                if (followedUsers.length > 0) {
                    let latestPokemon: Pokemon | null = null;
                    for (const followedUser of followedUsers) {
                        const followedPokemonQuery = query(collection(firestore, `users/${followedUser.uid}/pokemon`), orderBy('caughtAt', 'desc'), limit(1));
                        const followedSnapshot = await getDocs(followedPokemonQuery);
                        const newestPokemon = followedSnapshot.docs[0]?.data() as Pokemon;

                        if (newestPokemon && (!latestPokemon || newestPokemon.caughtAt! > latestPokemon.caughtAt!)) {
                            latestPokemon = { id: followedSnapshot.docs[0].id, ...newestPokemon };
                        }
                    }
                    setFollowingFeed(latestPokemon);
                } else {
                    setFollowingFeed(null);
                }
            })
        ];

        Promise.all([
          getDocs(huntsQuery!),
          getDocs(pokemonQuery!),
          getDocs(followingQuery!)
        ]).then(() => setLoading(false))
        .catch(() => setLoading(false));


        return () => unsubscribes.forEach(unsub => unsub());
    }, [userId, firestore, huntsQuery, pokemonQuery, followingQuery]);


    const uniqueShiniesCount = useMemo(() => {
        return new Set(allPokemon.map(p => p.pokedexNumber)).size;
    }, [allPokemon]);

    if (loading) {
        return <DashboardSkeleton />;
    }

    return (
        <main className="flex-1 container mx-auto p-4 md:p-6">
            <section className="text-left mb-12">
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent-foreground mb-2">
                    Welcome back, {user?.displayName || 'Trainer'}!
                </h1>
                <p className="text-lg text-muted-foreground">Here's what's new with your collection.</p>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Latest Hunt */}
                    {latestHunt ? (
                        <Card className="shadow-lg hover:shadow-primary/20 transition-shadow">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Target /> Latest Hunt</CardTitle>
                                <CardDescription>Your most recently started shiny hunt.</CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col sm:flex-row items-center gap-6">
                                <Image src={latestHunt.pokemonSprite} alt={latestHunt.pokemonName} width={96} height={96} />
                                <div className="flex-1">
                                    <h3 className="text-2xl font-bold">{latestHunt.pokemonName}</h3>
                                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-muted-foreground mt-2">
                                        <span className="flex items-center gap-1"><Hash /> {latestHunt.encounters} encounters</span>
                                        <span className="flex items-center gap-1"><Clock /> {formatTime(latestHunt.timeElapsed)}</span>
                                    </div>
                                </div>
                                <Button asChild>
                                    <Link href="/hunts">View Hunts</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                         <Card className="shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Target /> No Active Hunts</CardTitle>
                            </CardHeader>
                             <CardContent>
                                <p className="text-muted-foreground mb-4">You aren't hunting anything right now.</p>
                                <Button asChild><Link href="/hunts">Start a Hunt</Link></Button>
                            </CardContent>
                        </Card>
                    )}

                     {/* Following Feed */}
                    <Card className="shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Users/>Following Feed</CardTitle>
                            <CardDescription>The latest shiny caught by someone you follow.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {followingFeed ? (
                               <div className="w-full max-w-sm mx-auto">
                                 <PokemonCard pokemon={followingFeed} />
                               </div>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-muted-foreground">You aren't following anyone yet, or they haven't caught a shiny.</p>
                                     <Button variant="outline" asChild className="mt-4"><Link href="/search">Find users to follow</Link></Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                     {/* Recently Caught */}
                    {recentPokemon ? (
                         <Card className="shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Sparkles/>Recently Caught</CardTitle>
                            </CardHeader>
                            <CardContent>
                               <div className="w-full max-w-sm mx-auto">
                                 <PokemonCard pokemon={recentPokemon} />
                               </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Sparkles/>No Pokémon Caught</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground mb-4">Your collection is empty.</p>
                                <Button asChild><Link href="/add-pokemon">Add your first shiny</Link></Button>
                            </CardContent>
                        </Card>
                    )}

                    {/* Quick Stats */}
                    <Card className="shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><BarChart3 />Quick Stats</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Total Shinies</span>
                                <span className="font-bold text-lg">{allPokemon.length}</span>
                            </div>
                             <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Unique Species</span>
                                <span className="font-bold text-lg">{uniqueShiniesCount}</span>
                            </div>
                            <Button variant="outline" className="w-full" asChild>
                                <Link href={`/profile/${userId}/analytics`}>View Full Analytics</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </main>
    );
}
