import type { Pokemon } from '@/types/pokemon';

// Helper function to parse species string like "#475 - Gallade"
const parseSpeciesString = (speciesString: string): { pokedexNumber: number, speciesName: string } => {
  const match = speciesString.match(/#(\d+)\s*-\s*(.*)/);
  if (match) {
    return { pokedexNumber: parseInt(match[1], 10), speciesName: match[2].trim() };
  }
  return { pokedexNumber: 0, speciesName: speciesString }; // Fallback
};

// Helper to extract types from tags
const extractTypesFromTags = (tags: string[]): string[] => {
  const knownTypes = ["Normal", "Fire", "Water", "Grass", "Electric", "Ice", "Fighting", "Poison", "Ground", "Flying", "Psychic", "Bug", "Rock", "Ghost", "Dragon", "Dark", "Steel", "Fairy"];
  return tags.filter(tag => knownTypes.includes(tag));
};

// Transforming user's pokemonList to the new Pokemon[] structure
const userPokemonData = [
  { idUnique: 1, nickname: "Chop", species: "#475 - Gallade", description: "This is Chop, probably my most used pokemon ever. Chop was caught in SV and has been my false swiper ever since, and runs heal pulse, false swipe, hypnosis, and psychic, and has the abiltiy Sharpness to make false swipe stronger.", imageUrl: "https://static.wikia.nocookie.net/shiny-pokemon/images/2/2d/Gallade.png", tags: ["Favourite", "Fighting", "Psychic", "SV"], level: "?", nature: "?", moveset: ["Heal Pulse", "False Swipe", "Hypnosis", "Psychic"]},
  { idUnique: 2, nickname: "Chedder", species: "#0805 - Stakataka", description: "This Yellow Wall Was Caught In The SWSH DlC, after 55 encounters", imageUrl: "https://www.serebii.net/Shiny/SWSH/805.png", tags: ["Favourite", "Ultra Beast", "Rock", "Steel", "SwSh"], level: "?", nature: "?", moveset: [] },
  { idUnique: 3, nickname: "Moonlight", species: "#609 - Chandelure", description: "My first hunt getting back into shiny hunting after a 6 month break", imageUrl: "https://www.serebii.net/Shiny/SWSH/609.png", tags: ["Favourite", "Fire", "Ghost", "SV"], level: "?", nature: "?", moveset: [] },
  { idUnique: 4, nickname: "Jiggly", species: "#0039 - Jigglypuff", description: "I dont remember this one", imageUrl: "https://www.serebii.net/Shiny/SWSH/039.png", tags: ["Fairy", "Normal", "SV"], level: "?", nature: "?", moveset: [] },
  { idUnique: 5, nickname: "Aqua Antis", species: "#0055 - Golduck", description: "The Infamous Aqua Antis, Found in the SWSH DLC between my favourite shiny and my target", imageUrl: "https://www.serebii.net/Shiny/SWSH/055.png", tags: ["Water", "SwSh"], level: "?", nature: "?", moveset: [] },
  { idUnique: 6, nickname: "APE", species: "#0057 - Primeape", description: "This fighter was found in Paldea while looking for a Breloom", imageUrl: "https://www.serebii.net/Shiny/SWSH/057.png", tags: ["Fighting", "SV"], level: "?", nature: "?", moveset: [] },
  { idUnique: 7, nickname: "Anger", species: "#0057 - Primeape", description: "This warrior was found in Paldea while looking for a Breloom, right after APE", imageUrl: "https://www.serebii.net/Shiny/SWSH/057.png", tags: ["Fighting", "SV"], level: "?", nature: "?", moveset: [] },
  { idUnique: 8, nickname: "Fury", species: "#0058 - Growlithe", description: "This hotshot was found in Paldea", imageUrl: "https://www.serebii.net/Shiny/SWSH/058.png", tags: ["Fire", "SV"], level: "?", nature: "?", moveset: [] },
  { idUnique: 9, nickname: "Legend", species: "#0059 - Arcanine", description: "Fury's older brother, also found in Paldea", imageUrl: "https://www.serebii.net/Shiny/SWSH/059.png", tags: ["Fire", "SV"], level: "?", nature: "?", moveset: [] },
  { idUnique: 10, nickname: "Slow", species: "#0079 - Slowpoke", description: "This Simple Creature Was Caught In Paldea", imageUrl: "https://www.serebii.net/Shiny/SV/new/079.png", tags: ["Water", "Psychic", "SV"], level: "?", nature: "?", moveset: [] },
  // ... (Truncated for brevity - you would convert your full list here)
];

export const mockPokemonData: Pokemon[] = userPokemonData.map((pkm, index) => {
  const { pokedexNumber, speciesName } = parseSpeciesString(pkm.species);
  const types = extractTypesFromTags(pkm.tags);
  return {
    id: pkm.idUnique, // Using a unique ID for React keys, can be same as pokedexNumber if unique
    name: pkm.nickname,
    pokedexNumber,
    speciesName,
    // speciesDescription: "Unknown Pokémon", // You might want to add actual descriptions later
    sprites: {
      default: `https://placehold.co/96x96.png`, // Placeholder for default sprite
      shiny: pkm.imageUrl,
    },
    tags: pkm.tags,
    shinyViewed: false, // Default, can be updated by user
    height: 0, // Placeholder
    weight: 0, // Placeholder
    types: types.length > 0 ? types : ["Unknown"],
    abilities: ["Unknown Ability"], // Placeholder
    description: pkm.description,
    level: pkm.level,
    nature: pkm.nature,
    moveset: pkm.moveset,
  };
});
