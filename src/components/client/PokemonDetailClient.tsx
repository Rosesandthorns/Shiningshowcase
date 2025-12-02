
"use client";

import Image from 'next/image';
import type { Pokemon, StatsSet } from '@/types/pokemon';
import { usePokemon } from '@/contexts/PokemonContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface PokemonDetailClientProps {
  pokemon: Pokemon;
}

const getTagSpecificClasses = (tag: string): string => {
  const normalizedTag = tag.toLowerCase().replace(/\s+/g, '-');
  let bgColorClass = `bg-tag-${normalizedTag}`;
  let textColorClass = 'tag-text-default';

  const blackTextTags = ['electric', 'pla', 'fairy', 'bug', 'ice', 'normal', 'lgpe', 'mythical', 'favourite', 'water', 'grass', 'flying', 'swsh'];
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

const StatDisplay = ({ title, stats }: { title: string, stats?: StatsSet }) => {
  if (!stats || Object.values(stats).every(val => val === 0)) return null;
  return (
    <div>
      <h4 className="text-lg font-semibold mb-2">{title}</h4>
      <div className="grid grid-cols-3 gap-x-4 gap-y-1 text-sm">
        <span>HP: {stats.hp}</span>
        <span>Atk: {stats.attack}</span>
        <span>Def: {stats.defense}</span>
        <span>Sp. Atk: {stats.spAttack}</span>
        <span>Sp. Def: {stats.spDefense}</span>
        <span>Speed: {stats.speed}</span>
      </div>
    </div>
  );
};


export function PokemonDetailClient({ pokemon: initialPokemonData }: PokemonDetailClientProps) {
  const { pokemonList } = usePokemon();
  const router = useRouter();

  const pokemon = pokemonList.find(p => p.id === initialPokemonData.id) || initialPokemonData;

  const displayAbility = pokemon.abilities && pokemon.abilities.length > 0 && pokemon.abilities[0] !== "Unknown Ability" && pokemon.abilities[0] !== "Unknown ability"
    ? pokemon.abilities[0]
    : "Not specified";

  return (
    <div className="max-w-4xl mx-auto">
      <Button variant="outline" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to List
      </Button>

      <Card className="overflow-hidden shadow-xl">
        <CardHeader className="bg-muted/50 p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-3xl md:text-4xl font-bold font-headline">{pokemon.name}</CardTitle>
              <CardDescription className="text-lg text-muted-foreground">
                {pokemon.speciesName} (#{pokemon.pokedexNumber})
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {pokemon.description && (
            <>
              <p className="mb-6 text-card-foreground">{pokemon.description}</p>
              <Separator className="my-6" />
            </>
          )}
          <div className="flex justify-center mb-6"> 
            <div className="flex flex-col items-center p-4 border rounded-lg bg-card shadow">
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
                 {pokemon.gender && <li><strong>Gender:</strong> {pokemon.gender}</li>}
                {pokemon.nature && <li><strong>Nature:</strong> {pokemon.nature}</li>}
                {pokemon.ball && <li><strong>Ball:</strong> {pokemon.ball}</li>}
                {pokemon.gameOrigin && <li><strong>Origin:</strong> {pokemon.gameOrigin}</li>}
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
                 <li>
                  <strong>Ability:</strong> {displayAbility}
                </li>
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
          
          {(pokemon.ivs || pokemon.evs) && (Object.values(pokemon.ivs || {}).some(v => v > 0) || Object.values(pokemon.evs || {}).some(v => v > 0)) && (
            <>
              <Separator className="my-6" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StatDisplay title="IVs" stats={pokemon.ivs} />
                <StatDisplay title="EVs" stats={pokemon.evs} />
              </div>
            </>
          )}

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
