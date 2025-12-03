'use client';

import { useState, useEffect } from 'react';
import { useFirestore } from '@/firebase';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { SearchBar } from '../SearchBar';
import { Card, CardContent } from '../ui/card';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Skeleton } from '../ui/skeleton';
import { cn } from '@/lib/utils';
import type { UserProfile } from '@/types/user';

export function SearchClient() {
  const firestore = useFirestore();
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const performSearch = async () => {
      if (!firestore || searchTerm.trim().length < 2) {
        setResults([]);
        if(hasSearched) setHasSearched(false);
        return;
      }

      setLoading(true);
      setHasSearched(true);
      
      try {
        const usersRef = collection(firestore, 'users');
        // Firestore doesn't support case-insensitive or partial text search natively.
        // This query finds names that start with the search term.
        const q = query(
          usersRef,
          where('displayName', '>=', searchTerm),
          where('displayName', '<=', searchTerm + '\uf8ff'),
          orderBy('displayName'),
          limit(20)
        );
        
        const querySnapshot = await getDocs(q);
        const users = querySnapshot.docs.map(doc => ({
          uid: doc.id,
          ...doc.data(),
        } as UserProfile));

        setResults(users);
      } catch (error) {
        console.error("Error searching for users:", error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };
    
    // Debounce the search to avoid too many reads
    const debounceTimeout = setTimeout(() => {
      performSearch();
    }, 500);

    return () => clearTimeout(debounceTimeout);
  }, [searchTerm, firestore, hasSearched]);

  const getBorderClass = (state?: string) => {
    switch (state) {
      case 'owner':
      case 'dev':
        return 'feature-card-border';
      case 'supporter':
        return 'supporter-card-border';
      default:
        return '';
    }
  };

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold font-headline">Search for a User</h1>
        <p className="text-muted-foreground mt-2">Find and explore other users' shiny collections.</p>
      </div>
      <div className="max-w-lg mx-auto mb-8">
        <SearchBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          placeholder="Search by display name..."
        />
      </div>

      <div>
        {loading && (
           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="p-4">
                <div className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-[150px]" />
                    </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {!loading && hasSearched && results.length === 0 && (
          <p className="text-center text-muted-foreground py-10">
            No users found matching "{searchTerm}".
          </p>
        )}

        {!loading && results.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {results.map(user => (
              <Link key={user.uid} href={`/profile/${user.uid}`} legacyBehavior>
                <a className={cn("block rounded-lg", getBorderClass(user.state))}>
                  <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full bg-card/80 backdrop-blur-sm">
                    <CardContent className="p-4 flex items-center space-x-4">
                      <Avatar className="h-12 w-12">
                        {user.photoURL && <AvatarImage src={user.photoURL} alt={user.displayName} />}
                        <AvatarFallback>{user.displayName?.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-card-foreground">{user.displayName}</p>
                      </div>
                    </CardContent>
                  </Card>
                </a>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
