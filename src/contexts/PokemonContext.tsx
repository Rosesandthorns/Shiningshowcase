
"use client";
import type { Pokemon } from '@/types/pokemon';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getEvolutionChainByPokedexNumber, getPokemonSpeciesDetailsByUrl, getPokemonDetailsByName } from '@/lib/pokemonApi';

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
        const { speciesNames, speciesDetailsList } = await getEvolutionChainByPokedexNumber(pokemon.pokedexNumber);
        
        if (speciesNames.length === 0) {
          setEvolutionLine([pokemon]);
          return;
        }

        const evolutionDetailsPromises = speciesDetailsList.map(async (speciesDetail) => {
            const speciesName = speciesDetail.name;
            // Find all caught pokemon matching the species name (and its varieties)
            const caughtPokemon = pokemonList.filter(p => {
              const pSpeciesNameLower = p.speciesName.toLowerCase().replace(' ', '-');
              // This handles cases like "Zorua" vs "Hisuian Zorua"
              return speciesDetail.varieties.some((v: any) => v.pokemon.name === pSpeciesNameLower);
            });
            
            if (caughtPokemon.length > 0) {
                return caughtPokemon;
            } else {
                // Create a placeholder
                try {
                    // We already have species details, let's get the specific pokemon details for sprite
                    const pokemonDetails = await getPokemonDetailsByName(speciesDetail.varieties[0].pokemon.name);
                    const displayName = speciesDetail.name.split('-').map(n => n.charAt(0).toUpperCase() + n.slice(1)).join(' ');

                    return [{
                        id: speciesDetail.id, // Use pokedex number as a stable ID for placeholders
                        name: 'Not Yet Caught',
                        pokedexNumber: speciesDetail.id,
                        speciesName: displayName,
                        sprites: {
                            default: pokemonDetails.sprites.front_default || `https://placehold.co/96x96.png`,
                            shiny: pokemonDetails.sprites.front_shiny || `https://placehold.co/96x96.png`,
                        },
                        tags: [],
                        shinyViewed: false,
                        types: pokemonDetails.types.map((t: any) => t.type.name),
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

        // Sort the final flat list by pokedex number, then by form if applicable
        evolutionDetailsFlat.sort((a, b) => {
          if (a.pokedexNumber !== b.pokedexNumber) {
            return a.pokedexNumber - b.pokedexNumber;
          }
          // Simple sort for forms, could be made more robust if needed
          return a.speciesName.localeCompare(b.speciesName);
        });
        
        // Remove duplicates
        const uniqueEvolutionDetails = Array.from(new Map(evolutionDetailsFlat.map(p => [p.isPlaceholder ? `${p.pokedexNumber}-${p.speciesName}` : p.id, p])).values());

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
