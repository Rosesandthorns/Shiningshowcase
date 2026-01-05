'use client';

import type { PokedexEntry } from '@/types/pokemon';
import Image from 'next/image';

interface BingoBoardProps {
    board: PokedexEntry[];
}

export function BingoBoard({ board }: BingoBoardProps) {
    return (
        <div className="grid grid-cols-5 gap-4">
            {board.map(pokemon => (
                <div key={pokemon.pokedexNumber} className="border rounded-lg p-4 flex flex-col items-center">
                    <Image src={pokemon.sprite} alt={pokemon.speciesName} width={96} height={96} />
                    <p className="mt-2 text-center">{pokemon.speciesName}</p>
                </div>
            ))}
        </div>
    );
}
