
import { collection, addDoc, serverTimestamp, type Firestore } from 'firebase/firestore';
import type { Hunt } from '@/types/hunts';
import { getPokemonDetailsByName } from './pokemonApi';

type NewHuntData = {
    pokemonName: string;
    game: string;
    method: string;
    shinyCharm: boolean;
    odds: number;
}

export async function addHunt(firestore: Firestore, userId: string, data: NewHuntData): Promise<void> {
  const huntsRef = collection(firestore, 'users', userId, 'hunts');
  
  let spriteUrl = 'https://placehold.co/96x96.png';
  try {
      const pokemonDetails = await getPokemonDetailsByName(data.pokemonName);
      if (pokemonDetails?.sprites?.front_shiny) {
          spriteUrl = pokemonDetails.sprites.front_shiny;
      } else if (pokemonDetails?.sprites?.front_default) {
          spriteUrl = pokemonDetails.sprites.front_default;
      }
  } catch (error) {
      console.warn(`Could not fetch sprite for ${data.pokemonName}. Using placeholder.`)
  }

  const newHunt: Omit<Hunt, 'id'> = {
    userId,
    pokemonName: data.pokemonName,
    pokemonSprite: spriteUrl,
    game: data.game,
    method: data.method,
    shinyCharm: data.shinyCharm,
    odds: data.odds,
    encounters: 0,
    timeElapsed: 0,
    isActive: false,
    createdAt: Date.now(),
  };

  await addDoc(huntsRef, newHunt);
}
