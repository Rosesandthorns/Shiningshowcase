
'use client';

import { useFirestore, useUser } from '@/firebase';
import { Header } from '@/components/Header';
import { ListTab } from '@/components/tabs/ListTab';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import { getAllPokemon } from '@/lib/pokemonApi';
import type { Pokemon } from '@/types/pokemon';

type ListPageProps = {
    params: {
        userId: string;
    };
};

export default function ListPage({ params }: ListPageProps) {
    const { user: currentUser, loading: authLoading } = useUser();
    const firestore = useFirestore();

    const [pokemon, setPokemon] = useState<Pokemon[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const profileUserId = params.userId;

    useEffect(() => {
        if (!firestore || !profileUserId) return;

        const fetchPokemon = async () => {
            setLoading(true);
            setError(null);
            try {
                const userPokemon = await getAllPokemon(firestore, profileUserId);
                setPokemon(userPokemon);
            } catch (err) {
                console.error("Error fetching list page data:", err);
                setError("Failed to load data.");
            } finally {
                setLoading(false);
            }
        };

        fetchPokemon();

    }, [firestore, profileUserId]);

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

    if (!pokemon) {
         return (
             <div className="flex flex-col min-h-screen bg-background text-foreground">
                <Header />
                <main className="flex-1 container mx-auto p-4 md:p-6 flex justify-center items-center">
                    <Card className="w-full max-w-md text-center shadow-lg">
                        <CardHeader>
                            <CardTitle>Loading Collection</CardTitle>
                            <CardDescription>Just a moment...</CardDescription>
                        </CardHeader>
                    </Card>
                </main>
            </div>
        )
    }

    if (pokemon.length === 0) {
        if (currentUser?.uid === profileUserId) {
            return (
                 <div className="flex flex-col min-h-screen bg-background text-foreground">
                    <Header />
                    <main className="flex-1 container mx-auto p-4 md:p-6 flex justify-center items-center">
                        <Card className="w-full max-w-md text-center shadow-lg">
                            <CardHeader>
                                <CardTitle>Your Collection is Empty</CardTitle>
                                <CardDescription>Start adding Pokémon to see them here!</CardDescription>
                            </CardHeader>
                             <CardContent>
                                <Button>Add Pokémon</Button>
                            </CardContent>
                        </Card>
                    </main>
                </div>
            )
        }
        return (
             <div className="flex flex-col min-h-screen bg-background text-foreground">
                <Header />
                <main className="flex-1 container mx-auto p-4 md:p-6 flex justify-center items-center">
                    <Card className="w-full max-w-md text-center shadow-lg">
                        <CardHeader>
                            <CardTitle>Collection is Empty</CardTitle>
                            <CardDescription>This user hasn't added any Pokémon to their collection yet.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <Button asChild variant="outline">
                                <Link href={`/profile/${profileUserId}`}>Back to Profile</Link>
                            </Button>
                        </CardContent>
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
