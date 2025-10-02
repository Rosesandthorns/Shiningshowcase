
export interface Hunt {
    id: string;
    userId: string;
    pokemonName: string;
    pokemonSprite: string;
    game: string;
    method: string;
    odds: number;
    shinyCharm: boolean;
    encounters: number;
    timeElapsed: number; // in seconds
    isActive: boolean;
    createdAt: number; // timestamp
}
