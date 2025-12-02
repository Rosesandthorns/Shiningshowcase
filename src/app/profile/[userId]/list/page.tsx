
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
        if (!firestore || !profileUserId) {
            setLoading(false);
            return;
        }

        const fetchUserData = async () => {
            setLoading(true);
            setError(null);
            try {
                // 1. Check if user exists
                const userDocRef = doc(firestore, 'users', profileUserId);
                const userDocSnap = await getDoc(userDocRef);

                if (!userDocSnap.exists()) {
                    setUserExists(false);
                    setLoading(false);
                    return;
                }
                setUserExists(true);

                // 2. Fetch Pokémon
                const userPokemon = await getAllPokemon(firestore, profileUserId);
                setPokemon(userPokemon);

            } catch (err: any) {
                console.error("CRITICAL ERROR fetching list page data:", err);
                setError(`Failed to load data: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();

    }, [firestore, profileUserId]);

    if (loading || userExists === undefined) {
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
        notFound();
    }

    if (!pokemon) {
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
