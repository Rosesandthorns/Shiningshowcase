
"use client";
import type { Pokemon } from '@/types/pokemon';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getEvolutionChainByPokedexNumber, getPokemonSpeciesDetails } from '@/lib/pokemonApi';

interface PokemonContextType {
  pokemonList: Pokemon[];
  isLoading: boolean;
  evolutionLine: Pokemon[] | null;
  showEvolutionLine: (pokemon: Pokemon) => Promise<void>;
  clearEvolutionLine: () => void;
  isEvolutionLoading: boolean;
}

const PokemonContext = createContext<PokemonContextType | undefined>(undefined);

export const PokemonProvider = ({ children, initialPokemon }: { children: ReactNode, initialPokemon: Pokemon[] }) => {
  const [pokemonList, setPokemonList] = useState<Pokemon[]>(initialPokemon);
  const [isLoading, setIsLoading] = useState(true);
  const [evolutionLine, setEvolutionLine] = useState<Pokemon[] | null>(null);
  const [isEvolutionLoading, setIsEvolutionLoading] = useState(false);

  useEffect(() => {
    setPokemonList(initialPokemon);
    setIsLoading(false);
  }, [initialPokemon]);

  const showEvolutionLine = async (pokemon: Pokemon) => {
    if (pokemon.pokedexNumber === 0) return;
    setIsEvolutionLoading(true);

    try {
        const speciesNames = await getEvolutionChainByPokedexNumber(pokemon.pokedexNumber);
        if (speciesNames.length === 0) {
          // If the API fails or there's no chain, just show the single clicked pokemon
          setEvolutionLine([pokemon]);
          return;
        }

        const evolutionDetails = await Promise.all(
            speciesNames.map(async (speciesName) => {
                const caughtPokemon = pokemonList.find(p => p.speciesName.toLowerCase() === speciesName.toLowerCase());
                if (caughtPokemon) {
                    return caughtPokemon;
                } else {
                    // Create a placeholder
                    const speciesDetails = await getPokemonSpeciesDetails(speciesName);
                    return {
                        id: speciesDetails.id,
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
                    } as Pokemon;
                }
            })
        );
        setEvolutionLine(evolutionDetails);
    } catch (error) {
        console.error("Failed to build evolution line:", error);
        setEvolutionLine([pokemon]); // Fallback to just showing the clicked pokemon
    } finally {
        setIsEvolutionLoading(false);
    }
  };

  const clearEvolutionLine = () => {
    setEvolutionLine(null);
  };

  const value = {
    pokemonList,
    isLoading,
    evolutionLine,
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
