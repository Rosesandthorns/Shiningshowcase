
import Image from 'next/image';
import Link from 'next/link';
import type { Pokemon } from '@/types/pokemon';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShinySparkleIcon } from '@/components/icons/ShinySparkleIcon';
import { cn } from '@/lib/utils';
import React, { useEffect, useState } from 'react';

interface PokemonCardProps {
  pokemon: Pokemon;
  displayFullDetail?: boolean; 
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


const FightingFistSVG = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M18.5 11.02A4.522 4.522 0 0 0 17 8.5V7a1 1 0 0 0-1-1H7.618A4.002 4.002 0 0 0 4 9.618V12a1 1 0 0 0 1 1h.5v.896A4.497 4.497 0 0 0 10 18.372V20a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-1.5h.5a1 1 0 0 0 1-1v-3.98a4.506 4.506 0 0 0 3-3.998c.002 0 .002 0 .002-.002zM6 12v-.882a2 2 0 0 1 2-2h1v3H7a1 1 0 0 1-1-1zm10.5 4.5a2.5 2.5 0 0 1-5 0V13h1.5v1a1 1 0 1 0 2 0v-1H17v.5a2.503 2.503 0 0 1-2.5 2.5z"/>
  </svg>
);

const PsychicSpoonSVG = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M12.5 2C8.91 2 6 4.91 6 8.5c0 2.476.666 3.802 2.074 5.44.728.847 1.445 1.713 1.424 3.06H9c-.552 0-1 .448-1 1s.448 1 1 1h6c.552 0 1-.448 1-1s-.448-1-1-1h-.498c-.021-1.347.696-2.213 1.424-3.06C17.334 12.302 18 10.976 18 8.5 18 4.91 15.09 2 12.5 2zM12.5 4c1.93 0 3.5 2.019 3.5 4.5S14.43 13 12.5 13s-3.5-2.019-3.5-4.5S10.57 4 12.5 4z"/>
  </svg>
);

const DragonTailSVG = () => (
 <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <path d="M85,50 Q65,80 50,70 T20,75 Q30,50 50,30 T80,20 Q70,40 85,50 Z" />
  </svg>
);


export function PokemonCard({ pokemon, displayFullDetail = false }: PokemonCardProps) {
  const [clientRendered, setClientRendered] = useState(false);
  useEffect(() => {
    setClientRendered(true);
  }, []);

  const lowerCaseTags = pokemon.tags.map(t => t.toLowerCase());
  const hasFavouriteTag = lowerCaseTags.includes('favourite');
  const hasWaterTag = lowerCaseTags.includes('water');
  const hasFireTag = lowerCaseTags.includes('fire');
  const hasGrassTag = lowerCaseTags.includes('grass');
  const hasGhostTag = lowerCaseTags.includes('ghost');
  const hasFairyTag = lowerCaseTags.includes('fairy');
  const hasNormalTag = lowerCaseTags.includes('normal');
  const hasFightingTag = lowerCaseTags.includes('fighting');
  const hasPsychicTag = lowerCaseTags.includes('psychic');
  const hasFlyingTag = lowerCaseTags.includes('flying');
  const hasPoisonTag = lowerCaseTags.includes('poison');
  const hasElectricTag = lowerCaseTags.includes('electric');
  const hasDragonTag = lowerCaseTags.includes('dragon');

  const emberTypes = ['red', 'orange', 'yellow'];

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

        {clientRendered && (hasWaterTag || hasFireTag || hasGrassTag || hasGhostTag || hasFairyTag || hasNormalTag || hasFightingTag || hasPsychicTag || hasFlyingTag || hasPoisonTag || hasElectricTag || hasDragonTag) && (
          <div className="particle-container">
            {hasWaterTag && Array.from({ length: 3 }).map((_, i) => (
              <div key={`water-${pokemon.id}-${i}`} className="particle-water-drop" style={{ left: `${20 + i * 25}%`, animationDelay: `${i * 0.5}s` }} />
            ))}
            {hasFireTag && Array.from({ length: 4 }).map((_, i) => {
              const emberColor = emberTypes[Math.floor(Math.random() * emberTypes.length)];
              return <div key={`fire-${pokemon.id}-${i}`} className={`particle-ember-${emberColor}`} style={{ left: `${15 + i * 20}%`, bottom: `${10 + Math.random()*10}%`, animationDelay: `${i * 0.3}s` }} />
            })}
            {hasGrassTag && Array.from({ length: 3 }).map((_, i) => (
              <div key={`grass-${pokemon.id}-${i}`} className="particle-leaf" style={{ left: `${25 + i * 20}%`, animationDelay: `${i * 0.6}s`, transformOrigin: 'bottom left' }} />
            ))}
            {hasGhostTag && Array.from({length: 2}).map((_,i) => (
              <div key={`ghost-${pokemon.id}-${i}`} className="particle-ghost-wisp" style={{ top: `${20 + i*30}%`, left: `${10 + i*60}%`, animationDelay: `${i*0.7}s`}} />
            ))}
            {hasFairyTag && (
              <div className="particle-fairy-swirl" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', animationDelay: `${Math.random() * 0.5}s` }} />
            )}
            {hasNormalTag && (
              <div className="particle-normal-light" style={{ top: '10%', right: '10%', animationDelay: `${Math.random() * 1}s` }} />
            )}
            {hasFightingTag && (
              <>
                <div className="particle-fighting-fist" style={{ position: 'absolute', left: '5%', top: '40%', animationDelay: '0s' }}><FightingFistSVG/></div>
                <div className="particle-fighting-fist" style={{ position: 'absolute', right: '5%', top: '40%', animationDelay: '0.2s' }}><FightingFistSVG/></div>
              </>
            )}
            {hasPsychicTag && !hasFightingTag && ( // Avoid overlap if both, though unlikely for a single mon
              <>
                <div className="particle-psychic-spoon" style={{ position: 'absolute', left: '10%', bottom: '20%', animationDelay: '0s' }}><PsychicSpoonSVG/></div>
                <div className="particle-psychic-spoon" style={{ position: 'absolute', right: '10%', bottom: '25%', animationDelay: '0.3s' }}><PsychicSpoonSVG/></div>
              </>
            )}
            {hasFlyingTag && Array.from({length: 3}).map((_,i) => (
               <div key={`fly-${pokemon.id}-${i}`} className="particle-flying-wind" style={{ top: `${30 + i*15}%`, animationDelay: `${i*0.4}s` }} />
            ))}
            {hasPoisonTag && Array.from({length: 3}).map((_,i) => (
              <div key={`poison-${pokemon.id}-${i}`} className="particle-poison-drop" style={{ left: `${20 + i * 25}%`, animationDelay: `${i * 0.6}s` }} />
            ))}
            {hasElectricTag && Array.from({length: 5}).map((_,i) => (
              <div key={`elec-${pokemon.id}-${i}`} className="particle-electric-spark" style={{ top: `${Math.random()*80 + 10}%`, left: `${Math.random()*80 + 10}%`, animationDelay: `${i*0.1}s` }} />
            ))}
            {hasDragonTag && (
              <div className="particle-dragon-tail" style={{ position: 'absolute', right: '5%', bottom: '5%', transformOrigin: 'top left', animationDelay: '0s' }}><DragonTailSVG /></div>
            )}
          </div>
        )}
      </Card>
    </Link>
  );
}
    
