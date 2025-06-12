
import { fullPokemonData } from '@/data/pokemon';
import type { Pokemon } from '@/types/pokemon';

// Simulate API delay
// const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function getAllPokemon(): Promise<Pokemon[]> {
  // await delay(100); // Simulate network latency
  return fullPokemonData;
}

export async function getPokemonById(id: number): Promise<Pokemon | undefined> {
  // await delay(50);
  return fullPokemonData.find(p => p.id === id);
}

export async function getUniqueTags(): Promise<string[]> {
  // await delay(50);
  const allTags = fullPokemonData.flatMap(p => p.tags);
  
  // Use a Map to store the first encountered casing for each unique lowercase tag
  const tagMap = new Map<string, string>();
  allTags.forEach(tag => {
    const lowerCaseTag = tag.toLowerCase();
    if (!tagMap.has(lowerCaseTag)) {
      tagMap.set(lowerCaseTag, tag); // Store original casing
    }
  });
  
  const uniqueDisplayTags = Array.from(tagMap.values());
  
  // Sort by the lowercase version for consistent ordering, but return the display casing
  return uniqueDisplayTags.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
}

