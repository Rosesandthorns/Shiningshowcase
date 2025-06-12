import { Header } from '@/components/Header';
import { FeaturedPokemon } from '@/components/FeaturedPokemon';
import { PokemonListClient } from '@/components/client/PokemonListClient';
import { getAllPokemon, getUniqueTags } from '@/lib/pokemonApi';
import { PokemonProvider } from '@/contexts/PokemonContext';

export default async function HomePage() {
  // Fetch initial data on the server
  const allPokemonData = await getAllPokemon();
  const uniqueTags = await getUniqueTags();

  return (
    <PokemonProvider initialPokemon={allPokemonData}>
      <div className="flex flex-col min-h-screen bg-background text-foreground">
        <Header />
        <main className="flex-1 container mx-auto p-4 md:p-6">
          <FeaturedPokemon />
          <PokemonListClient uniqueTags={uniqueTags} />
        </main>
        <footer className="py-6 text-center text-muted-foreground text-sm">
          Pokémon data is mock and for demonstration purposes.
        </footer>
      </div>
    </PokemonProvider>
  );
}
