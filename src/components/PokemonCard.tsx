
import Image from 'next/image';
import Link from 'next/link';
import type { Pokemon } from '@/types/pokemon';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShinySparkleIcon } from '@/components/icons/ShinySparkleIcon';
import { cn } from '@/lib/utils';

interface PokemonCardProps {
  pokemon: Pokemon;
  displayFullDetail?: boolean; // To show more info like in featured section
}

const getTagSpecificClasses = (tag: string): string => {
  const normalizedTag = tag.toLowerCase().replace(/\s+/g, '-');
  let bgColorClass = `bg-tag-${normalizedTag}`;
  let textColorClass = 'tag-text-default'; // Default to white text

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


export function PokemonCard({ pokemon, displayFullDetail = false }: PokemonCardProps) {
  const hasFavouriteTag = pokemon.tags.some(tag => tag.toLowerCase() === 'favourite');
  const hasWaterTag = pokemon.tags.some(tag => tag.toLowerCase() === 'water');
  const hasFireTag = pokemon.tags.some(tag => tag.toLowerCase() === 'fire');
  const hasGrassTag = pokemon.tags.some(tag => tag.toLowerCase() === 'grass');

  return (
    <Link href={`/pokemon/${pokemon.id}`} className="block group h-full">
      <Card className={cn(
        "h-full overflow-hidden transition-all duration-200 ease-in-out group-hover:scale-105 group-hover:shadow-xl hover:border-primary flex flex-col relative",
        hasFavouriteTag && "animate-shimmer"
      )}>
        <CardHeader className="p-4 relative z-10">
          <div className="flex justify-between items-start">
            <CardTitle className="text-xl font-headline">{pokemon.name}</CardTitle>
            <ShinySparkleIcon viewed={pokemon.shinyViewed} />
          </div>
          <CardDescription className="text-sm">{pokemon.speciesName} (#{pokemon.pokedexNumber})</CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0 flex flex-col items-center flex-grow relative z-10">
          <div className="relative w-32 h-32 mb-3">
            <Image
              src={pokemon.sprites.shiny} 
              alt={`${pokemon.name} shiny sprite`}
              fill
              style={{ objectFit: 'contain' }}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              data-ai-hint={`${pokemon.speciesName} shiny sprite`}
            />
          </div>
          {displayFullDetail && pokemon.description && (
            <p className="text-xs text-muted-foreground mb-2 text-center">{pokemon.description}</p>
          )}
          {displayFullDetail && (
            <div className="text-xs text-muted-foreground mb-2 w-full">
              {pokemon.level && <p><strong>Level:</strong> {pokemon.level}</p>}
              {pokemon.nature && <p><strong>Nature:</strong> {pokemon.nature}</p>}
              {pokemon.moveset && pokemon.moveset.length > 0 && (
                <div>
                  <strong>Moves:</strong>
                  <ul className="list-disc list-inside">
                    {pokemon.moveset.map(move => <li key={move}>{move}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}
          <div className="flex flex-wrap gap-1 justify-center mt-auto pt-2">
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
        </CardContent>

        {(hasWaterTag || hasFireTag || hasGrassTag) && (
          <div className="particle-container">
            {hasWaterTag && Array.from({ length: 3 }).map((_, i) => (
              <div key={`water-${pokemon.id}-${i}`} className="particle-water-drop" style={{ left: `${20 + i * 25}%`, animationDelay: `${i * 0.5}s` }} />
            ))}
            {hasFireTag && Array.from({ length: 4 }).map((_, i) => (
              <div key={`fire-${pokemon.id}-${i}`} className="particle-ember" style={{ left: `${15 + i * 20}%`, bottom: `${10 + Math.random()*10}%`, animationDelay: `${i * 0.3}s` }} />
            ))}
            {hasGrassTag && Array.from({ length: 3 }).map((_, i) => (
              <div key={`grass-${pokemon.id}-${i}`} className="particle-leaf" style={{ left: `${25 + i * 20}%`, animationDelay: `${i * 0.6}s`, transformOrigin: 'bottom left' }} />
            ))}
          </div>
        )}
      </Card>
    </Link>
  );
}
    