// src/contexts/PokemonContext.tsx
"use client";
import type { Pokemon } from '@/types/pokemon';
import React, { createContext, useContext, useState, useEffect, ReactNode, Dispatch, SetStateAction } from 'react';

interface PokemonContextType {
  pokemonList: Pokemon[];
  setPokemonList: Dispatch<SetStateAction<Pokemon[]>>;
  updateShinyViewed: (pokemonId: number, viewed: boolean) => void;
  isLoading: boolean;
}

const PokemonContext = createContext<PokemonContextType | undefined>(undefined);

export const PokemonProvider = ({ children, initialPokemon }: { children: ReactNode, initialPokemon: Pokemon[] }) => {
  const [pokemonList, setPokemonList] = useState<Pokemon[]>(initialPokemon);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial data loading if needed or to handle updates
    setPokemonList(initialPokemon);
    setIsLoading(false);
  }, [initialPokemon]);

  const updateShinyViewed = (pokemonId: number, viewed: boolean) => {
    setPokemonList(prevList =>
      prevList.map(p =>
        p.id === pokemonId ? { ...p, shinyViewed: viewed } : p
      )
    );
  };

  return (
    <PokemonContext.Provider value={{ pokemonList, setPokemonList, updateShinyViewed, isLoading }}>
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
