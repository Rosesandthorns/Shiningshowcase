import { Header } from '@/components/Header';
import { FeaturedPokemon } from '@/components/FeaturedPokemon';
import { PokemonListClient } from '@/components/client/PokemonListClient';
import { getAllPokemon, getUniqueTags } from '@/lib/pokemonApi';
import { PokemonProvider } from '@/contexts/PokemonContext';

export default async function HomePage() {
  const allPokemonData = await getAllPokemon();
  const uniqueTags = await getUniqueTags();

  return (
    <PokemonProvider initialPokemon={allPokemonData}>
      <div className="flex flex-col min-h-screen bg-background text-foreground">
        <Header />
        <main className="flex-1 container mx-auto p-4 md:p-6">
          <section id="about-me" className="my-8 p-6 bg-card rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4 font-headline text-center">About Me</h2>
            <p className="text-lg text-center text-card-foreground">
              My name is Rosie, I have spent well over 1000 hours shiny hunting Pokémon
              to build a living shiny national dex, and this is all the Pokémon I've collected so far.
            </p>
          </section>
          <FeaturedPokemon />
          <PokemonListClient uniqueTags={uniqueTags} />
        </main>
        <footer className="py-6 text-center text-muted-foreground text-sm">
          Pokémon data from Rosie's collection. Gotta shiny 'em all!
        </footer>
      </div>
    </PokemonProvider>
  );
}
