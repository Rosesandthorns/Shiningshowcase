
import type { Pokemon, PokedexEntry } from '@/types/pokemon';
import type { UserProfile } from '@/types/user';
import { collection, getDocs, doc, getDoc, query, where, limit, type Firestore } from 'firebase/firestore';


// In-memory cache
const evolutionChainCache = new Map<number, { speciesNames: string[], speciesDetailsList: any[] }>();
const speciesDetailCache = new Map<string, any>();
const pokemonDetailCache = new Map<string, any>();
const nationalPokedexCache: PokedexEntry[] = [];

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
    const speciesUrl = `https://pokeapi.co/api/v2/pokemon-species/${name.toLowerCase()}`;
    const speciesData = await fetchWithCache(speciesUrl, speciesDetailCache);

    const defaultVarietyUrl = speciesData.varieties.find((v: any) => v.is_default)?.pokemon.url;
    if (!defaultVarietyUrl) throw new Error("Default variety not found for " + name);

    const defaultPokemonData = await fetchWithCache(defaultVarietyUrl, pokemonDetailCache);

    // Fetch full details for each variety to get form_names
    const varietiesWithDetails = await Promise.all(
        speciesData.varieties.map(async (v: any) => {
            const varietyDetails = await fetchWithCache(v.pokemon.url, pokemonDetailCache);
            return {
                name: v.pokemon.name,
                url: v.pokemon.url,
                form_names: varietyDetails.form_names,
            };
        })
    );

    const allData = {
        ...defaultPokemonData, // This has sprites, types, etc. of the default form
        varieties: varietiesWithDetails,
    };
    
    return allData;
}


export async function getAllPokemon(firestore: Firestore, userId: string): Promise<Pokemon[]> {
  if (!userId) return [];
  try {
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
  } catch (error) {
    console.error(`[Server API Error] Failed to fetch pokemon for userId ${userId}:`, error);
    return [];
  }
}

export async function getUserProfile(firestore: Firestore, userId: string): Promise<UserProfile | null> {
    if (!userId) {
        console.error("[Server API Error] getUserProfile called with no userId.");
        return null;
    }

    try {
        const userDocRef = doc(firestore, 'users', userId);
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists()) {
            return { uid: docSnap.id, ...docSnap.data() } as UserProfile;
        } else {
            console.log(`[Server API] No profile document found for userId: ${userId}`);
            return null;
        }
    } catch (error) {
        console.error(`[Server API Error] Failed to fetch profile for ID ${userId}:`, error);
        return null; 
    }
}


export async function getPokemonById(firestore: Firestore, userId: string, pokemonId: string): Promise<Pokemon | undefined> {
  if (!userId || !pokemonId) return undefined;
  const pokemonDocRef = doc(firestore, 'users', userId, 'pokemon', pokemonId);
  const docSnap = await getDoc(pokemonDocRef);

  if (!docSnap.exists()) {
    return undefined;
  }

  return { id: docSnap.id, ...docSnap.data() } as Pokemon;
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

    