
'use client';

import { notFound, useParams, useSearchParams } from 'next/navigation';
import { Header } from '@/components/Header';
import { PokemonDetailClient } from '@/components/client/PokemonDetailClient';
import { getPokemonById } from '@/lib/pokemonApi';
import { PokemonProvider } from '@/contexts/PokemonContext';
import { useEffect, useState } from 'react';
import { useFirestore } from '@/firebase';
import type { Pokemon } from '@/types/pokemon';
import { Skeleton } from '@/components/ui/skeleton';

export default function PokemonDetailPage() {
  const firestore = useFirestore();
  const params = useParams();
  const searchParams = useSearchParams();

  const pokemonId = params.id as string;
  const userId = searchParams.get('user');

  const [pokemon, setPokemon] = useState<Pokemon | null | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firestore || !userId || !pokemonId) {
      if (!loading) { // Avoid setting to null during initial render
        setPokemon(null);
      }
      return;
    }

    const fetchPokemon = async () => {
      setLoading(true);
      try {
        const fetchedPokemon = await getPokemonById(firestore, userId, pokemonId);
        setPokemon(fetchedPokemon || null);
      } catch (error) {
        console.error("Failed to fetch pokemon:", error);
        setPokemon(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPokemon();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firestore, userId, pokemonId]);

  if (loading || pokemon === undefined) {
    return (
      <div className="flex flex-col min-h-screen bg-background text-foreground">
        <Header />
        <main className="flex-1 container mx-auto p-4 md:p-6">
          <Skeleton className="h-96 w-full" />
        </main>
      </div>
    );
  }

  if (!pokemon) {
    notFound();
  }

  // The PokemonProvider needs a valid userId to function correctly.
  if (!userId) {
    notFound();
  }

  return (
    <PokemonProvider initialPokemon={[pokemon]} userId={userId}>
      <div className="flex flex-col min-h-screen bg-background text-foreground">
        <Header />
        <main className="flex-1 container mx-auto p-4 md:p-6">
          <PokemonDetailClient pokemon={pokemon} />
        </main>
        <footer className="py-6 text-center text-muted-foreground text-sm">
          © 2025 Rosie. All rights reserved.
        </footer>
      </div>
    </PokemonProvider>
  );
}
