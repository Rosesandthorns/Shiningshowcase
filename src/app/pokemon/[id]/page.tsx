
import { notFound } from 'next/navigation';
import { Header } from '@/components/Header';
import { PokemonDetailClient } from '@/components/client/PokemonDetailClient';
import { getAllPokemon, getPokemonById } from '@/lib/pokemonApi';
import { PokemonProvider } from '@/contexts/PokemonContext';
import type { Metadata } from 'next';

type PokemonDetailPageProps = {
  params: {
    id: string;
  };
};

// This function can be used by Next.js to generate static pages at build time
export async function generateStaticParams() {
  const allPokemon = await getAllPokemon();
  return allPokemon.map((pokemon) => ({
    id: pokemon.id.toString(),
  }));
}

export default async function PokemonDetailPage({ params }: PokemonDetailPageProps) {
  const pokemonId = parseInt(params.id, 10);
  
  if (isNaN(pokemonId)) {
    notFound();
  }

  const pokemon = await getPokemonById(pokemonId);
  const allPokemonData = await getAllPokemon(); // For PokemonProvider context

  if (!pokemon) {
    notFound();
  }

  return (
    <PokemonProvider initialPokemon={allPokemonData}>
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

export async function generateMetadata({ params }: PokemonDetailPageProps): Promise<Metadata> {
  const pokemonId = parseInt(params.id, 10);
  if (isNaN(pokemonId)) {
    return { title: "Pokémon Not Found" };
  }
  const pokemon = await getPokemonById(pokemonId);
  if (!pokemon) {
    return { title: "Pokémon Not Found" };
  }
  return {
    title: `${pokemon.name} (${pokemon.speciesName}) - Rosie's Shiny Pokémon`,
    description: `Details for shiny ${pokemon.name} (${pokemon.speciesName}). ${pokemon.description || ''}`,
  };
}
