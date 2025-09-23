
"use client";

import Image from 'next/image';
import { usePokemon } from '@/contexts/PokemonContext';
import { cn } from '@/lib/utils';
import type { PokedexEntry } from '@/types/pokemon';
import { useOnScreen } from '@/hooks/useOnScreen';
import { useRef } from 'react';

interface PokedexEntryCardProps {
    entry: PokedexEntry;
}

export function PokedexEntryCard({ entry }: PokedexEntryCardProps) {
    const { showEvolutionLine } = usePokemon();
    const ref = useRef<HTMLDivElement>(null);
    const isVisible = useOnScreen(ref);

    const isClickable = entry.status !== 'shiny-locked';

    const handleClick = () => {
        if (!isClickable) return;
        
        // We need to create a temporary Pokemon object to pass to showEvolutionLine
        const tempPokemon = {
            id: entry.pokedexNumber, // Using pokedex number as a unique-ish ID
            name: entry.speciesName,
            pokedexNumber: entry.pokedexNumber,
            speciesName: entry.speciesName,
            sprites: {
                default: entry.sprite,
                shiny: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${entry.pokedexNumber}.png`,
            },
            tags: [],
            shinyViewed: false,
            types: [],
            abilities: [],
        };
        showEvolutionLine(tempPokemon as any);
    };

    let spriteUrl = entry.sprite;
    let imageFilter = 'none';

    if (entry.status === 'uncaught') {
        imageFilter = 'brightness(0)';
    } else if (entry.status === 'caught') {
        // Construct shiny sprite URL. Note: This might not be accurate for all forms.
        spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${entry.pokedexNumber}.png`;
    }

    return (
        <div
            ref={ref}
            onClick={handleClick}
            className={cn(
                "relative flex flex-col items-center justify-center p-1 border rounded-md aspect-square transition-colors",
                isClickable && "cursor-pointer hover:bg-accent hover:border-primary",
                entry.status === 'shiny-locked' ? 'bg-yellow-300/20 border-yellow-500' : 'bg-card',
                entry.status === 'uncaught' ? 'bg-secondary/50' : ''
            )}
            title={`#${entry.pokedexNumber} ${entry.speciesName}`}
        >
            {isVisible && (
                <div className="relative w-full h-full">
                     <Image
                        src={spriteUrl}
                        alt={entry.speciesName}
                        fill
                        sizes="100px"
                        style={{ objectFit: 'contain', filter: imageFilter }}
                        className="transition-opacity opacity-0 duration-500"
                        onLoadingComplete={(image) => image.classList.remove('opacity-0')}
                        unoptimized={true} // Sprites are small, skip Next.js optimization
                    />
                </div>
            )}
            <span className="absolute bottom-0 right-1 text-[8px] font-mono text-muted-foreground">
                {entry.pokedexNumber}
            </span>
        </div>
    );
}
