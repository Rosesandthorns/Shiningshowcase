'use client';

import { collection, addDoc, serverTimestamp, type Firestore } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';
import type { User } from 'firebase/auth';

type NewPostData = {
    title: string;
    content: string;
}

export function addChangelogPost(firestore: Firestore, user: User, data: NewPostData): void {
  const changelogRef = collection(firestore, 'changelog');

  if (!user.displayName) {
    throw new Error("User must have a display name to post.");
  }
  
  const newPost = {
    ...data,
    userId: user.uid,
    userDisplayName: user.displayName,
    userPhotoURL: user.photoURL || '',
    createdAt: Date.now()
  };
  
  addDoc(changelogRef, newPost)
    .catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: changelogRef.path,
        operation: 'create',
        requestResourceData: newPost,
      } satisfies SecurityRuleContext);
      errorEmitter.emit('permission-error', permissionError);
      throw serverError; // Re-throw for the form to handle
    });
}
