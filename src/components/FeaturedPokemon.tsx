"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { usePokemon } from '@/contexts/PokemonContext';
import { PokemonCard } from './PokemonCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from './ui/button';
import { RefreshCw } from 'lucide-react';
import type { Pokemon } from '@/types/pokemon';

export function FeaturedPokemon() {
  const { pokemonList } = usePokemon();
  const [dailyPokemon, setDailyPokemon] = useState<Pokemon | null>(null);
  const [randomPokemon, setRandomPokemon] = useState<Pokemon | null>(null);
  const [dailyTimer, setDailyTimer] = useState<string>('');

  const getDailyIndex = useCallback(() => {
    if (pokemonList.length === 0) return 0;
    // Use client's current date to ensure consistency for the user
    const now = new Date(); 
    const startOfYear = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - startOfYear.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    return dayOfYear % pokemonList.length;
  }, [pokemonList.length]);

  const updateDailyTimer = useCallback(() => {
    const now = new Date();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
    const diff = tomorrow.getTime() - now.getTime();

    if (diff <= 0) { // Should refresh daily pokemon
      if (pokemonList.length > 0) {
        setDailyPokemon(pokemonList[getDailyIndex()]);
      }
      // Recalculate for next day
      const nextTomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2, 0, 0, 0);
      const nextDiff = nextTomorrow.getTime() - now.getTime();
      const hours = Math.floor((nextDiff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((nextDiff / (1000 * 60)) % 60);
      const seconds = Math.floor((nextDiff / 1000) % 60);
      setDailyTimer(`${hours}h ${minutes}m ${seconds}s`);
      return;
    }

    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    setDailyTimer(`${hours}h ${minutes}m ${seconds}s`);
  }, [pokemonList, getDailyIndex]);


  useEffect(() => {
    if (pokemonList.length > 0) {
      setDailyPokemon(pokemonList[getDailyIndex()]);
      setRandomPokemon(pokemonList[Math.floor(Math.random() * pokemonList.length)]);
      updateDailyTimer(); // Initial timer set
      const timerId = setInterval(updateDailyTimer, 1000);
      return () => clearInterval(timerId);
    }
  }, [pokemonList, getDailyIndex, updateDailyTimer]);


  const pickNewRandomPokemon = () => {
    if (pokemonList.length > 0) {
      setRandomPokemon(pokemonList[Math.floor(Math.random() * pokemonList.length)]);
    }
  };

  if (pokemonList.length === 0 || (!dailyPokemon && !randomPokemon)) {
    return (
      <section aria-labelledby="featured-pokemon-title" className="mb-8">
        <h2 id="featured-pokemon-title" className="text-2xl font-bold mb-6 text-center font-headline">
          Featured Pokémon
        </h2>
        <p className="text-center text-muted-foreground">Loading featured Pokémon...</p>
      </section>
    );
  }

  return (
    <section aria-labelledby="featured-pokemon-title" className="mb-8">
      <h2 id="featured-pokemon-title" className="text-2xl font-bold mb-6 text-center font-headline">
        Featured Pokémon
      </h2>
      <div className="grid md:grid-cols-2 gap-6">
        {dailyPokemon && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-headline">Daily Pokémon</CardTitle>
              {dailyTimer && <p className="text-sm text-muted-foreground">Next update in: {dailyTimer}</p>}
            </CardHeader>
            <CardContent>
              <PokemonCard pokemon={dailyPokemon} displayFullDetail={true} />
            </CardContent>
          </Card>
        )}
        {randomPokemon && (
          <Card className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl font-headline">Random Pokémon</CardTitle>
              <Button variant="outline" size="icon" onClick={pickNewRandomPokemon} aria-label="Get new random Pokémon">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <PokemonCard pokemon={randomPokemon} displayFullDetail={true} />
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
}
