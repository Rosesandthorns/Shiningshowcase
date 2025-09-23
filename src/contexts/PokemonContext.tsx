
"use client";
import type { Pokemon } from '@/types/pokemon';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getEvolutionChainByPokedexNumber, getPokemonSpeciesDetails } from '@/lib/pokemonApi';

interface PokemonContextType {
  pokemonList: Pokemon[];
  isLoading: boolean;
  evolutionLine: Pokemon[] | null;
  selectedPokemonId: number | null;
  showEvolutionLine: (pokemon: Pokemon) => Promise<void>;
  clearEvolutionLine: () => void;
  isEvolutionLoading: boolean;
}

const PokemonContext = createContext<PokemonContextType | undefined>(undefined);

export const PokemonProvider = ({ children, initialPokemon }: { children: ReactNode, initialPokemon: Pokemon[] }) => {
  const [pokemonList, setPokemonList] = useState<Pokemon[]>(initialPokemon);
  const [isLoading, setIsLoading] = useState(true);
  const [evolutionLine, setEvolutionLine] = useState<Pokemon[] | null>(null);
  const [selectedPokemonId, setSelectedPokemonId] = useState<number | null>(null);
  const [isEvolutionLoading, setIsEvolutionLoading] = useState(false);

  useEffect(() => {
    setPokemonList(initialPokemon);
    setIsLoading(false);
  }, [initialPokemon]);

  const showEvolutionLine = async (pokemon: Pokemon) => {
    if (pokemon.pokedexNumber === 0) return;
    setIsEvolutionLoading(true);
    setSelectedPokemonId(pokemon.id);

    try {
        const speciesNames = await getEvolutionChainByPokedexNumber(pokemon.pokedexNumber);
        
        if (speciesNames.length === 0) {
          // If the API fails or there's no chain, just show the single clicked pokemon
          setEvolutionLine([pokemon]);
          return;
        }

        const evolutionDetailsPromises = speciesNames.map(async (speciesName) => {
            // Find all caught pokemon matching the species name
            const caughtPokemon = pokemonList.filter(p => p.speciesName.toLowerCase() === speciesName.toLowerCase());
            
            if (caughtPokemon.length > 0) {
                return caughtPokemon;
            } else {
                // Create a placeholder
                try {
                    const speciesDetails = await getPokemonSpeciesDetails(speciesName);
                    return [{
                        id: speciesDetails.id, // Use pokedex number as a stable ID for placeholders
                        name: 'Not Yet Caught',
                        pokedexNumber: speciesDetails.id,
                        speciesName: speciesName.charAt(0).toUpperCase() + speciesName.slice(1),
                        sprites: {
                            default: speciesDetails.sprites.front_default || `https://placehold.co/96x96.png`,
                            shiny: speciesDetails.sprites.front_shiny || `https://placehold.co/96x96.png`,
                        },
                        tags: [],
                        shinyViewed: false,
                        types: speciesDetails.types.map((t: any) => t.type.name),
                        abilities: [],
                        isPlaceholder: true,
                    } as Pokemon];
                } catch (e) {
                    console.error("Failed to fetch species details for placeholder:", speciesName, e);
                    return []; // Return empty array on failure to create placeholder
                }
            }
        });

        const evolutionDetailsNested = await Promise.all(evolutionDetailsPromises);
        const evolutionDetailsFlat = evolutionDetailsNested.flat();

        // Sort the final flat list by pokedex number
        evolutionDetailsFlat.sort((a, b) => a.pokedexNumber - b.pokedexNumber);

        // Remove duplicates just in case (e.g. multiple of the same placeholder)
        const uniqueEvolutionDetails = Array.from(new Map(evolutionDetailsFlat.map(p => [p.isPlaceholder ? p.pokedexNumber : p.id, p])).values());

        setEvolutionLine(uniqueEvolutionDetails);
    } catch (error) {
        console.error("Failed to build evolution line:", error);
        setEvolutionLine([pokemon]); // Fallback to just showing the clicked pokemon
    } finally {
        setIsEvolutionLoading(false);
    }
  };

  const clearEvolutionLine = () => {
    setEvolutionLine(null);
    setSelectedPokemonId(null);
  };

  const value = {
    pokemonList,
    isLoading,
    evolutionLine,
    selectedPokemonId,
    showEvolutionLine,
    clearEvolutionLine,
    isEvolutionLoading
  };

  return (
    <PokemonContext.Provider value={value}>
      {children}
    </PokemonContext.Provider>
  );
};

export const usePokemon = () => {
  const context = useContext(PokemonContext);
  if (context === undefined) {
    throw new Error('usePokemon must be used within a PokemonProvider');
  }
  return context;
};
