
"use client";

import type { Pokemon } from "@/types/pokemon";
import { usePokemon } from "@/contexts/PokemonContext";
import { PokemonCard } from "./PokemonCard";
import { Button } from "./ui/button";
import { ArrowLeft } from "lucide-react";

interface EvolutionLineViewProps {
    evolutionLine: Pokemon[];
}

export function EvolutionLineView({ evolutionLine }: EvolutionLineViewProps) {
    const { clearEvolutionLine } = usePokemon();

    return (
        <section className="my-8">
            <Button variant="outline" onClick={clearEvolutionLine} className="mb-6">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Full List
            </Button>
            <h2 className="text-2xl font-bold mb-6 text-center font-headline">
                Evolution Line
            </h2>
            <div className="flex justify-center overflow-x-auto gap-6 pb-4">
                {evolutionLine.map((pokemon, index) => (
                    <div key={pokemon.isPlaceholder ? `${pokemon.pokedexNumber}-${index}` : pokemon.id} className="w-64 flex-shrink-0">
                        <PokemonCard pokemon={pokemon} />
                    </div>
                ))}
            </div>
        </section>
    );
}
