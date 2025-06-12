export interface PokemonSprite {
  default: string;
  shiny: string;
}

export interface Pokemon {
  id: number;
  name: string;
  species: string;
  sprites: PokemonSprite;
  tags: string[];
  shinyViewed: boolean;
  height: number;
  weight: number;
  types: string[];
  abilities: string[];
}
