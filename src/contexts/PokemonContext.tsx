
'use client';
import type { Pokemon } from '@/types/pokemon';
import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { getEvolutionChainByPokedexNumber, getNationalPokedex, shinyLockedPokemon } from '@/lib/pokemonApi';
import { useFirestore, useUser } from '@/firebase';
import { useCollection } from 'react-firebase-hooks/firestore';
import { collection, query, orderBy, type Firestore } from 'firebase/firestore';
import { useMemoFirebase } from '@/hooks/use-memo-firebase';

interface PokemonContextType {
  pokemonList: Pokemon[];
  isLoading: boolean;
  evolutionLine: Pokemon[] | null;
  selectedPokemonId: string | null;
  showEvolutionLine: (pokemon: Pokemon) => Promise<void>;
  clearEvolutionLine: () => void;
  isEvolutionLoading: boolean;
  userId: string | null;
}

const PokemonContext = createContext<PokemonContextType | undefined>(undefined);

interface PokemonProviderProps {
  children: ReactNode;
  userId: string | null;
  initialPokemon?: Pokemon[];
}

// Provider that can be used in the root layout
export const PokemonProvider = ({ children, userId: providedUserId, initialPokemon = [] }: PokemonProviderProps) => {
  const firestore = useFirestore();
  const { user: authUser, loading: userLoading } = useUser();
  const userId = providedUserId ?? authUser?.uid ?? null;
  
  const [evolutionLine, setEvolutionLine] = useState<Pokemon[] | null>(null);
  const [selectedPokemonId, setSelectedPokemonId] = useState<string | null>(null);
  const [isEvolutionLoading, setIsEvolutionLoading] = useState(false);
  
  // Memoize the query to prevent re-creating it on every render
  const pokemonQuery = useMemoFirebase(
    () => (firestore && userId ? query(collection(firestore, `users/${userId}/pokemon`), orderBy('pokedexNumber')) : null),
    [firestore, userId]
  );
  
  // Use the useCollection hook for real-time updates.
  // The hook's initial fetch is now less critical if we have initialPokemon.
  const [snapshot, collectionLoading, error] = useCollection(pokemonQuery);

  const pokemonList = useMemo(() => {
    // If we have a snapshot from the real-time listener, it's the most up-to-date data.
    if (snapshot) {
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Pokemon));
    }
    // Otherwise, fall back to the server-provided initial data.
    return initialPokemon;
  }, [snapshot, initialPokemon]);
  
  useEffect(() => {
    if (error) {
      console.error("Error fetching pokemon collection:", error);
    }
  }, [error]);


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
    // Loading is true if we don't have initial server data AND the collection is still loading.
    isLoading: initialPokemon.length === 0 && (userLoading || collectionLoading),
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
