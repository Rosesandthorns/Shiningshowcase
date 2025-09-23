
export interface PokemonSprite {
  default: string;
  shiny: string;
}

export interface Pokemon {
  id: number;
  name: string; // Was nickname in user's data, used as primary display name
  pokedexNumber: number; // The actual Pokedex number like 475
  speciesName: string; // The species name like "Gallade"
  speciesDescription?: string; // Descriptive species like "Seed Pokémon" (optional)
  sprites: PokemonSprite;
  tags: string[];
  shinyViewed: boolean;
  height?: number; // in decimeters (e.g., 7 for 0.7m)
  weight?: number; // in hectograms (e.g., 69 for 6.9kg)
  types: string[];
  abilities: string[];
  description?: string;
  level?: string | number;
  nature?: string;
  moveset?: string[];
  isPlaceholder?: boolean;
  isShinyLocked?: boolean;
}

export interface PokedexEntry {
  pokedexNumber: number;
  speciesName: string;
  sprite: string;
  status: 'caught' | 'uncaught' | 'shiny-locked';
}
