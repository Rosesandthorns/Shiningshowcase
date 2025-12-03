
'use client';

import { doc, setDoc, deleteDoc, type Firestore } from 'firebase/firestore';

export async function followUser(firestore: Firestore, currentUserId: string, targetUserId: string): Promise<void> {
    const followDocRef = doc(firestore, 'users', currentUserId, 'following', targetUserId);
    await setDoc(followDocRef, { followedAt: Date.now() });
}

export async function unfollowUser(firestore: Firestore, currentUserId: string, targetUserId: string): Promise<void> {
    const followDocRef = doc(firestore, 'users', currentUserId, 'following', targetUserId);
    await deleteDoc(followDocRef);
}
