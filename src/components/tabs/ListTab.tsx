
'use client';

import { NationalPokedexClient } from '@/components/client/NationalPokedexClient';
import { PokemonProvider } from '@/contexts/PokemonContext';
import type { PokedexEntry, Pokemon } from '@/types/pokemon';

interface ListTabProps {
    initialPokemon: Pokemon[];
    userId: string;
    processedPokedex: PokedexEntry[];
}

export function ListTab({ initialPokemon, userId, processedPokedex }: ListTabProps) {

    if (!processedPokedex || processedPokedex.length === 0) {
        return (
            <main className="flex-1 container mx-auto p-4 md:p-6 flex justify-center items-center">
                 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </main>
        );
    }

    return (
        <PokemonProvider initialPokemon={initialPokemon} userId={userId}>
            <main className="flex-1 container mx-auto p-4 md:p-6">
                <h1 className="text-3xl md:text-4xl font-bold mb-6 text-center font-headline">National Pokédex</h1>
                <NationalPokedexClient initialPokedex={processedPokedex} />
            </main>
        </PokemonProvider>
    );
}
