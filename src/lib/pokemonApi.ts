
import { fullPokemonData } from '@/data/pokemon';
import type { Pokemon } from '@/types/pokemon';

// In-memory cache
const evolutionChainCache = new Map<number, string[]>();
const speciesDetailCache = new Map<string, any>();

// Simulate API delay
// const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchWithCache(url: string, cache: Map<string, any>): Promise<any> {
    if (cache.has(url)) {
        return cache.get(url);
    }
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`API call failed: ${response.status}`);
        }
        const data = await response.json();
        cache.set(url, data);
        return data;
    } catch (error) {
        console.error(`Fetch error for ${url}:`, error);
        throw error;
    }
}


export async function getAllPokemon(): Promise<Pokemon[]> {
  const pokemonWithSprites = await Promise.all(
    fullPokemonData.map(async (pokemon) => {
      const isPlaceholder = pokemon.sprites.shiny.includes('placehold.co') || pokemon.sprites.shiny.includes('via.placeholder.com');
      if (isPlaceholder && pokemon.pokedexNumber > 0) {
        try {
          const data = await getPokemonSpeciesDetails(pokemon.pokedexNumber.toString());
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
          // Log the error but don't re-throw, so the app can continue with the placeholder
          console.error(`Error fetching sprite for Pokedex #${pokemon.pokedexNumber}:`, error);
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


export async function getPokemonSpeciesDetails(pokemonIdentifier: string | number): Promise<any> {
    const url = `https://pokeapi.co/api/v2/pokemon/${pokemonIdentifier.toString().toLowerCase()}`;
    return fetchWithCache(url, speciesDetailCache);
}


function parseEvolutionChain(chain: any): string[] {
    const evoChain: string[] = [];
    
    function traverse(chainNode: any) {
        if (!chainNode) return;
        evoChain.push(chainNode.species.name);
        if (chainNode.evolves_to && chainNode.evolves_to.length > 0) {
            chainNode.evolves_to.forEach((evolution: any) => {
                traverse(evolution);
            });
        }
    }
    
    traverse(chain);
    return evoChain;
}

export async function getEvolutionChainByPokedexNumber(pokedexNumber: number): Promise<string[]> {
    if (evolutionChainCache.has(pokedexNumber)) {
        return evolutionChainCache.get(pokedexNumber)!;
    }

    try {
        const speciesUrl = `https://pokeapi.co/api/v2/pokemon-species/${pokedexNumber}/`;
        const speciesData = await fetchWithCache(speciesUrl, speciesDetailCache);
        
        const evolutionChainUrl = speciesData.evolution_chain.url;
        const evolutionChainData = await fetchWithCache(evolutionChainUrl, new Map()); // Use a temp cache for the chain data itself

        const evolutionLine = parseEvolutionChain(evolutionChainData.chain);
        
        evolutionChainCache.set(pokedexNumber, evolutionLine);
        return evolutionLine;
    } catch (error) {
        console.error(`Failed to get evolution chain for Pokedex #${pokedexNumber}:`, error);
        return [];
    }
}
