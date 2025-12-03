
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
    const profileUserId = decodeURIComponent(params.userId);

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

    // Define the priority order for regional forms
    const formPriority = ['alola', 'galar', 'hisui', 'paldea'];

    // 3. Process the pokedex to determine status on the server.
    const processedPokedex = nationalPokedex.map(entry => {
        const isShinyLocked = shinyLockedPokemon.includes(entry.speciesName.toLowerCase().replace(/[\s.'é]+/g, '-'));
        
        const caughtForms = userPokemon.filter(p => p.pokedexNumber === entry.pokedexNumber);

        let status: 'caught' | 'uncaught' | 'shiny-locked' = 'uncaught';
        let sprite = entry.sprite; // Default sprite

        if (isShinyLocked) {
            status = 'shiny-locked';
        } else if (caughtForms.length > 0) {
            status = 'caught';

            // Logic to select the sprite for the caught form
            if (caughtForms.length === 1) {
                sprite = caughtForms[0].sprites.shiny;
            } else {
                // Sort caught forms by the defined priority
                const sortedForms = caughtForms.sort((a, b) => {
                    const aForm = a.form?.toLowerCase() || '';
                    const bForm = b.form?.toLowerCase() || '';
                    
                    const aIndex = formPriority.findIndex(p => aForm.includes(p));
                    const bIndex = formPriority.findIndex(p => bForm.includes(p));

                    // If form is not in priority list, it gets lower priority
                    const aPriority = aIndex === -1 ? formPriority.length : aIndex;
                    const bPriority = bIndex === -1 ? formPriority.length : bIndex;

                    if (aPriority !== bPriority) {
                        return aPriority - bPriority;
                    }

                    // If same priority (or both not in list), sort by speciesName to be stable
                    return a.speciesName.localeCompare(b.speciesName);
                });
                
                sprite = sortedForms[0].sprites.shiny;
            }
        }

        return { ...entry, status, sprite };
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
