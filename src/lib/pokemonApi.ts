
import { fullPokemonData } from '@/data/pokemon';
import type { Pokemon, PokedexEntry } from '@/types/pokemon';

// In-memory cache
const evolutionChainCache = new Map<number, { speciesNames: string[], speciesDetailsList: any[] }>();
const speciesDetailCache = new Map<string, any>();
const pokemonDetailCache = new Map<string, any>();
const nationalPokedexCache: PokedexEntry[] = [];

// Simulate API delay
// const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const shinyLockedPokemon = [
    'victini', 'keldeo', 'meloetta', 'diancie', 'genesect', 'hoopa', 'volcanion', 'magearna',
    'marshadow', 'zarude',
    'pecharunt', 'ogerpon', 'miraidon', 'koraidon', 'ting-lu', 'chien-pao', 
    'wo-chien', 'chi-yu', 'cosmog', 'cosmoem',
    'glastrier', 'spectrier', 'calyrex',
    'kubfu', 'urshifu', 'urshifu-single-strike', 'urshifu-rapid-strike',
    'eternatus',
    'zacian', 'zamazenta',
    'zeraora', 'enamorus', 'enamorus-incarnate',
    'okidogi', 'munkidori', 'fezandipiti', 'terapagos',
    'walking-wake', 'iron-leaves',
    'gouging-fire', 'raging-bolt', 'iron-boulder', 'iron-crown',
    '719'
];


async function fetchWithCache(url: string, cache: Map<string, any>): Promise<any> {
    if (cache.has(url)) {
        return cache.get(url);
    }
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`API call failed for ${url}: ${response.status}`);
        }
        const data = await response.json();
        cache.set(url, data);
        return data;
    } catch (error) {
        console.error(`Fetch error for ${url}:`, error);
        throw error;
    }
}

export async function getPokemonDetailsByName(name: string): Promise<any> {
    const url = `https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`;
    return fetchWithCache(url, pokemonDetailCache);
}


export async function getAllPokemon(): Promise<Pokemon[]> {
  const pokemonWithDetails = await Promise.all(
    fullPokemonData.map(async (pokemon) => {
      let updatedPokemon = { ...pokemon };
      const isPlaceholderImage = !pokemon.sprites.shiny || pokemon.sprites.shiny.includes('placehold.co') || pokemon.sprites.shiny.includes('via.placeholder.com');
      
      if (isPlaceholderImage) {
        try {
          let apiName = pokemon.speciesName.toLowerCase().replace(/[\s.'é]+/g, '-');
          
          const response = await getPokemonDetailsByName(apiName);
          
          if (response) {
            updatedPokemon.sprites = {
              default: response.sprites?.front_default || updatedPokemon.sprites.default,
              shiny: response.sprites?.front_shiny || response.sprites?.front_default || updatedPokemon.sprites.shiny,
            };
            updatedPokemon.types = response.types.map((t: any) => t.type.name);
            updatedPokemon.abilities = response.abilities.map((a: any) => a.ability.name.replace('-', ' '));
            updatedPokemon.height = response.height;
            updatedPokemon.weight = response.weight;
          }
        } catch (error) {
          console.warn(`Could not fetch full details for ${pokemon.speciesName}. Using fallback sprite. Error: ${error}`);
          // Use the reliable default sprite from PokeAPI if all else fails
          if (pokemon.pokedexNumber > 0) {
            updatedPokemon.sprites.default = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.pokedexNumber}.png`;
            updatedPokemon.sprites.shiny = updatedPokemon.sprites.default; // Fallback shiny to default
          }
        }
      }
      return updatedPokemon;
    })
  );
  return pokemonWithDetails;
}


export async function getPokemonById(id: number): Promise<Pokemon | undefined> {
  const allPokemon = await getAllPokemon();
  return allPokemon.find(p => p.id === id);
}

export async function getUniqueTags(): Promise<string[]> {
  const allTags = fullPokemonData.flatMap(p => p.tags);
  
  const tagMap = new Map<string, string>();
  allTags.forEach(tag => {
    const lowerCaseTag = tag.toLowerCase();
    if (!tagMap.has(lowerCaseTag)) {
      tagMap.set(lowerCaseTag, tag);
    }
  });
  
  const uniqueDisplayTags = Array.from(tagMap.values());
  
  return uniqueDisplayTags.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
}

export async function getPokemonSpeciesDetailsByUrl(url: string): Promise<any> {
    return fetchWithCache(url, speciesDetailCache);
}

async function parseEvolutionChain(chain: any): Promise<{ speciesNames: string[], speciesDetailsList: any[] }> {
    const speciesNames: string[] = [];
    const speciesDetailsPromises: Promise<any>[] = [];
    
    async function traverse(chainNode: any) {
        if (!chainNode) return;
        
        speciesNames.push(chainNode.species.name);
        speciesDetailsPromises.push(getPokemonSpeciesDetailsByUrl(chainNode.species.url));

        if (chainNode.evolves_to && chainNode.evolves_to.length > 0) {
            for (const evolution of chainNode.evolves_to) {
                await traverse(evolution);
            }
        }
    }
    
    await traverse(chain);
    const speciesDetailsList = await Promise.all(speciesDetailsPromises);

    return { speciesNames, speciesDetailsList };
}

export async function getEvolutionChainByPokedexNumber(pokedexNumber: number): Promise<{ speciesNames: string[], speciesDetailsList: any[] }> {
    if (evolutionChainCache.has(pokedexNumber)) {
        return evolutionChainCache.get(pokedexNumber)!;
    }

    try {
        const speciesUrl = `https://pokeapi.co/api/v2/pokemon-species/${pokedexNumber}/`;
        const speciesData = await fetchWithCache(speciesUrl, speciesDetailCache);
        
        const evolutionChainUrl = speciesData.evolution_chain.url;
        const evolutionChainData = await fetchWithCache(evolutionChainUrl, new Map());

        const { speciesNames, speciesDetailsList } = await parseEvolutionChain(evolutionChainData.chain);
        
        const result = { speciesNames, speciesDetailsList };
        evolutionChainCache.set(pokedexNumber, result);
        return result;
    } catch (error) {
        console.error(`Failed to get evolution chain for Pokedex #${pokedexNumber}:`, error);
        return { speciesNames: [], speciesDetailsList: [] };
    }
}

export async function getNationalPokedex(): Promise<PokedexEntry[]> {
    if (nationalPokedexCache.length > 0) {
        return nationalPokedexCache;
    }
    try {
        const response = await fetch('https://pokeapi.co/api/v2/pokemon-species?limit=1025');
        if (!response.ok) {
            throw new Error('Failed to fetch national pokedex list');
        }
        const data = await response.json();
        
        const entries: PokedexEntry[] = await Promise.all(data.results.map(async (species: { name: string, url: string }) => {
            const urlParts = species.url.split('/');
            const pokedexNumber = parseInt(urlParts[urlParts.length - 2]);
            const sprite = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokedexNumber}.png`;

            const speciesName = species.name
                .split('-')
                .map(part => part.charAt(0).toUpperCase() + part.slice(1))
                .join(' ');
            
            return {
                pokedexNumber,
                speciesName: speciesName,
                sprite,
                status: 'uncaught'
            };
        }));
        
        nationalPokedexCache.push(...entries);
        return entries;

    } catch (error) {
        console.error("Could not fetch National Pokedex:", error);
        return [];
    }
}
