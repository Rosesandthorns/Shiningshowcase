
"use client";
import type { Pokemon } from '@/types/pokemon';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getEvolutionChainByPokedexNumber, getNationalPokedex, shinyLockedPokemon, getAllPokemon } from '@/lib/pokemonApi';
import { useFirestore } from '@/firebase';

interface PokemonContextType {
  pokemonList: Pokemon[];
  isLoading: boolean;
  evolutionLine: Pokemon[] | null;
  selectedPokemonId: string | null;
  showEvolutionLine: (pokemon: Pokemon) => Promise<void>;
  clearEvolutionLine: () => void;
  isEvolutionLoading: boolean;
  userId: string;
}

const PokemonContext = createContext<PokemonContextType | undefined>(undefined);

export const PokemonProvider = ({ children, initialPokemon, userId }: { children: ReactNode, initialPokemon: Pokemon[], userId: string }) => {
  const [pokemonList, setPokemonList] = useState<Pokemon[]>(initialPokemon);
  const [isLoading, setIsLoading] = useState(true);
  const [evolutionLine, setEvolutionLine] = useState<Pokemon[] | null>(null);
  const [selectedPokemonId, setSelectedPokemonId] = useState<string | null>(null);
  const [isEvolutionLoading, setIsEvolutionLoading] = useState(false);
  const firestore = useFirestore();

  useEffect(() => {
     if (!firestore || !userId) return;
    
    setIsLoading(true);
    getAllPokemon(firestore, userId)
        .then(data => {
            setPokemonList(data);
        })
        .catch(console.error)
        .finally(() => setIsLoading(false));
        
  }, [firestore, userId]);

  const showEvolutionLine = async (pokemon: Pokemon) => {
    if (pokemon.pokedexNumber === 0) return;
    setIsEvolutionLoading(true);
    setSelectedPokemonId(pokemon.id);

    try {
        const nationalPokedex = await getNationalPokedex();
        const { speciesDetailsList: unsortedSpeciesDetails } = await getEvolutionChainByPokedexNumber(pokemon.pokedexNumber);
        
        if (unsortedSpeciesDetails.length === 0) {
          setEvolutionLine([pokemon]);
          return;
        }

        const speciesDetailsList = unsortedSpeciesDetails.sort((a, b) => a.order - b.order);

        const evolutionDetailsPromises = speciesDetailsList.map(async (speciesDetail) => {
            const apiVarietyNames = speciesDetail.varieties.map((v: any) => v.pokemon.name);
            const apiSpeciesName = speciesDetail.name;

            const caughtPokemon = pokemonList.filter(p => {
              const normalizedUserSpeciesName = p.speciesName.toLowerCase().replace(/[\s.'é]+/g, '-');
              return apiVarietyNames.includes(normalizedUserSpeciesName) || apiSpeciesName === normalizedUserSpeciesName;
            });
            
            if (caughtPokemon.length > 0) {
                return caughtPokemon.map(p => ({
                    ...p,
                    isShinyLocked: shinyLockedPokemon.includes(p.speciesName.toLowerCase().replace(/[\s.'é]+/g, '-'))
                }));
            } else {
                const pokedexNumber = speciesDetail.id;
                const nationalPokedexEntry = nationalPokedex.find(entry => entry.pokedexNumber === pokedexNumber);

                if (nationalPokedexEntry) {
                     return [{
                        id: `${pokedexNumber}-${nationalPokedexEntry.speciesName}`, // Temporary unique ID
                        userId: '',
                        name: 'Not Yet Caught',
                        pokedexNumber: pokedexNumber,
                        speciesName: nationalPokedexEntry.speciesName,
                        sprites: {
                            default: nationalPokedexEntry.sprite,
                            shiny: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${pokedexNumber}.png`,
                        },
                        tags: [],
                        shinyViewed: false,
                        types: [], 
                        abilities: [],
                        isPlaceholder: true,
                        isShinyLocked: shinyLockedPokemon.includes(nationalPokedexEntry.speciesName.toLowerCase().replace(/[\s.'é]+/g, '-')),
                    } as Pokemon];
                }
                return []; // Return empty if no national dex entry found
            }
        });

        const evolutionDetailsNested = await Promise.all(evolutionDetailsPromises);
        const evolutionDetailsFlat = evolutionDetailsNested.flat();

        evolutionDetailsFlat.sort((a, b) => {
          if (a.pokedexNumber !== b.pokedexNumber) {
            return a.pokedexNumber - b.pokedexNumber;
          }
          return a.speciesName.localeCompare(b.speciesName);
        });
        
        const uniqueEvolutionDetails = Array.from(new Map(evolutionDetailsFlat.map(p => [p.isPlaceholder ? `${p.pokedexNumber}-${p.speciesName}` : p.id, p])).values());

        setEvolutionLine(uniqueEvolutionDetails);
    } catch (error) {
        console.error("Failed to build evolution line:", error);
        setEvolutionLine([pokemon]);
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
    isEvolutionLoading,
    userId
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
