
'use client';

import { collection, addDoc, doc, deleteDoc, updateDoc, type Firestore } from 'firebase/firestore';
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


export async function deletePokemon(firestore: Firestore, userId: string, pokemonId: string): Promise<void> {
  const pokemonDocRef = doc(firestore, 'users', userId, 'pokemon', pokemonId);
  try {
    await deleteDoc(pokemonDocRef);
  } catch (serverError: any) {
    const permissionError = new FirestorePermissionError({
      path: pokemonDocRef.path,
      operation: 'delete',
    } satisfies SecurityRuleContext);
    errorEmitter.emit('permission-error', permissionError);
    throw serverError;
  }
}

export async function updatePokemon(firestore: Firestore, userId: string, pokemonId: string, data: Partial<Pokemon>): Promise<void> {
    const pokemonDocRef = doc(firestore, 'users', userId, 'pokemon', pokemonId);
    try {
        await updateDoc(pokemonDocRef, data);
    } catch (serverError: any) {
        const permissionError = new FirestorePermissionError({
            path: pokemonDocRef.path,
            operation: 'update',
            requestResourceData: data,
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
        throw serverError;
    }
}
