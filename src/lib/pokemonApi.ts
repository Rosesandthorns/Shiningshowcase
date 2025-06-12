import { mockPokemonData } from '@/data/pokemon';
import type { Pokemon } from '@/types/pokemon';

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function getAllPokemon(): Promise<Pokemon[]> {
  // await delay(100); // Simulate network latency
  return mockPokemonData;
}

export async function getPokemonById(id: number): Promise<Pokemon | undefined> {
  // await delay(50);
  return mockPokemonData.find(p => p.id === id);
}

export async function getUniqueTags(): Promise<string[]> {
  // await delay(50);
  const allTags = mockPokemonData.flatMap(p => p.tags);
  return Array.from(new Set(allTags)).sort();
}
