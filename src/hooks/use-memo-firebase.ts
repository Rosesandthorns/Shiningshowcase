
"use client";

import { useMemo, type DependencyList } from 'react';
import { type Query, type DocumentReference } from 'firebase/firestore';

// Helper function for deep equality check of dependency arrays
function deepEqual(a: DependencyList, b: DependencyList): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      // Basic check; for objects, this will be a reference check.
      // This is usually sufficient for Firestore objects if they are stable.
      return false;
    }
  }
  return true;
}

/**
 * A custom `useMemo` hook that is specifically designed to memoize Firebase
 * Query or DocumentReference objects. It helps prevent infinite loops in
 * hooks like `useCollection` or `useDocument` by ensuring the reference
 * object is stable across re-renders unless its dependencies actually change.
 *
 * @param factory A function that creates the Firebase Query or DocumentReference.
 * @param deps An array of dependencies for the factory function.
 * @returns The memoized Firebase object.
 */
export function useMemoFirebase<T extends Query | DocumentReference | null>(
  factory: () => T,
  deps: DependencyList
): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(factory, deps);
}
