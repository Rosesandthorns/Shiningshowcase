"use client";

import React, { useState, useMemo } from 'react';
import { usePokemon } from '@/contexts/PokemonContext';
import { PokemonCard } from '@/components/PokemonCard';
import { SearchBar } from '@/components/SearchBar';
import { FilterControls } from '@/components/FilterControls';
import { Skeleton } from '@/components/ui/skeleton';

interface PokemonListClientProps {
  uniqueTags: string[];
}

export function PokemonListClient({ uniqueTags }: PokemonListClientProps) {
  const { pokemonList, isLoading } = usePokemon();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const handleTagChange = (tag: string, checked: boolean) => {
    setSelectedTags(prev =>
      checked ? [...prev, tag] : prev.filter(t => t !== tag)
    );
  };

  const filteredPokemon = useMemo(() => {
    return pokemonList
      .filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.species.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter(p =>
        selectedTags.length === 0 || selectedTags.some(tag => p.tags.includes(tag))
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-lg" />
          ))}
        </div>
      </section>
    );
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredPokemon.map(pokemon => (
            <PokemonCard key={pokemon.id} pokemon={pokemon} />
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
