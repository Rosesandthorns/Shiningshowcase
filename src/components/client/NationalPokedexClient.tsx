
"use client";

import React, { useState, useMemo } from 'react';
import { usePokemon } from '@/contexts/PokemonContext';
import { EvolutionLineView } from '@/components/EvolutionLineView';
import { PokedexEntryCard } from '@/components/PokedexEntryCard';
import { SearchBar } from '@/components/SearchBar';
import type { PokedexEntry, Pokemon } from '@/types/pokemon';

interface NationalPokedexClientProps {
    initialPokedex: PokedexEntry[];
}

export function NationalPokedexClient({ initialPokedex }: NationalPokedexClientProps) {
    const { evolutionLine, isEvolutionLoading, selectedPokemonId } = usePokemon();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredPokedex = useMemo(() => {
        if (!searchTerm) {
            return initialPokedex;
        }
        const lowerSearchTerm = searchTerm.toLowerCase();
        return initialPokedex.filter(p =>
            p.speciesName.toLowerCase().includes(lowerSearchTerm) ||
            p.pokedexNumber.toString().includes(lowerSearchTerm)
        );
    }, [initialPokedex, searchTerm]);

    if (isEvolutionLoading) {
        return (
            <section aria-busy="true" className="text-center py-10">
                <div className="flex justify-center items-center mb-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
                <p className="text-muted-foreground text-lg">Loading evolution line...</p>
            </section>
        );
    }

    if (evolutionLine) {
        return <EvolutionLineView evolutionLine={evolutionLine} selectedPokemonId={selectedPokemonId} />;
    }

    return (
        <div>
            <div className="mb-8 max-w-lg mx-auto">
                <SearchBar
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    placeholder="Search by name or Pokédex number..."
                />
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-2">
                {filteredPokedex.map(p => (
                    <PokedexEntryCard key={p.pokedexNumber} entry={p} />
                ))}
            </div>
        </div>
    );
}
