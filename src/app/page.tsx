
import { Header } from '@/components/Header';
import { FeaturedPokemon } from '@/components/FeaturedPokemon';
import { PokemonListClient } from '@/components/client/PokemonListClient';
import { getAllPokemon, getUniqueTags } from '@/lib/pokemonApi';
import { PokemonProvider } from '@/contexts/PokemonContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function HomePage() {
  const allPokemonData = await getAllPokemon();
  const uniqueTags = await getUniqueTags();

  // Calculate collection statistics
  const totalShinyPokemon = allPokemonData.length;
  const uniquePokedexNumbers = new Set(allPokemonData.map(p => p.pokedexNumber));
  const uniqueShinyPokemonCount = uniquePokedexNumbers.size;
  const totalPossiblePokemon = 987; // Static value as requested
  const totalUniquePercentage = ((uniqueShinyPokemonCount / totalPossiblePokemon) * 100).toFixed(2);


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

          <section id="collection-stats" className="my-8">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="text-2xl font-bold font-headline text-center">Collection Statistics</CardTitle>
              </CardHeader>
              <CardContent className="text-lg text-card-foreground text-center space-y-2">
                <p>Total shiny Pokémon: <span className="font-semibold text-primary">{totalShinyPokemon}</span></p>
                <p>Unique shiny Pokémon: <span className="font-semibold text-primary">{uniqueShinyPokemonCount}</span> / {totalPossiblePokemon}</p>
                <p>Total unique percentage: <span className="font-semibold text-primary">{totalUniquePercentage}%</span></p>
              </CardContent>
            </Card>
          </section>

          <FeaturedPokemon />
          <PokemonListClient uniqueTags={uniqueTags} />
        </main>
        <footer className="py-6 text-center text-muted-foreground text-sm">
          {/* Footer text removed */}
        </footer>
      </div>
    </PokemonProvider>
  );
}
