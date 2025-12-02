'use client';

import { collection, addDoc, type Firestore } from 'firebase/firestore';
import type { Pokemon } from '@/types/pokemon';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';


export function addPokemon(firestore: Firestore, userId: string, pokemonData: Omit<Pokemon, 'id' | 'shinyViewed' | 'userId'>): void {
  const pokemonRef = collection(firestore, 'users', userId, 'pokemon');

  const newPokemon = {
    ...pokemonData,
    userId: userId,
    shinyViewed: false, // Always false on creation
  };
  
  addDoc(pokemonRef, newPokemon)
    .catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: pokemonRef.path,
        operation: 'create',
        requestResourceData: newPokemon,
      } satisfies SecurityRuleContext);
      errorEmitter.emit('permission-error', permissionError);
      throw serverError; // Re-throw for the form to handle
    });
}
