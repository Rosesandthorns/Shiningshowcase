
import { initializeFirebase } from '@/firebase';
import { Header } from '@/components/Header';
import { AnalyticsTab } from '@/components/tabs/AnalyticsTab';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { getAllPokemon } from '@/lib/pokemonApi';
import { notFound } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';

type AnalyticsPageProps = {
    params: {
        userId: string;
    };
};

// This is now a React Server Component
export default async function AnalyticsPage({ params }: AnalyticsPageProps) {
    const { firestore } = initializeFirebase();
    const profileUserId = params.userId;

    // 1. Validate user exists on the server
    const userDocRef = doc(firestore, 'users', profileUserId);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
        console.error(`[AnalyticsPage RSC] User not found for userId: ${profileUserId}`);
        notFound();
    }
    
    // 2. Fetch Pokémon data on the server
    const pokemon = await getAllPokemon(firestore, profileUserId);

    // 3. Render page, handle case with no pokemon
    if (!pokemon || pokemon.length === 0) {
        return (
            <div className="flex flex-col min-h-screen bg-background text-foreground">
                <Header />
                <main className="flex-1 container mx-auto p-4 md:p-6 flex justify-center items-center">
                    <Card className="w-full max-w-md text-center shadow-lg">
                        <CardHeader>
                            <CardTitle>No Data for Analytics</CardTitle>
                            <CardDescription>This user hasn't added any Pokémon to their collection yet.</CardDescription>
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
    
    // 4. Render the analytics tab with the fetched data
    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground">
            <Header />
            {/* AnalyticsTab receives the server-fetched data as a prop */}
            <AnalyticsTab pokemon={pokemon} />
             <footer className="py-6 text-center text-muted-foreground text-sm">
                © 2025 Rosie. All rights reserved.
            </footer>
        </div>
    );
}
