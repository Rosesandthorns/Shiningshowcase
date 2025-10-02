
'use client';
import { AnalyticsDashboardClient } from '@/components/client/AnalyticsDashboardClient';
import { getAllPokemon } from '@/lib/pokemonApi';
import type { Pokemon } from '@/types/pokemon';
import { useEffect, useState } from 'react';

// Define Pokedex number ranges for each generation
const generationRanges: Record<string, { start: number; end: number, total: number }> = {
    Kanto: { start: 1, end: 151, total: 151 },
    Johto: { start: 152, end: 251, total: 100 },
    Hoenn: { start: 252, end: 386, total: 135 },
    Sinnoh: { start: 387, end: 493, total: 107 },
    Unova: { start: 494, end: 649, total: 156 },
    Kalos: { start: 650, end: 721, total: 72 },
    Alola: { start: 722, end: 809, total: 88 },
    Galar: { start: 810, end: 905, total: 96 },
    Paldea: { start: 906, end: 1025, total: 120 },
};

function calculateAnalytics(allPokemon: Pokemon[]) {
    // Type Frequency
    const typeCounts = allPokemon.flatMap(p => p.types).reduce((acc, type) => {
        if (type === 'Unknown') return acc;
        acc[type] = (acc[type] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const sortedTypes = Object.entries(typeCounts).sort(([, a], [, b]) => b - a);
    const mostCommonType = sortedTypes[0] ? sortedTypes[0][0] : 'N/A';
    const rarestType = sortedTypes.length > 0 ? sortedTypes[sortedTypes.length - 1][0] : 'N/A';

    // Game of Origin
    const originTags = ['SV', 'PLA', 'SwSh', 'PoGo', 'LGPE'];
    const gameCounts = allPokemon.flatMap(p => p.tags)
        .filter(tag => originTags.includes(tag))
        .reduce((acc, game) => {
            acc[game] = (acc[game] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
    const rarestGame = Object.entries(gameCounts).sort(([, a], [, b]) => a - b)[0]?.[0] || 'N/A';
    
    // Alpha Shinies
    const alphaCount = allPokemon.filter(p => p.tags.map(t => t.toLowerCase()).includes('alpha')).length;

    // Gen-Specific Dex
    const uniquePokemonByPokedexNumber = [...new Map(allPokemon.map(p => [p.pokedexNumber, p])).values()];
    const genCompletion = Object.entries(generationRanges).map(([gen, range]) => {
        const caughtInGen = uniquePokemonByPokedexNumber.filter(p => p.pokedexNumber >= range.start && p.pokedexNumber <= range.end).length;
        return {
            name: gen,
            caught: caughtInGen,
            total: range.total,
            percentage: (caughtInGen / range.total) * 100,
        };
    });

    // Legendary/Mythical Count
    const legendaryMythicalCount = allPokemon.filter(p => {
        const lowerTags = p.tags.map(t => t.toLowerCase());
        return lowerTags.includes('legendary') || lowerTags.includes('mythical');
    }).length;

    // National Dex Completion
    const totalPossiblePokemon = 987;
    const uniqueShinyPokemonCount = new Set(allPokemon.map(p => p.pokedexNumber)).size;
    const nationalDexCompletion = (uniqueShinyPokemonCount / totalPossiblePokemon) * 100;
    
    // Remaining Shinies
    const remainingShinies = totalPossiblePokemon - uniqueShinyPokemonCount;

    // Duplicates
    const speciesCounts = allPokemon.reduce((acc, p) => {
        acc[p.speciesName] = (acc[p.speciesName] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
    const duplicateList = Object.entries(speciesCounts).filter(([, count]) => count > 1);
    const totalDuplicates = duplicateList.reduce((sum, [, count]) => sum + (count - 1), 0);
    const mostCommonDuplicate = duplicateList.sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A';

    // Averages
    const pokemonWithLevels = allPokemon.filter(p => typeof p.level === 'number' || (typeof p.level === 'string' && !isNaN(parseInt(p.level))));
    const totalLevel = pokemonWithLevels.reduce((sum, p) => sum + parseInt(p.level!.toString(), 10), 0);
    const averageLevel = pokemonWithLevels.length > 0 ? totalLevel / pokemonWithLevels.length : 0;
    const totalMoves = allPokemon.reduce((sum, p) => sum + (p.moveset?.length || 0), 0);
    const averageMoves = allPokemon.length > 0 ? totalMoves / allPokemon.length : 0;

    return {
        mostCommonType,
        rarestType,
        typeChartData: sortedTypes.map(([name, value]) => ({ name, value })).slice(0, 8),
        rarestGame,
        alphaCount,
        genCompletion,
        legendaryMythicalCount,
        nationalDexCompletion,
        evolutionLineCompletion: 0, // Placeholder
        remainingShinies,
        duplicateShinies: totalDuplicates,
        mostCommonDuplicate,
        averageLevel,
        averageMoves,
    };
}

export function AnalyticsTab() {
    const [analyticsData, setAnalyticsData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const allPokemon = await getAllPokemon();
                const data = calculateAnalytics(allPokemon);
                setAnalyticsData(data);
            } catch (error) {
                console.error("Failed to calculate analytics", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    if (loading) {
        return (
            <main className="flex-1 container mx-auto p-4 md:p-6 flex justify-center items-center">
                 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </main>
        );
    }

    return (
        <main className="flex-1 container mx-auto p-4 md:p-6">
            <div className="mb-8 text-center">
                <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl font-headline bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent-foreground">
                    Analytics Dashboard
                </h1>
                <p className="mt-2 text-lg text-muted-foreground">
                    A deep dive into your shiny collection.
                </p>
            </div>
            {analyticsData && <AnalyticsDashboardClient initialData={analyticsData} />}
        </main>
    );
}
