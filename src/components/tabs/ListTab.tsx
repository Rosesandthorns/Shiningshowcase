
import { NationalPokedexClient } from '@/components/client/NationalPokedexClient';
import { getAllPokemon, getNationalPokedex, shinyLockedPokemon } from '@/lib/pokemonApi';
import { PokemonProvider } from '@/contexts/PokemonContext';
import type { PokedexEntry } from '@/types/pokemon';

export async function ListTab() {
    const allPokemonData = await getAllPokemon();
    const nationalPokedexData = await getNationalPokedex();

    const caughtPokedexNumbers = new Set(allPokemonData.map(p => p.pokedexNumber));

    const processedPokedex: PokedexEntry[] = nationalPokedexData.map(entry => {
        const isCaught = caughtPokedexNumbers.has(entry.pokedexNumber);
        // Standardize the species name to match the format in the shinyLockedPokemon list (e.g., "Walking Wake" -> "walking-wake")
        const isShinyLocked = shinyLockedPokemon.includes(entry.speciesName.toLowerCase().replace(' ', '-'));
        
        let status: 'caught' | 'uncaught' | 'shiny-locked' = 'uncaught';
        if (isShinyLocked) {
            status = 'shiny-locked';
        } else if (isCaught) {
            status = 'caught';
        }

        return {
            ...entry,
            status: status,
        };
    });

    return (
        <PokemonProvider initialPokemon={allPokemonData}>
            <main className="flex-1 container mx-auto p-4 md:p-6">
                <h1 className="text-3xl md:text-4xl font-bold mb-6 text-center font-headline">National Pokédex</h1>
                <NationalPokedexClient initialPokedex={processedPokedex} />
            </main>
        </PokemonProvider>
    );
}
