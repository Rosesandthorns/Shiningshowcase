
import { initializeFirebase } from '@/firebase';
import { Header } from '@/components/Header';
import { ListTab } from '@/components/tabs/ListTab';
import { getAllPokemon, getUserProfile, getNationalPokedex, shinyLockedPokemon } from '@/lib/pokemonApi';
import { notFound } from 'next/navigation';
import type { Pokemon, PokedexEntry } from '@/types/pokemon';

type ListPageProps = {
    params: {
        userId: string;
    };
};

// This is a React Server Component. It fetches all necessary data on the server.
export default async function ListPage({ params }: ListPageProps) {
    const { firestore } = initializeFirebase();
    const profileUserId = params.userId;

    // 1. Validate user exists on the server.
    try {
        const userProfile = await getUserProfile(firestore, profileUserId);
        if (!userProfile) {
            notFound();
        }
    } catch (error) {
        console.error(`[Server Page Error] Failed to fetch profile for list page: ${profileUserId}`, error);
        notFound();
    }

    // 2. Fetch user's pokemon and the national pokedex in parallel.
    const [userPokemon, nationalPokedex] = await Promise.all([
        getAllPokemon(firestore, profileUserId),
        getNationalPokedex()
    ]);

    // 3. Process the pokedex to determine status on the server.
    const caughtPokedexNumbers = new Set(userPokemon.map(p => p.pokedexNumber));
    const processedPokedex = nationalPokedex.map(entry => {
        const isCaught = caughtPokedexNumbers.has(entry.pokedexNumber);
        const isShinyLocked = shinyLockedPokemon.includes(entry.speciesName.toLowerCase().replace(/[\s.'é]+/g, '-'));
        
        let status: 'caught' | 'uncaught' | 'shiny-locked' = 'uncaught';
        if (isShinyLocked) {
            status = 'shiny-locked';
        } else if (isCaught) {
            status = 'caught';
        }

        return { ...entry, status };
    });
    
    // 4. Render the page, passing the server-fetched data to the client component.
    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground">
            <Header />
            {/* ListTab is a client component that receives the initial data as props */}
            <ListTab initialPokemon={userPokemon} userId={profileUserId} processedPokedex={processedPokedex} />
            <footer className="py-6 text-center text-muted-foreground text-sm">
                © 2025 Rosie. All rights reserved.
            </footer>
        </div>
    );
}
