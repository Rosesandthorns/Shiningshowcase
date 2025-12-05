
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
    runTransaction,
    deleteField
} from 'firebase/firestore';
import type { Pokemon } from '@/types/pokemon';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';
import { getAuth } from 'firebase/auth';

const SHARD_SIZE = 500;

export async function addPokemon(firestore: Firestore, userId: string, pokemonData: Omit<Pokemon, 'id' | 'shinyViewed' | 'userId'>): Promise<void> {
    const auth = getAuth(firestore.app);
    if (!auth.currentUser || auth.currentUser.uid !== userId) {
        throw new Error("You must be logged in to add a Pokémon.");
    }
    
    const shardsRef = collection(firestore, 'users', userId, 'pokemonShards');

    const newPokemonId = doc(collection(firestore, 'temp')).id;
    const newPokemonWithId: Pokemon = {
        ...pokemonData,
        id: newPokemonId,
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

            if (lastShardSnapshot.empty || lastShardSnapshot.docs[0].data().pokemonCount >= SHARD_SIZE) {
                // Create a new shard
                const newShardId = lastShardSnapshot.empty ? 1 : lastShardSnapshot.docs[0].data().shardId + 1;
                const newShardRef = doc(shardsRef, String(newShardId));
                transaction.set(newShardRef, {
                    shardId: newShardId,
                    pokemonMap: { [newPokemonId]: newPokemonWithId },
                    pokemonCount: 1,
                    createdAt: Date.now(),
                });
            } else {
                // Add to the existing shard
                const lastShardDoc = lastShardSnapshot.docs[0];
                const lastShardRef = doc(shardsRef, lastShardDoc.id);
                const currentCount = lastShardDoc.data().pokemonCount || Object.keys(lastShardDoc.data().pokemonMap).length;

                transaction.update(lastShardRef, {
                    [`pokemonMap.${newPokemonId}`]: newPokemonWithId,
                    pokemonCount: currentCount + 1,
                });
            }
        });
    } catch (serverError: any) {
        const permissionError = new FirestorePermissionError({
            path: shardsRef.path,
            operation: 'create',
            requestResourceData: newPokemonWithId,
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
        throw serverError;
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
            const querySnapshot = await getDocs(shardsRef); // Read outside transaction is better but this is fine for now
            for (const shardDoc of querySnapshot.docs) {
                const shardData = shardDoc.data();
                if (shardData.pokemonMap && shardData.pokemonMap[pokemonId]) {
                    const shardRef = doc(shardsRef, shardDoc.id);
                    const currentCount = shardData.pokemonCount;

                    // If this is the last Pokémon in the shard, delete the whole shard
                    if (currentCount <= 1) {
                        transaction.delete(shardRef);
                    } else {
                        // Otherwise, just remove the Pokémon from the map
                        transaction.update(shardRef, {
                            [`pokemonMap.${pokemonId}`]: deleteField(),
                            pokemonCount: currentCount - 1,
                        });
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
                if (shardData.pokemonMap && shardData.pokemonMap[pokemonId]) {
                    const shardRef = doc(shardsRef, shardDoc.id);
                    const existingPokemon = shardData.pokemonMap[pokemonId];
                    const updatedPokemon = { ...existingPokemon, ...data };
                    
                    transaction.update(shardRef, {
                        [`pokemonMap.${pokemonId}`]: updatedPokemon,
                    });
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
