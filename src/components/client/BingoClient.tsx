'use client';

import { useState, useEffect } from 'react';
import type { User } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { games } from '@/lib/pokemon-data';
import { generateBingoCard, saveBingoCard, getBingoCard } from '@/lib/bingo';
import { getAllPokemon } from '@/lib/pokemon';
import { BingoBoard } from './BingoBoard';
import { getNationalPokedex } from '@/lib/pokemonApi';

interface BingoClientProps {
    user: User;
    firestore: Firestore;
}

import { PokedexEntry } from '@/types/pokemon';

export function BingoClient({ user, firestore }: BingoClientProps) {
    const [ownedGames, setOwnedGames] = useState<string[]>([]);
    const [bingoCard, setBingoCard] = useState<any[] | null>(null);
    const [nationalPokedex, setNationalPokedex] = useState<PokedexEntry[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchPokedex = async () => {
            const pokedex = await getNationalPokedex();
            setNationalPokedex(pokedex);
        };
        fetchPokedex();
    }, []);

    useEffect(() => {
        const fetchBingoCard = async () => {
            const card = await getBingoCard(firestore, user.uid);
            if (card) {
                setBingoCard(card);
            }
        };
        fetchBingoCard();
    }, [firestore, user.uid]);

    const handleGenerateBingo = async () => {
        setIsLoading(true);
        const shinyPokemon = await getAllPokemon(firestore, user.uid);
        const newBingoCard = await generateBingoCard(ownedGames, shinyPokemon, nationalPokedex);
        await saveBingoCard(firestore, user.uid, newBingoCard);
        setBingoCard(newBingoCard);
        setIsLoading(false);
    };

    return (
        <div>
            {!bingoCard && (
                <div>
                    <h2 className="text-2xl font-bold">Select Your Owned Games</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                        {games.map(game => (
                            <div key={game} className="flex items-center space-x-2">
                                <Checkbox
                                    id={game}
                                    checked={ownedGames.includes(game)}
                                    onCheckedChange={(checked) => {
                                        if (checked) {
                                            setOwnedGames([...ownedGames, game]);
                                        } else {
                                            setOwnedGames(ownedGames.filter(g => g !== game));
                                        }
                                    }}
                                />
                                <Label htmlFor={game}>{game}</Label>
                            </div>
                        ))}
                    </div>
                    <Button onClick={handleGenerateBingo} className="mt-6" disabled={isLoading || bingoCard !== null}>
                        {isLoading ? 'Generating...' : 'Generate Bingo Card'}
                    </Button>
                </div>
            )}
            {bingoCard && (
                <div>
                    <h2 className="text-2xl font-bold text-center mb-4">2026 Shining Showcase Bingo</h2>
                    <BingoBoard board={bingoCard} />
                </div>
            )}
        </div>
    );
}
