

"use client";

import React, { useState, useMemo } from 'react';
import { usePokemon } from '@/contexts/PokemonContext';
import { PokemonCard } from '@/components/PokemonCard';
import { SearchBar } from '@/components/SearchBar';
import { FilterControls } from '@/components/FilterControls';
import { Skeleton } from '@/components/ui/skeleton';
import { EvolutionLineView } from '@/components/EvolutionLineView';

interface PokemonListClientProps {
  uniqueTags: string[];
}

export function PokemonListClient({ uniqueTags }: PokemonListClientProps) {
  const { pokemonList, isLoading, evolutionLine, isEvolutionLoading } = usePokemon();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const handleTagChange = (tag: string, checked: boolean) => {
    setSelectedTags(prev =>
      checked ? [...prev, tag] : prev.filter(t => t !== tag)
    );
  };

  const filteredPokemon = useMemo(() => {
    const lowerSearchTerm = searchTerm.toLowerCase();
    const lowerSelectedTags = selectedTags.map(st => st.toLowerCase());

    return pokemonList
      .filter(p =>
        p.name.toLowerCase().includes(lowerSearchTerm) ||
        p.speciesName.toLowerCase().includes(lowerSearchTerm) // Changed from p.species
      )
      .filter(p =>
        lowerSelectedTags.length === 0 || 
        p.tags.some(pokemonTag => lowerSelectedTags.includes(pokemonTag.toLowerCase()))
      );
  }, [pokemonList, searchTerm, selectedTags]);

  if (isLoading) {
    return (
      <section aria-busy="true" aria-labelledby="pokemon-list-title">
        <div className="my-6">
          <Skeleton className="h-10 w-1/2 mb-4" />
          <Skeleton className="h-20 w-full mb-6" />
        </div>
        <h2 id="pokemon-list-title" className="text-2xl font-bold mb-6 text-center font-headline">All Pokémon</h2>
        <div className="flex gap-6 overflow-hidden">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-60 flex-shrink-0 rounded-lg" />
          ))}
        </div>
      </section>
    );
  }

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
    return <EvolutionLineView evolutionLine={evolutionLine} />;
  }
  
  return (
    <section aria-labelledby="pokemon-list-title">
      <div className="my-6 space-y-6">
        <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
        <FilterControls tags={uniqueTags} selectedTags={selectedTags} onTagChange={handleTagChange} />
      </div>

      <h2 id="pokemon-list-title" className="text-2xl font-bold mb-6 text-center font-headline">
        All Pokémon ({filteredPokemon.length})
      </h2>
      {filteredPokemon.length > 0 ? (
        <div className="flex overflow-x-auto gap-6 pb-4">
          {filteredPokemon.map(pokemon => (
            <div key={pokemon.id} className="w-64 flex-shrink-0">
              <PokemonCard pokemon={pokemon} />
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground text-lg py-10">
          No Pokémon match your criteria. Try adjusting your search or filters!
        </p>
      )}
    </section>
  );
}
