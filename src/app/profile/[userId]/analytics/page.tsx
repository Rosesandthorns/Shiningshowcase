
'use client';

import { useFirestore } from '@/firebase';
import { Header } from '@/components/Header';
import { AnalyticsTab } from '@/components/tabs/AnalyticsTab';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import { getAllPokemon } from '@/lib/pokemonApi';
import type { Pokemon } from '@/types/pokemon';
import { doc, getDoc } from 'firebase/firestore';

type AnalyticsPageProps = {
    params: {
        userId: string;
    };
};

export default function AnalyticsPage({ params }: AnalyticsPageProps) {
    const firestore = useFirestore();
    const [pokemon, setPokemon] = useState<Pokemon[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [userExists, setUserExists] = useState<boolean | undefined>(undefined);
    
    const profileUserId = params.userId;

    useEffect(() => {
        console.log(`[AnalyticsPage] useEffect triggered. userId: ${profileUserId}`);

        if (!firestore || !profileUserId) {
            console.log('[AnalyticsPage] Firestore or userId is missing. Bailing out.');
            setLoading(false);
            return;
        }

        const fetchUserData = async () => {
            console.log('[AnalyticsPage] Starting fetchUserData...');
            setLoading(true);
            setError(null);
            try {
                // 1. Check if user exists
                console.log(`[AnalyticsPage] Checking for user document at 'users/${profileUserId}'`);
                const userDocRef = doc(firestore, 'users', profileUserId);
                const userDocSnap = await getDoc(userDocRef);

                if (!userDocSnap.exists()) {
                    console.warn(`[AnalyticsPage] User document NOT found for userId: ${profileUserId}`);
                    setUserExists(false);
                    setLoading(false);
                    return;
                }
                
                console.log(`[AnalyticsPage] User document FOUND for userId: ${profileUserId}`);
                setUserExists(true);

                // 2. Fetch Pokémon
                console.log(`[AnalyticsPage] Fetching all pokemon for userId: ${profileUserId}`);
                const userPokemon = await getAllPokemon(firestore, profileUserId);
                console.log(`[AnalyticsPage] Found ${userPokemon.length} pokemon.`);
                setPokemon(userPokemon);

            } catch (err: any) {
                console.error("[AnalyticsPage] CRITICAL ERROR fetching analytics data:", err);
                setError(`Failed to load data: ${err.message}`);
            } finally {
                console.log('[AnalyticsPage] fetchUserData finished.');
                setLoading(false);
            }
        };

        fetchUserData();

    }, [firestore, profileUserId]);


    if (loading || userExists === undefined) {
        console.log(`[AnalyticsPage] Render: Loading state. loading: ${loading}, userExists: ${userExists}`);
        return (
             <div className="flex flex-col min-h-screen bg-background text-foreground">
                <Header />
                <main className="flex-1 container mx-auto p-4 md:p-6 flex justify-center items-center">
                     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </main>
            </div>
        )
    }

    if (!userExists || error) {
        console.error(`[AnalyticsPage] Render: Triggering 404. userExists: ${userExists}, error: ${error}`);
        notFound();
    }

    if (!pokemon || pokemon.length === 0) {
        const message = "This user hasn't added any Pokémon to their collection yet.";
        console.log('[AnalyticsPage] Render: No pokemon data found for analytics.');
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
                                <Link href={`/profile/${profileUserId}/list`}>Back to List</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </main>
            </div>
        );
    }
    
    console.log('[AnalyticsPage] Render: Rendering AnalyticsTab.');
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
