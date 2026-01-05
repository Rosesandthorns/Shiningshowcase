import type { Pokemon, PokedexEntry } from '@/types/pokemon';
import type { UserProfile } from '@/types/user';
import { shinyLockedPokemon, getPokemonByGame, getPokemonDetails } from './pokemonApi';
import { doc, setDoc, getDoc, type Firestore } from 'firebase/firestore';
import { starters, legendaries, mythics } from './pokemon-categories';

export const easyGames = ['Sword & Shield', 'Scarlet & Violet', 'Legends: Arceus', 'Legends: ZA', 'Ultra Sun & Ultra Moon', 'Sun & Moon'];
export const hardGames = ['Sword & Shield', 'Brilliant Diamond & Shining Pearl', "Let's Go, Pikachu & Eevee", 'Ultra Sun & Ultra Moon', 'Sun & Moon', 'Omega Ruby & Alpha Sapphire', 'X & Y', 'Black 2 & White 2', 'Black & White', 'HeartGold & SoulSilver', 'Diamond, Pearl & Platinum', 'FireRed & LeafGreen', 'Ruby, Sapphire & Emerald', 'Gold, Silver & Crystal', 'Red, Blue & Yellow'];

export async function generateBingoCard(ownedGames: string[], shinyPokemon: Pokemon[], allPokemon: PokedexEntry[]) {
    const ownedEasyGames = ownedGames.filter(g => easyGames.includes(g));
    const ownedHardGames = ownedGames.filter(g => hardGames.includes(g));

    const [easyGamePokemon, hardGamePokemon] = await Promise.all([
        Promise.all(ownedEasyGames.map(g => getPokemonByGame(g))).then(res => res.flat()),
        Promise.all(ownedHardGames.map(g => getPokemonByGame(g))).then(res => res.flat()),
    ]);

    const shinyPokemonNames = shinyPokemon.map(p => p.speciesName.toLowerCase());

    const easyPokemon = allPokemon.filter(p => {
        const name = p.speciesName.toLowerCase();
        return !starters.includes(name) && !mythics.includes(name) &&
            easyGamePokemon.includes(name) && !shinyPokemonNames.includes(name);
    });

    const hardPokemon = allPokemon.filter(p => {
        const name = p.speciesName.toLowerCase();
        return (starters.includes(name) || legendaries.includes(name)) &&
            hardGamePokemon.includes(name) && !shinyPokemonNames.includes(name) && !shinyLockedPokemon.includes(name);
    });

    const selectedEasy = easyPokemon.sort(() => 0.5 - Math.random()).slice(0, 15);
    const selectedHard = hardPokemon.sort(() => 0.5 - Math.random()).slice(0, 10);

    const bingoBoard = [...selectedEasy, ...selectedHard].sort(() => 0.5 - Math.random());

    return bingoBoard;
}

export async function saveBingoCard(firestore: Firestore, userId: string, bingoCard: PokedexEntry[]) {
    const bingoRef = doc(firestore, 'users', userId, 'bingo', '2026');
    await setDoc(bingoRef, { bingoCard });
}

export async function getBingoCard(firestore: Firestore, userId: string): Promise<PokedexEntry[] | null> {
    const bingoRef = doc(firestore, 'users', userId, 'bingo', '2026');
    const docSnap = await getDoc(bingoRef);

    if (docSnap.exists()) {
        return docSnap.data().bingoCard;
    } else {
        return null;
    }
}
