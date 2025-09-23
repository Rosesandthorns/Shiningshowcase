
import type { Pokemon } from '@/types/pokemon';
import { userPokemonData as part1 } from './pokemon/part-1';
import { userPokemonData as part2 } from './pokemon/part-2';
import { userPokemonData as part3 } from './pokemon/part-3';
import { userPokemonData as part4 } from './pokemon/part-4';
import { userPokemonData as part5 } from './pokemon/part-5';
import { userPokemonData as part6 } from './pokemon/part-6';
import { userPokemonData as part7 } from './pokemon/part-7';
import { userPokemonData as part8 } from './pokemon/part-8';
import { userPokemonData as part9 } from './pokemon/part-9';
import { userPokemonData as part10 } from './pokemon/part-10';
import { userPokemonData as part11 } from './pokemon/part-11';
import { userPokemonData as part12 } from './pokemon/part-12';
import { userPokemonData as part13 } from './pokemon/part-13';
import { userPokemonData as part14 } from './pokemon/part-14';
import { userPokemonData as part15 } from './pokemon/part-15';
import { userPokemonData as part16 } from './pokemon/part-16';
import { userPokemonData as part17 } from './pokemon/part-17';
import { userPokemonData as part18 } from './pokemon/part-18';
import { userPokemonData as part19 } from './pokemon/part-19';

// Helper function to parse species string like "#475 - Gallade"
const parseSpeciesString = (speciesString: string): { pokedexNumber: number, speciesName: string } => {
  const match = speciesString.match(/#(\d+)\s*-\s*(.*)/);
  if (match) {
    return { pokedexNumber: parseInt(match[1], 10), speciesName: match[2].trim() };
  }
  // Fallback for species strings that might not have a number, e.g., "Normal" in Zangoose
  if (speciesString.match(/^[a-zA-Z\s]+$/) && !speciesString.includes('-')) {
    return { pokedexNumber: 0, speciesName: speciesString.trim() };
  }
  return { pokedexNumber: 0, speciesName: speciesString.trim() }; // General Fallback
};

// Helper to extract types from tags
const extractTypesFromTags = (tags: string[]): string[] => {
  const knownTypes = ["Normal", "Fire", "Water", "Grass", "Electric", "Ice", "Fighting", "Poison", "Ground", "Flying", "Psychic", "Bug", "Rock", "Ghost", "Dragon", "Dark", "Steel", "Fairy"];
  return tags.filter(tag => knownTypes.map(t => t.toLowerCase()).includes(tag.toLowerCase())).map(tag => knownTypes.find(t => t.toLowerCase() === tag.toLowerCase()) || tag);
};

// Original user data structure
export interface UserPokemon {
  idUnique?: number; // Make idUnique optional as it's not in all original entries
  nickname: string;
  species: string;
  description: string;
  imageUrl: string;
  tags: string[];
  level?: string | number;
  nature?: string;
  moveset?: string[];
}

const userPokemonData: UserPokemon[] = [
  ...part1,
  ...part2,
  ...part3,
  ...part4,
  ...part5,
  ...part6,
  ...part7,
  ...part8,
  ...part9,
  ...part10,
  ...part11,
  ...part12,
  ...part13,
  ...part14,
  ...part15,
  ...part16,
  ...part17,
  ...part18,
  ...part19,
];

export const mockPokemonData: Pokemon[] = userPokemonData.map((pkm, index) => {
  const { pokedexNumber, speciesName } = parseSpeciesString(pkm.species);
  const types = extractTypesFromTags(pkm.tags);
  
  // Ensure there's always a species name, even if parsing fails slightly
  const finalSpeciesName = speciesName || pkm.species.split(' - ').pop() || "Unknown Species";

  // Handle placeholder images for new entries
  let shinySprite = pkm.imageUrl;
  if (shinySprite && shinySprite.startsWith("https://via.placeholder.com/")) {
     shinySprite = `https://placehold.co/200x200.png`;
  }


  return {
    id: pkm.idUnique !== undefined ? pkm.idUnique : index + 1000, // Fallback ID for entries without idUnique
    name: pkm.nickname,
    pokedexNumber,
    speciesName: finalSpeciesName,
    sprites: {
      default: `https://placehold.co/96x96.png`,
      shiny: shinySprite,
    },
    tags: pkm.tags,
    shinyViewed: false,
    height: 0,
    weight: 0,
    types: types.length > 0 ? types : ["Unknown"],
    abilities: ["Unknown Ability"],
    description: pkm.description,
    level: pkm.level || "?",
    nature: pkm.nature || "?",
    moveset: pkm.moveset || [],
  };
});

// Ensure all IDs are unique after transformation, especially if fallback IDs were used.
// This is a simple way to ensure uniqueness if there were collisions from fallback.
// A more robust solution might be needed if pkm.idUnique can overlap with index + 1000 range.
const finalUniquePokemonData: Pokemon[] = [];
const usedIds = new Set<number>();
let nextAvailableId = 1;

mockPokemonData.forEach(pkm => {
  let currentId = pkm.id;
  if (usedIds.has(currentId)) {
    while(usedIds.has(nextAvailableId)) {
      nextAvailableId++;
    }
    currentId = nextAvailableId;
  }
  usedIds.add(currentId);
  finalUniquePokemonData.push({ ...pkm, id: currentId });
  if (currentId >= nextAvailableId) {
    nextAvailableId = currentId + 1;
  }
});

export const fullPokemonData: Pokemon[] = finalUniquePokemonData;
