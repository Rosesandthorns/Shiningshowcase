import type { Pokemon, StatsSet } from '@/types/pokemon';

// This file is no longer used for primary data, 
// as all Pokémon data is now stored and fetched from Firestore.
// It is kept for type reference if needed.

// Original user data structure
export interface UserPokemon {
  idUnique?: number;
  nickname: string;
  species: string;
  description: string;
  imageUrl: string;
  tags: string[];
  level?: string | number;
  nature?: string;
  moveset?: string[];
  ability?: string;
  ball?: string;
  ivs?: Partial<StatsSet>;
  evs?: Partial<StatsSet>;
}

export const fullPokemonData: Pokemon[] = [];
