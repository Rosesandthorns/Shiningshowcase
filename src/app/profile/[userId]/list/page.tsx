
'use client';

import { useFirestore } from '@/firebase';
import { Header } from '@/components/Header';
import { ListTab } from '@/components/tabs/ListTab';
import { Card, CardHeader, CardDescription } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import { getAllPokemon } from '@/lib/pokemonApi';
import type { Pokemon } from '@/types/pokemon';
import { doc, getDoc } from 'firebase/firestore';

type ListPageProps = {
    params: {
        userId: string;
    };
};

export default function ListPage({ params }: ListPageProps) {
    const firestore = useFirestore();
    const [pokemon, setPokemon] = useState<Pokemon[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [userExists, setUserExists] = useState<boolean | undefined>(undefined);

    const profileUserId = params.userId;

    useEffect(() => {
        console.log(`[ListPage] useEffect triggered. userId: ${profileUserId}`);

        if (!firestore || !profileUserId) {
            console.log('[ListPage] Firestore or userId is missing. Bailing out.');
            setLoading(false);
            return;
        }

        const fetchUserData = async () => {
            console.log('[ListPage] Starting fetchUserData...');
            setLoading(true);
            setError(null);
            try {
                // 1. Check if user exists
                console.log(`[ListPage] Checking for user document at 'users/${profileUserId}'`);
                const userDocRef = doc(firestore, 'users', profileUserId);
                const userDocSnap = await getDoc(userDocRef);

                if (!userDocSnap.exists()) {
                    console.warn(`[ListPage] User document NOT found for userId: ${profileUserId}`);
                    setUserExists(false);
                    setLoading(false);
                    return;
                }
                console.log(`[ListPage] User document FOUND for userId: ${profileUserId}`);
                setUserExists(true);

                // 2. Fetch Pokémon
                console.log(`[ListPage] Fetching all pokemon for userId: ${profileUserId}`);
                const userPokemon = await getAllPokemon(firestore, profileUserId);
                console.log(`[ListPage] Found ${userPokemon.length} pokemon.`);
                setPokemon(userPokemon);

            } catch (err: any) {
                console.error("[ListPage] CRITICAL ERROR fetching list page data:", err);
                setError(`Failed to load data: ${err.message}`);
            } finally {
                console.log('[ListPage] fetchUserData finished.');
                setLoading(false);
            }
        };

        fetchUserData();

    }, [firestore, profileUserId]);

    if (loading || userExists === undefined) {
        console.log(`[ListPage] Render: Loading state. loading: ${loading}, userExists: ${userExists}`);
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
        console.error(`[ListPage] Render: Triggering 404. userExists: ${userExists}, error: ${error}`);
        notFound();
    }

    if (!pokemon) {
         console.log('[ListPage] Render: Pokemon is null, showing loading-like state.');
         return (
             <div className="flex flex-col min-h-screen bg-background text-foreground">
                <Header />
                <main className="flex-1 container mx-auto p-4 md:p-6 flex justify-center items-center">
                    <Card className="w-full max-w-md text-center shadow-lg">
                        <CardHeader>
                            <CardDescription>Just a moment...</CardDescription>
                        </CardHeader>
                    </Card>
                </main>
            </div>
        )
    }
    
    console.log('[ListPage] Render: Rendering ListTab.');
    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground">
            <Header />
            <ListTab pokemon={pokemon} userId={profileUserId} />
            <footer className="py-6 text-center text-muted-foreground text-sm">
                © 2025 Rosie. All rights reserved.
            </footer>
        </div>
    );
}
