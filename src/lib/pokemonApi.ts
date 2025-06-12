
import { fullPokemonData } from '@/data/pokemon'; // Changed to fullPokemonData
import type { Pokemon } from '@/types/pokemon';

// Simulate API delay
// const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function getAllPokemon(): Promise<Pokemon[]> {
  // await delay(100); // Simulate network latency
  return fullPokemonData; // Use the fully processed list
}

export async function getPokemonById(id: number): Promise<Pokemon | undefined> {
  // await delay(50);
  return fullPokemonData.find(p => p.id === id); // Use the fully processed list
}

export async function getUniqueTags(): Promise<string[]> {
  // await delay(50);
  const allTags = fullPokemonData.flatMap(p => p.tags); // Use the fully processed list
  return Array.from(new Set(allTags)).sort();
}
