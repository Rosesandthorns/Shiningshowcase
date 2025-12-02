
import type { Pokemon, PokedexEntry } from '@/types/pokemon';
import { collection, getDocs, query, where, limit, type Firestore } from 'firebase/firestore';


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


export async function getAllPokemon(firestore: Firestore, userId: string): Promise<Pokemon[]> {
  const pokemonColRef = collection(firestore, 'users', userId, 'pokemon');
  const snapshot = await getDocs(pokemonColRef);
  
  if (snapshot.empty) {
    return [];
  }
  
  const pokemonList = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Pokemon));
  
  return pokemonList;
}


export async function getPokemonById(firestore: Firestore, userId: string, pokemonId: string): Promise<Pokemon | undefined> {
  const allPokemon = await getAllPokemon(firestore, userId);
  return allPokemon.find(p => p.id === pokemonId);
}

export async function getUniqueTags(firestore: Firestore, userId: string): Promise<string[]> {
  const allPokemon = await getAllPokemon(firestore, userId);
  const allTags = allPokemon.flatMap(p => p.tags);
  
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

export async function getUserIdFromDisplayName(firestore: Firestore, displayName: string): Promise<string | null> {
    const usersRef = collection(firestore, "users");
    const q = query(usersRef, where("displayName", "==", displayName), limit(1));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
        return null;
    }
    return querySnapshot.docs[0].id;
}
