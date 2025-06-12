import type { Pokemon } from '@/types/pokemon';

export const mockPokemonData: Pokemon[] = [
  {
    id: 1,
    name: 'Bulbasaur',
    species: 'Seed Pokémon',
    sprites: {
      default: 'https://placehold.co/96x96.png',
      shiny: 'https://placehold.co/96x96.png',
    },
    tags: ['Kanto', 'Starter', 'Grass', 'Poison'],
    shinyViewed: false,
    height: 7, // 0.7m
    weight: 69, // 6.9kg
    types: ['Grass', 'Poison'],
    abilities: ['Overgrow', 'Chlorophyll'],
  },
  {
    id: 4,
    name: 'Charmander',
    species: 'Lizard Pokémon',
    sprites: {
      default: 'https://placehold.co/96x96.png',
      shiny: 'https://placehold.co/96x96.png',
    },
    tags: ['Kanto', 'Starter', 'Fire'],
    shinyViewed: true,
    height: 6, // 0.6m
    weight: 85, // 8.5kg
    types: ['Fire'],
    abilities: ['Blaze', 'Solar Power'],
  },
  {
    id: 7,
    name: 'Squirtle',
    species: 'Tiny Turtle Pokémon',
    sprites: {
      default: 'https://placehold.co/96x96.png',
      shiny: 'https://placehold.co/96x96.png',
    },
    tags: ['Kanto', 'Starter', 'Water'],
    shinyViewed: false,
    height: 5, // 0.5m
    weight: 90, // 9.0kg
    types: ['Water'],
    abilities: ['Torrent', 'Rain Dish'],
  },
  {
    id: 25,
    name: 'Pikachu',
    species: 'Mouse Pokémon',
    sprites: {
      default: 'https://placehold.co/96x96.png',
      shiny: 'https://placehold.co/96x96.png',
    },
    tags: ['Kanto', 'Electric', 'Popular'],
    shinyViewed: false,
    height: 4, // 0.4m
    weight: 60, // 6.0kg
    types: ['Electric'],
    abilities: ['Static', 'Lightning Rod'],
  },
  {
    id: 133,
    name: 'Eevee',
    species: 'Evolution Pokémon',
    sprites: {
      default: 'https://placehold.co/96x96.png',
      shiny: 'https://placehold.co/96x96.png',
    },
    tags: ['Kanto', 'Normal', 'Popular'],
    shinyViewed: true,
    height: 3, // 0.3m
    weight: 65, // 6.5kg
    types: ['Normal'],
    abilities: ['Run Away', 'Adaptability', 'Anticipation'],
  },
];
