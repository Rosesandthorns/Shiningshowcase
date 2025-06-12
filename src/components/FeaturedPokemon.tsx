"use client";

import React, { useState, useEffect } from 'react';
import { usePokemon } from '@/contexts/PokemonContext';
import { PokemonCard } from './PokemonCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from './ui/button';
import { RefreshCw } from 'lucide-react';

export function FeaturedPokemon() {
  const { pokemonList } = usePokemon();
  const [dailyPokemon, setDailyPokemon] = useState(pokemonList[0]);
  const [randomPokemon, setRandomPokemon] = useState(pokemonList[0]);

  useEffect(() => {
    if (pokemonList.length > 0) {
      // Daily Pokémon logic (simple, based on day of year)
      const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
      setDailyPokemon(pokemonList[dayOfYear % pokemonList.length]);
      
      // Initial random Pokémon
      setRandomPokemon(pokemonList[Math.floor(Math.random() * pokemonList.length)]);
    }
  }, [pokemonList]);

  const pickNewRandomPokemon = () => {
    if (pokemonList.length > 0) {
      setRandomPokemon(pokemonList[Math.floor(Math.random() * pokemonList.length)]);
    }
  };

  if (pokemonList.length === 0) {
    return null; // Or a loading state
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
            </CardHeader>
            <CardContent>
              <PokemonCard pokemon={dailyPokemon} />
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
              <PokemonCard pokemon={randomPokemon} />
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
}
