
import Image from 'next/image';
import Link from 'next/link';
import type { Pokemon } from '@/types/pokemon';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShinySparkleIcon } from '@/components/icons/ShinySparkleIcon';
import { cn } from '@/lib/utils';
import React, { useEffect, useState, useRef } from 'react';
import { useOnScreen } from '@/hooks/useOnScreen';
import { usePokemon } from '@/contexts/PokemonContext';

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

const ShieldSVG = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-3zm0 2.18L19 6.23V11h-7V4.18zM5 6.23L10 4.18V11H5V6.23zm0 7.77h5v5.84C6.96 18.56 5 15.06 5 12v-2zm7 5.84V14h5v2c0 3.06-1.96 6.56-5 7.82z"/>
  </svg>
);


export function PokemonCard({ pokemon, displayFullDetail = false }: PokemonCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isVisible = useOnScreen(ref);
  const { showEvolutionLine, userId } = usePokemon();

  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (pokemon.isPlaceholder || pokemon.isShinyLocked) {
      e.preventDefault();
      return;
    }
    // Prevent link navigation to trigger context function
    e.preventDefault();
    showEvolutionLine(pokemon);
  };

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
  const hasBugTag = lowerCaseTags.includes('bug');
  const hasIceTag = lowerCaseTags.includes('ice');
  const hasSteelTag = lowerCaseTags.includes('steel');
  const hasRockTag = lowerCaseTags.includes('rock');
  const hasDarkTag = lowerCaseTags.includes('dark');

  const emberTypes = ['red', 'orange', 'yellow'];

  const animatedTagsCount = [
    hasWaterTag, hasFireTag, hasGrassTag, hasGhostTag, hasFairyTag, 
    hasNormalTag, hasFightingTag, hasPsychicTag, hasFlyingTag, 
    hasPoisonTag, hasElectricTag, hasDragonTag, hasBugTag, hasIceTag,
    hasRockTag, hasDarkTag
  ].filter(Boolean).length;

  const getAnimationDuration = (baseDuration: number) => {
    if (animatedTagsCount <= 1) return `${baseDuration}s`;
    const slowdownFactor = 0.2; 
    return `${baseDuration * (1 + slowdownFactor * (animatedTagsCount - 1))}s`;
  };

  const CardWrapper = ({ children }: { children: React.ReactNode }) => {
    if (pokemon.isPlaceholder || pokemon.isShinyLocked) {
        return <div className="block group h-full">{children}</div>;
    }
    return <Link href={`/pokemon/${pokemon.id}?user=${userId}`} onClick={(e) => { e.preventDefault(); }} className="block group h-full">{children}</Link>;
  };

  let imageToShow = pokemon.sprites.shiny;
  let imageFilters = 'none';

  if (pokemon.isPlaceholder) {
      imageToShow = pokemon.sprites.default;
      imageFilters = 'brightness(0) invert(0.1)';
  } else if (pokemon.isShinyLocked) {
      imageToShow = pokemon.sprites.default;
  }


  return (
    <CardWrapper>
        <div onClick={handleCardClick} className={cn("cursor-pointer h-full", (pokemon.isPlaceholder || pokemon.isShinyLocked) && "cursor-not-allowed")}>
      <Card ref={ref} className={cn(
        "h-full overflow-hidden transition-all duration-200 ease-in-out flex flex-col relative",
        !pokemon.isPlaceholder && !pokemon.isShinyLocked && "group-hover:scale-105 group-hover:shadow-xl hover:border-primary group-hover:z-20",
        hasFavouriteTag && !pokemon.isPlaceholder && !pokemon.isShinyLocked && "animate-shimmer",
        pokemon.isShinyLocked && "border-yellow-500 bg-yellow-300/20"
      )}>
        {isVisible && hasSteelTag && !pokemon.isPlaceholder && (
          <div className="card-shield-backdrop">
            <ShieldSVG />
          </div>
        )}
        <CardHeader className="p-4 relative z-10">
          <div className="flex justify-between items-start">
            <CardTitle className="text-xl font-headline">{pokemon.name}</CardTitle>
            {!pokemon.isPlaceholder && <ShinySparkleIcon viewed={pokemon.shinyViewed} isShinyLocked={!!pokemon.isShinyLocked} />}
          </div>
          <CardDescription className="text-sm">{pokemon.speciesName} (#{pokemon.pokedexNumber})</CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0 flex flex-col items-center flex-grow relative z-10">
          <div className="relative w-32 h-32 mb-3 z-10"> 
            <Image
              src={imageToShow} 
              alt={`${pokemon.name} shiny sprite`}
              fill
              style={{ objectFit: 'contain', filter: imageFilters }}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              data-ai-hint={`${pokemon.speciesName} shiny sprite`}
            />
          </div>
          {displayFullDetail && pokemon.description && (
            <p className="text-xs text-muted-foreground mb-2 text-center">{pokemon.description}</p>
          )}
          {displayFullDetail && !pokemon.isPlaceholder && (
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

        {isVisible && !pokemon.isPlaceholder && !pokemon.isShinyLocked && (hasWaterTag || hasFireTag || hasGrassTag || hasGhostTag || hasFairyTag || hasNormalTag || hasFightingTag || hasPsychicTag || hasFlyingTag || hasPoisonTag || hasElectricTag || hasDragonTag || hasBugTag || hasIceTag || hasRockTag || hasDarkTag) && (
          <div className="particle-container">
            {hasWaterTag && Array.from({ length: 3 }).map((_, i) => (
              <div key={`water-${pokemon.id}-${i}`} className="particle-water-drop" style={{ left: `${20 + i * 25}%`, animationDelay: `${i * 0.5}s`, animationDuration: getAnimationDuration(3) }} />
            ))}
            {hasFireTag && Array.from({ length: 4 }).map((_, i) => {
              const emberColor = emberTypes[Math.floor(Math.random() * emberTypes.length)];
              const baseDurations = { red: 2.5, orange: 2.8, yellow: 2.2 };
              return <div key={`fire-${pokemon.id}-${i}`} className={`particle-ember-${emberColor}`} style={{ left: `${15 + i * 20}%`, bottom: `${10 + Math.random()*10}%`, animationDelay: `${i * 0.3}s`, animationDuration: getAnimationDuration(baseDurations[emberColor]) }} />
            })}
            {hasGrassTag && Array.from({ length: 3 }).map((_, i) => (
              <div key={`grass-${pokemon.id}-${i}`} className="particle-leaf" style={{ left: `${25 + i * 20}%`, animationDelay: `${i * 0.6}s`, transformOrigin: 'bottom left', animationDuration: getAnimationDuration(4) }} />
            ))}
            {hasGhostTag && Array.from({length: 2}).map((_,i) => (
              <div key={`ghost-${pokemon.id}-${i}`} className="particle-ghost-wisp" style={{ top: `${20 + i*30}%`, left: `${10 + i*60}%`, animationDelay: `${i*0.7}s`, animationDuration: getAnimationDuration(5) }} />
            ))}
            {hasFairyTag && Array.from({ length: 4 }).map((_, i) => (
                <div key={`fairy-${pokemon.id}-${i}`} className="particle-fairy-dust" style={{ bottom: `${5 + Math.random()*15 + i*5}%`, left: `${10 + i * 22 + Math.random()*10}%`, animationDelay: `${i * 0.4 + Math.random() * 0.5}s`, animationDuration: getAnimationDuration(3.5) }} />
            ))}
            {hasNormalTag && (
              <div className="particle-normal-light" style={{ top: '10%', right: '10%', animationDelay: `${Math.random() * 1}s`, animationDuration: getAnimationDuration(3) }} />
            )}
            {hasFightingTag && (
              <>
                <div className="particle-fighting-fist" style={{ position: 'absolute', left: '5%', top: '40%', animationDelay: '0s', animationDuration: getAnimationDuration(1) }}><FightingFistSVG/></div>
                <div className="particle-fighting-fist" style={{ position: 'absolute', right: '5%', top: '40%', animationDelay: '0.2s', animationDuration: getAnimationDuration(1) }}><FightingFistSVG/></div>
              </>
            )}
            {hasPsychicTag && !hasFightingTag && ( 
              <>
                <div className="particle-psychic-spoon" style={{ position: 'absolute', left: '10%', bottom: '20%', animationDelay: '0s', animationDuration: getAnimationDuration(3) }}><PsychicSpoonSVG/></div>
                <div className="particle-psychic-spoon" style={{ position: 'absolute', right: '10%', bottom: '25%', animationDelay: '0.3s', animationDuration: getAnimationDuration(3) }}><PsychicSpoonSVG/></div>
              </>
            )}
            {hasFlyingTag && Array.from({length: 3}).map((_,i) => (
               <div key={`fly-${pokemon.id}-${i}`} className="particle-flying-wind" style={{ top: `${30 + i*15}%`, animationDelay: `${i*0.4}s`, animationDuration: getAnimationDuration(2) }} />
            ))}
            {hasPoisonTag && Array.from({length: 3}).map((_,i) => (
              <div key={`poison-${pokemon.id}-${i}`} className="particle-poison-drop" style={{ left: `${20 + i * 25}%`, animationDelay: `${i * 0.6}s`, animationDuration: getAnimationDuration(3.5) }} />
            ))}
            {hasElectricTag && Array.from({length: 5}).map((_,i) => (
              <div key={`elec-${pokemon.id}-${i}`} className="particle-electric-spark" style={{ top: `${Math.random()*80 + 10}%`, left: `${Math.random()*80 + 10}%`, animationDelay: `${i*0.1}s`, animationDuration: getAnimationDuration(0.5) }} />
            ))}
            {hasDragonTag && (
              <div className="particle-dragon-tail" style={{ position: 'absolute', right: '5%', bottom: '5%', transformOrigin: 'top left', animationDelay: '0s', animationDuration: getAnimationDuration(3) }}><DragonTailSVG /></div>
            )}
            {hasBugTag && Array.from({ length: 1 }).map((_, i) => ( 
              <div key={`bug-${pokemon.id}-${i}`} className="particle-bug-fly" style={{ top: `${20 + Math.random() * 60}%`, left: `${10 + Math.random() * 70}%`, animationDelay: `${i * 1.5}s`, animationDuration: getAnimationDuration(4) }} />
            ))}
            {hasIceTag && Array.from({ length: 5 }).map((_, i) => (
              <div key={`ice-${pokemon.id}-${i}`} className="particle-ice-snowflake" style={{ left: `${10 + Math.random() * 80}%`, animationDelay: `${i * 0.4 + Math.random() * 0.5}s`, animationDuration: getAnimationDuration(8) }}>❄</div>
            ))}
            {hasRockTag && Array.from({ length: 4 }).map((_, i) => (
              <div key={`rock-${pokemon.id}-${i}`} className="particle-rock-pebble" style={{ left: `${15 + i * 20 + Math.random() * 10}%`, animationDelay: `${i * 0.4}s`, animationDuration: getAnimationDuration(3) }} />
            ))}
            {hasDarkTag && Array.from({length: 2}).map((_,i) => (
              <div key={`dark-${pokemon.id}-${i}`} className="particle-dark-wisp" style={{ top: `${30 + i*20}%`, left: `${15 + i*50}%`, animationDelay: `${i*0.8}s`, animationDuration: getAnimationDuration(6) }} />
            ))}
          </div>
        )}
      </Card>
      </div>
    </CardWrapper>
  );
}
