
'use client';

import { 
    collection, 
    doc, 
    updateDoc, 
    addDoc,
    getDocs,
    writeBatch,
    query,
    orderBy,
    limit,
    type Firestore,
    runTransaction
} from 'firebase/firestore';
import type { Pokemon } from '@/types/pokemon';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';
import { getAuth } from 'firebase/auth';

const SHARD_SIZE = 200;

export async function addPokemon(firestore: Firestore, userId: string, pokemonData: Omit<Pokemon, 'id' | 'shinyViewed' | 'userId'>): Promise<void> {
    const auth = getAuth(firestore.app);
    if (!auth.currentUser || auth.currentUser.uid !== userId) {
        throw new Error("You must be logged in to add a Pokémon.");
    }
    
    const shardsRef = collection(firestore, 'users', userId, 'pokemonShards');

    const newPokemonWithId: Pokemon = {
        ...pokemonData,
        id: doc(collection(firestore, 'temp')).id, // Generate a unique ID
        userId: userId,
        shinyViewed: false,
    };
    
    try {
        await runTransaction(firestore, async (transaction) => {
            const lastShardQuery = query(shardsRef, orderBy('shardId', 'desc'), limit(1));
            const lastShardSnapshot = await transaction.get(lastShardQuery.withConverter({
                fromFirestore: (snapshot): any => snapshot.data(),
                toFirestore: (modelObject) => modelObject
            }));

            if (lastShardSnapshot.empty || lastShardSnapshot.docs[0].data().pokemon.length >= SHARD_SIZE) {
                // Create a new shard
                const newShardId = lastShardSnapshot.empty ? 1 : lastShardSnapshot.docs[0].data().shardId + 1;
                const newShardRef = doc(shardsRef, String(newShardId));
                transaction.set(newShardRef, {
                    shardId: newShardId,
                    pokemon: [newPokemonWithId],
                    createdAt: Date.now(),
                });
            } else {
                // Add to the existing shard
                const lastShardDoc = lastShardSnapshot.docs[0];
                const lastShardRef = doc(shardsRef, lastShardDoc.id);
                const newPokemonArray = [...lastShardDoc.data().pokemon, newPokemonWithId];
                transaction.update(lastShardRef, { pokemon: newPokemonArray });
            }
        });
    } catch (serverError: any) {
        const permissionError = new FirestorePermissionError({
            path: shardsRef.path,
            operation: 'create', // Representing the 'add' as a create/update op
            requestResourceData: newPokemonWithId,
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
        throw serverError; // Re-throw for the form to handle
    }
}


export async function deletePokemon(firestore: Firestore, userId: string, pokemonId: string): Promise<void> {
    const auth = getAuth(firestore.app);
    if (!auth.currentUser || auth.currentUser.uid !== userId) {
        throw new Error("You must be logged in to delete a Pokémon.");
    }
    
    const shardsRef = collection(firestore, 'users', userId, 'pokemonShards');
    
    try {
        await runTransaction(firestore, async (transaction) => {
            const querySnapshot = await getDocs(shardsRef); // Read outside transaction if possible, but fine for this scope
            for (const shardDoc of querySnapshot.docs) {
                const shardData = shardDoc.data();
                const pokemonIndex = shardData.pokemon.findIndex((p: Pokemon) => p.id === pokemonId);

                if (pokemonIndex > -1) {
                    const updatedPokemon = shardData.pokemon.filter((p: Pokemon) => p.id !== pokemonId);
                    const shardRef = doc(shardsRef, shardDoc.id);

                    if (updatedPokemon.length === 0) {
                        transaction.delete(shardRef); // Delete empty shard
                    } else {
                        transaction.update(shardRef, { pokemon: updatedPokemon });
                    }
                    return; // Exit after finding and deleting
                }
            }
            throw new Error("Pokémon not found in any shard.");
        });
    } catch (serverError: any) {
         const permissionError = new FirestorePermissionError({
            path: `${shardsRef.path}/{shardId}`,
            operation: 'delete',
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
        throw serverError;
    }
}

export async function updatePokemon(firestore: Firestore, userId: string, pokemonId: string, data: Partial<Pokemon>): Promise<void> {
    const auth = getAuth(firestore.app);
    if (!auth.currentUser || auth.currentUser.uid !== userId) {
        throw new Error("You must be logged in to update a Pokémon.");
    }
    
    const shardsRef = collection(firestore, 'users', userId, 'pokemonShards');

    try {
        await runTransaction(firestore, async (transaction) => {
            const querySnapshot = await getDocs(shardsRef);
            for (const shardDoc of querySnapshot.docs) {
                const shardData = shardDoc.data();
                const pokemonIndex = shardData.pokemon.findIndex((p: Pokemon) => p.id === pokemonId);

                if (pokemonIndex > -1) {
                    const updatedPokemonArray = [...shardData.pokemon];
                    updatedPokemonArray[pokemonIndex] = { ...updatedPokemonArray[pokemonIndex], ...data };
                    
                    const shardRef = doc(shardsRef, shardDoc.id);
                    transaction.update(shardRef, { pokemon: updatedPokemonArray });
                    return; // Exit after finding and updating
                }
            }
             throw new Error("Pokémon not found in any shard to update.");
        });
    } catch (serverError: any) {
        const permissionError = new FirestorePermissionError({
            path: `${shardsRef.path}/{shardId}`,
            operation: 'update',
            requestResourceData: data,
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
        throw serverError;
    }
}

    