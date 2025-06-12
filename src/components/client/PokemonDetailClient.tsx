"use client";

import Image from 'next/image';
import type { Pokemon } from '@/types/pokemon';
import { usePokemon } from '@/contexts/PokemonContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShinySparkleIcon } from '@/components/icons/ShinySparkleIcon';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Check, X } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface PokemonDetailClientProps {
  pokemon: Pokemon;
}

const getTagSpecificClasses = (tag: string): string => {
  const normalizedTag = tag.toLowerCase().replace(/\s+/g, '-');
  let bgColorClass = `bg-tag-${normalizedTag}`;
  let textColorClass = 'tag-text-default';

  const blackTextTags = ['electric', 'pla', 'fairy', 'bug', 'ice', 'normal', 'lgpe', 'pogo', 'mythical', 'favourite'];
  if (blackTextTags.includes(normalizedTag)) {
    textColorClass = `text-tag-${normalizedTag}`;
  }
  
  if (normalizedTag === 'favourite') return 'tag-favourite';
  if (normalizedTag === 'starter') return 'tag-starter';
  
  const definedColors = ['sv', 'water', 'grass', 'dark', 'fire', 'electric', 'flying', 'pla', 'poison', 'ghost', 'swsh', 'fairy', 'dragon', 'fighting', 'steel', 'bug', 'psychic', 'rock', 'ground', 'paradox', 'ice', 'fossil', 'legendary', 'ultra-beast', 'normal', 'alpha', 'lgpe', 'pogo', 'mythical'];
  if (!definedColors.includes(normalizedTag)) {
    return "bg-secondary text-secondary-foreground";
  }

  return `${bgColorClass} ${textColorClass}`;
};

export function PokemonDetailClient({ pokemon: initialPokemonData }: PokemonDetailClientProps) {
  const { pokemonList, updateShinyViewed } = usePokemon();
  const { toast } = useToast();

  const pokemon = pokemonList.find(p => p.id === initialPokemonData.id) || initialPokemonData;

  const handleToggleShinyViewed = () => {
    updateShinyViewed(pokemon.id, !pokemon.shinyViewed);
    toast({
      title: `Shiny ${pokemon.name} ${!pokemon.shinyViewed ? 'marked as viewed' : 'marked as not viewed'}!`,
      description: (
        <div className="flex items-center">
          <ShinySparkleIcon viewed={!pokemon.shinyViewed} className="mr-2" />
          {`You've updated the shiny status for ${pokemon.name}.`}
        </div>
      ),
      duration: 3000,
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Button variant="outline" asChild className="mb-6">
        <Link href="/">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to List
        </Link>
      </Button>

      <Card className="overflow-hidden shadow-xl">
        <CardHeader className="bg-muted/50 p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-3xl md:text-4xl font-bold font-headline">{pokemon.name}</CardTitle>
              <CardDescription className="text-lg text-muted-foreground">
                {pokemon.speciesName} (#{pokemon.pokedexNumber})
                {pokemon.speciesDescription && ` - ${pokemon.speciesDescription}`}
              </CardDescription>
            </div>
            <Button onClick={handleToggleShinyViewed} variant={pokemon.shinyViewed ? "secondary" : "default"} size="lg">
              {pokemon.shinyViewed ? <X className="mr-2 h-5 w-5" /> : <Check className="mr-2 h-5 w-5" />}
              {pokemon.shinyViewed ? 'Unmark Shiny Viewed' : 'Mark Shiny Viewed'}
              <ShinySparkleIcon viewed={pokemon.shinyViewed} className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {pokemon.description && (
            <>
              <p className="mb-6 text-card-foreground">{pokemon.description}</p>
              <Separator className="my-6" />
            </>
          )}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="flex flex-col items-center p-4 border rounded-lg bg-card shadow">
              <h3 className="text-xl font-semibold mb-3">Default Sprite</h3>
              <Image
                src={pokemon.sprites.default}
                alt={`${pokemon.name} default sprite`}
                width={200}
                height={200}
                className="object-contain"
                data-ai-hint={`${pokemon.speciesName} default sprite large`}
              />
            </div>
            <div className="flex flex-col items-center p-4 border rounded-lg bg-card shadow">
              <h3 className="text-xl font-semibold mb-3">Shiny Sprite</h3>
              <Image
                src={pokemon.sprites.shiny}
                alt={`${pokemon.name} shiny sprite`}
                width={200}
                height={200}
                className="object-contain"
                data-ai-hint={`${pokemon.speciesName} shiny sprite large`}
              />
            </div>
          </div>

          <Separator className="my-6" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-lg font-semibold mb-2">Pokédex Data</h4>
              <ul className="space-y-1 text-sm">
                {pokemon.level && <li><strong>Level:</strong> {pokemon.level}</li>}
                {pokemon.nature && <li><strong>Nature:</strong> {pokemon.nature}</li>}
                {pokemon.height && <li><strong>Height:</strong> {pokemon.height / 10} m</li>}
                {pokemon.weight && <li><strong>Weight:</strong> {pokemon.weight / 10} kg</li>}
                {pokemon.types && pokemon.types.length > 0 && (
                  <li>
                    <strong>Types:</strong>
                    <span className="ml-2">
                      {pokemon.types.map(type => (
                        <Badge key={type} variant="outline" className="mr-1">{type}</Badge>
                      ))}
                    </span>
                  </li>
                )}
                {pokemon.abilities && pokemon.abilities.length > 0 && <li><strong>Abilities:</strong> {pokemon.abilities.join(', ')}</li>}
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-2">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {pokemon.tags.map(tag => (
                  <Badge 
                    key={tag} 
                    className={cn("text-xs capitalize", getTagSpecificClasses(tag))}
                    variant={getTagSpecificClasses(tag).includes("bg-secondary") ? "secondary" : "default"}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          {pokemon.moveset && pokemon.moveset.length > 0 && (
            <>
              <Separator className="my-6" />
              <div>
                <h4 className="text-lg font-semibold mb-2">Moveset</h4>
                <ul className="list-disc list-inside text-sm columns-2">
                  {pokemon.moveset.map(move => <li key={move}>{move}</li>)}
                </ul>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
