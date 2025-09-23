
import { fullPokemonData } from '@/data/pokemon';
import type { Pokemon } from '@/types/pokemon';

// Simulate API delay
// const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function getAllPokemon(): Promise<Pokemon[]> {
  const pokemonWithSprites = await Promise.all(
    fullPokemonData.map(async (pokemon) => {
      const isPlaceholder = pokemon.sprites.shiny.includes('placehold.co') || pokemon.sprites.shiny.includes('via.placeholder.com');
      if (isPlaceholder && pokemon.pokedexNumber > 0) {
        try {
          const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon.pokedexNumber}`);
          if (!response.ok) {
            console.error(`Failed to fetch data for Pokedex #${pokemon.pokedexNumber}`);
            return pokemon; // Return original data on fetch error
          }
          const data = await response.json();
          const shinySprite = data?.sprites?.front_shiny;

          if (shinySprite) {
            return {
              ...pokemon,
              sprites: {
                ...pokemon.sprites,
                shiny: shinySprite,
              },
            };
          }
        } catch (error) {
          console.error(`Error fetching sprite for Pokedex #${pokemon.pokedexNumber}:`, error);
          // If fetching fails for any reason (network error, API down, etc.),
          // return the original pokemon data with the placeholder.
          return pokemon;
        }
      }
      return pokemon;
    })
  );
  return pokemonWithSprites;
}


export async function getPokemonById(id: number): Promise<Pokemon | undefined> {
  // We need to fetch all to get potential API sprites
  const allPokemon = await getAllPokemon();
  return allPokemon.find(p => p.id === id);
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
