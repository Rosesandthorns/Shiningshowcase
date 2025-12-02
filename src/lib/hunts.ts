
'use client';

import { collection, addDoc, type Firestore } from 'firebase/firestore';
import type { Hunt } from '@/types/hunts';
import { getPokemonDetailsByName } from './pokemonApi';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';


type NewHuntData = {
    pokemonName: string;
    game: string;
    method: string;
    shinyCharm: boolean;
    odds: number;
}

// This function is now designed to not be awaited. It will run in the background.
export function addHunt(firestore: Firestore, userId: string, data: NewHuntData): void {
  const huntsRef = collection(firestore, 'users', userId, 'hunts');
  
  // This part can remain async as it's a read operation before the write.
  const createAndAddHunt = async () => {
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

    // Do NOT await addDoc. Chain .catch() for error handling.
    addDoc(huntsRef, newHunt)
        .catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: huntsRef.path,
                operation: 'create',
                requestResourceData: newHunt,
            } satisfies SecurityRuleContext);
            errorEmitter.emit('permission-error', permissionError);
            console.error("Re-throwing error for form state handling", serverError);
            // We can re-throw here if the calling form needs to know about the failure.
            throw serverError;
        });
  };

  createAndAddHunt().catch(error => {
    // This top-level catch is for any errors within createAndAddHunt itself,
    // including the re-thrown one from addDoc's failure.
    console.error("Failed to initiate hunt creation:", error);
    // You might want to bubble this up to the UI if needed.
  });
}
