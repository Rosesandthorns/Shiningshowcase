
'use client';

import { useFirestore } from '@/firebase';
import { Header } from '@/components/Header';
import { AnalyticsTab } from '@/components/tabs/AnalyticsTab';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import { getAllPokemon, getUserIdFromDisplayName } from '@/lib/pokemonApi';
import type { Pokemon } from '@/types/pokemon';
import { useUser } from '@/firebase/auth/use-user';

type AnalyticsPageProps = {
    params: {
        displayName: string;
    };
};

export default function AnalyticsPage({ params }: AnalyticsPageProps) {
    const { user: currentUser, loading: authLoading } = useUser();
    const firestore = useFirestore();

    const [pokemon, setPokemon] = useState<Pokemon[] | null>(null);
    const [profileUserId, setProfileUserId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const displayName = decodeURIComponent(params.displayName);

    useEffect(() => {
        if (!firestore) return;

        const fetchProfileAndPokemon = async () => {
            setLoading(true);
            setError(null);
            try {
                const userId = await getUserIdFromDisplayName(firestore, displayName);
                if (!userId) {
                    setError("Profile not found.");
                    setPokemon([]);
                    setProfileUserId(null);
                    setLoading(false);
                    return;
                }
                setProfileUserId(userId);
                const userPokemon = await getAllPokemon(firestore, userId);
                setPokemon(userPokemon);
            } catch (err) {
                console.error("Error fetching analytics data:", err);
                setError("Failed to load data.");
            } finally {
                setLoading(false);
            }
        };

        fetchProfileAndPokemon();

    }, [firestore, displayName]);


    if (loading || authLoading) {
        return (
             <div className="flex flex-col min-h-screen bg-background text-foreground">
                <Header />
                <main className="flex-1 container mx-auto p-4 md:p-6 flex justify-center items-center">
                     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </main>
            </div>
        )
    }

    if (error) {
        notFound();
    }

    if (!pokemon || pokemon.length === 0) {
        const message = currentUser?.uid === profileUserId 
            ? "You need to add some Pokémon to your collection to see analytics."
            : "This user hasn't added any Pokémon to their collection yet.";
        return (
            <div className="flex flex-col min-h-screen bg-background text-foreground">
                <Header />
                <main className="flex-1 container mx-auto p-4 md:p-6 flex justify-center items-center">
                    <Card className="w-full max-w-md text-center shadow-lg">
                        <CardHeader>
                            <CardTitle>No Data for Analytics</CardTitle>
                            <CardDescription>{message}</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <Button asChild variant="outline">
                                <Link href={`/profile/${params.displayName}/list`}>Back to List</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </main>
            </div>
        );
    }
    
    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground">
            <Header />
            <AnalyticsTab pokemon={pokemon} />
             <footer className="py-6 text-center text-muted-foreground text-sm">
                © 2025 Rosie. All rights reserved.
            </footer>
        </div>
    );
}
