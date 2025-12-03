
export interface PokemonSprite {
  default: string;
  shiny: string;
}

export interface StatsSet {
  hp: number;
  attack: number;
  defense: number;
  spAttack: number;
  spDefense: number;
  speed: number;
}

export interface Pokemon {
  id: string; // Firestore document ID
  userId: string;
  name: string;
  pokedexNumber: number;
  speciesName: string;
  sprites: PokemonSprite;
  tags: string[];
  shinyViewed: boolean;
  height?: number;
  weight?: number;
  types: string[];
  abilities: string[];
  description?: string;
  level?: string | number;
  nature?: string;
  moveset?: string[];
  isPlaceholder?: boolean;
  isShinyLocked?: boolean;
  ball?: string;
  ivs?: StatsSet;
  evs?: StatsSet;
  gender?: 'male' | 'female' | 'genderless';
  form?: string;
  gameOrigin?: string;
  encounters?: number;
  caughtAt?: number;
}

export interface PokedexEntry {
  pokedexNumber: number;
  speciesName: string;
  sprite: string;
  status: 'caught' | 'uncaught' | 'shiny-locked';
}
