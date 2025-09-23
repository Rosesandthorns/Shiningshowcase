
"use client";
import type { Pokemon } from '@/types/pokemon';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getEvolutionChainByPokedexNumber, getPokemonSpeciesDetailsByUrl, getPokemonDetailsByName, shinyLockedPokemon } from '@/lib/pokemonApi';

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
        const { speciesDetailsList: unsortedSpeciesDetails } = await getEvolutionChainByPokedexNumber(pokemon.pokedexNumber);
        
        if (unsortedSpeciesDetails.length === 0) {
          setEvolutionLine([pokemon]);
          return;
        }

        // Sort species by their order in the evolution chain
        const speciesDetailsList = unsortedSpeciesDetails.sort((a, b) => a.order - b.order);

        const evolutionDetailsPromises = speciesDetailsList.map(async (speciesDetail) => {
            const apiVarietyNames = speciesDetail.varieties.map((v: any) => v.pokemon.name);
            const apiSpeciesName = speciesDetail.name;

            // Find all caught pokemon matching the species name (and its varieties)
            const caughtPokemon = pokemonList.filter(p => {
              const normalizedUserSpeciesName = p.speciesName.toLowerCase().replace(/[\s\.]+/g, '-');
              // Check if the user's pokemon species name matches the main species name OR any of the API variety names
              return normalizedUserSpeciesName === apiSpeciesName || apiVarietyNames.includes(normalizedUserSpeciesName);
            });
            
            if (caughtPokemon.length > 0) {
                return caughtPokemon.map(p => ({
                    ...p,
                    isShinyLocked: shinyLockedPokemon.includes(p.speciesName.toLowerCase().replace(/[\s\.]+/g, '-'))
                }));
            } else {
                // Create a placeholder
                try {
                    const primaryVariety = speciesDetail.varieties.find((v:any) => v.is_default) || speciesDetail.varieties[0];
                    const pokemonDetails = await getPokemonDetailsByName(primaryVariety.pokemon.name);
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
                        isShinyLocked: shinyLockedPokemon.includes(primaryVariety.pokemon.name),
                    } as Pokemon];
                } catch (e) {
                    console.error("Failed to fetch species details for placeholder:", speciesDetail.name, e);
                    return []; // Return empty array on failure to create placeholder
                }
            }
        });

        const evolutionDetailsNested = await Promise.all(evolutionDetailsPromises);
        const evolutionDetailsFlat = evolutionDetailsNested.flat();

        // Sort the final flat list by pokedex number (which now reflects evolution order), then by form
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
