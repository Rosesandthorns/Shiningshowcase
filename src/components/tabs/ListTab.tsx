
'use client';

import { NationalPokedexClient } from '@/components/client/NationalPokedexClient';
import { getAllPokemon, getNationalPokedex, shinyLockedPokemon } from '@/lib/pokemonApi';
import { PokemonProvider } from '@/contexts/PokemonContext';
import type { PokedexEntry, Pokemon } from '@/types/pokemon';
import { useEffect, useState } from 'react';

export function ListTab() {
    const [allPokemonData, setAllPokemonData] = useState<Pokemon[]>([]);
    const [processedPokedex, setProcessedPokedex] = useState<PokedexEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const [pokemon, pokedex] = await Promise.all([
                    getAllPokemon(),
                    getNationalPokedex()
                ]);

                const caughtPokedexNumbers = new Set(pokemon.map(p => p.pokedexNumber));

                const processed = pokedex.map(entry => {
                    const isCaught = caughtPokedexNumbers.has(entry.pokedexNumber);
                    const isShinyLocked = shinyLockedPokemon.includes(entry.speciesName.toLowerCase().replace(' ', '-'));
                    
                    let status: 'caught' | 'uncaught' | 'shiny-locked' = 'uncaught';
                    if (isShinyLocked) {
                        status = 'shiny-locked';
                    } else if (isCaught) {
                        status = 'caught';
                    }

                    return { ...entry, status };
                });

                setAllPokemonData(pokemon);
                setProcessedPokedex(processed);
            } catch (error) {
                console.error("Failed to load list data:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    if (loading) {
        return (
            <main className="flex-1 container mx-auto p-4 md:p-6 flex justify-center items-center">
                 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </main>
        );
    }

    return (
        <PokemonProvider initialPokemon={allPokemonData}>
            <main className="flex-1 container mx-auto p-4 md:p-6">
                <h1 className="text-3xl md:text-4xl font-bold mb-6 text-center font-headline">National Pokédex</h1>
                <NationalPokedexClient initialPokedex={processedPokedex} />
            </main>
        </PokemonProvider>
    );
}
