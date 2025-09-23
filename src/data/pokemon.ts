
import type { Pokemon } from '@/types/pokemon';

// Helper function to parse species string like "#475 - Gallade"
const parseSpeciesString = (speciesString: string): { pokedexNumber: number, speciesName: string } => {
  const match = speciesString.match(/#(\d+)\s*-\s*(.*)/);
  if (match) {
    return { pokedexNumber: parseInt(match[1], 10), speciesName: match[2].trim() };
  }
  // Fallback for species strings that might not have a number, e.g., "Normal" in Zangoose
  if (speciesString.match(/^[a-zA-Z\s]+$/) && !speciesString.includes('-')) {
    return { pokedexNumber: 0, speciesName: speciesString.trim() };
  }
  return { pokedexNumber: 0, speciesName: speciesString.trim() }; // General Fallback
};

// Helper to extract types from tags
const extractTypesFromTags = (tags: string[]): string[] => {
  const knownTypes = ["Normal", "Fire", "Water", "Grass", "Electric", "Ice", "Fighting", "Poison", "Ground", "Flying", "Psychic", "Bug", "Rock", "Ghost", "Dragon", "Dark", "Steel", "Fairy"];
  return tags.filter(tag => knownTypes.map(t => t.toLowerCase()).includes(tag.toLowerCase())).map(tag => knownTypes.find(t => t.toLowerCase() === tag.toLowerCase()) || tag);
};

// Original user data structure
interface UserPokemon {
  idUnique?: number; // Make idUnique optional as it's not in all original entries
  nickname: string;
  species: string;
  description: string;
  imageUrl: string;
  tags: string[];
  level?: string | number;
  nature?: string;
  moveset?: string[];
}

const userPokemonData: UserPokemon[] = [
  { nickname: "Chop", species: "#475 - Gallade", description: "This is Chop, probably my most used pokemon ever. Chop was caught in SV and has been my false swiper ever since, and runs heal pulse, false swipe, hypnosis, and psychic, and has the abiltiy Sharpness to make false swipe stronger.", imageUrl: "https://static.wikia.nocookie.net/shiny-pokemon/images/2/2d/Gallade.png", tags: ["Favourite", "Fighting", "Psychic", "SV"], level: "?", nature: "?", moveset: ["Heal Pulse", "False Swipe", "Hypnosis", "Psychic"]},
  { nickname: "Chedder", species: "#0805 - Stakataka", description: "This Yellow Wall Was Caught In The SWSH DlC, after 55 encounters", imageUrl: "https://www.serebii.net/Shiny/SWSH/805.png", tags: ["Favourite", "Ultra Beast", "Rock", "Steel", "SwSh"], level: "?", nature: "?", moveset: [] },
  { nickname: "Moonlight", species: "#609 - Chandelure", description: "My first hunt getting back into shiny hunting after a 6 month break", imageUrl: "https://www.serebii.net/Shiny/SWSH/609.png", tags: ["Favourite", "Fire", "Ghost", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Jiggly", species: "#0039 - Jigglypuff", description: "I dont remember this one", imageUrl: "https://www.serebii.net/Shiny/SWSH/039.png", tags: ["Fairy", "Normal", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Aqua Antis", species: "#0055 - Golduck", description: "The Infamous Aqua Antis, Found in the SWSH DLC between my favourite shiny and my target", imageUrl: "https://www.serebii.net/Shiny/SWSH/055.png", tags: ["Water", "SwSh"], level: "?", nature: "?", moveset: [] },
  { nickname: "APE", species: "#0057 - Primeape", description: "This fighter was found in Paldea while looking for a Breloom", imageUrl: "https://www.serebii.net/Shiny/SWSH/057.png", tags: ["Fighting", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Anger", species: "#0057 - Primeape", description: "This warrior was found in Paldea while looking for a Breloom, right after APE", imageUrl: "https://www.serebii.net/Shiny/SWSH/057.png", tags: ["Fighting", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Fury", species: "#0058 - Growlithe", description: "This hotshot was found in Paldea", imageUrl: "https://www.serebii.net/Shiny/SWSH/058.png", tags: ["Fire", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Legend", species: "#0059 - Arcanine", description: "Fury's older brother, also found in Paldea", imageUrl: "https://www.serebii.net/Shiny/SWSH/059.png", tags: ["Fire", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Slow", species: "#0079 - Slowpoke", description: "This Simple Creature Was Caught In Paldea", imageUrl: "https://www.serebii.net/Shiny/SV/new/079.png", tags: ["Water", "Psychic", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Grapé", species: "#0080 - Slowbro", description: "Grapé is just as slow as Slow, but looks like a grape, caught in Paldea", imageUrl: "https://www.serebii.net/Shiny/SV/new/080.png", tags: ["Water", "Psychic", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Clover", species: "#0084 - Doduo", description: "This sili birb was caught at Blueberry Acadamy", imageUrl: "https://www.serebii.net/Shiny/SV/new/084.png", tags: ["Normal", "Flying", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Dodrio, Formally Lucky", species: "#0085 - Dodrio", description: "My first caught shiny, caught in PoGo", imageUrl: "https://www.serebii.net/Shiny/SV/new/085.png", tags: ["Normal", "Flying", "PoGo", "Favourite"], level: "?", nature: "?", moveset: [] },
  { nickname: "Mint", species: "#0088 - Grimer", description: "This suprisingly nice smelling pile of poison was found while hunting Ditto in Paldea", imageUrl: "https://www.serebii.net/Shiny/SV/new/088.png", tags: ["Poison", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Rotten", species: "#0089 - Muk", description: "Mint's rotten cousin, Rotten was found while hunting Ditto in Paldea", imageUrl: "https://www.serebii.net/Shiny/SV/new/089.png", tags: ["Poison", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Volté", species: "#0100 - Voltorb", description: "This shocking orb was found in Paldea", imageUrl: "https://www.serebii.net/Shiny/SV/new/100.png", tags: ["Electric", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Electro", species: "#0101 - Electrode", description: "This shocking behemith was found in Paldea", imageUrl: "https://www.serebii.net/Shiny/SV/new/101.png", tags: ["Electric", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Sap", species: "#0103 - Alolan Exeggutor", description: "No one ever told sap to keep her head out of the clouds when at blueberry academy", imageUrl: "https://www.serebii.net/Shiny/SV/new/103-a.png", tags: ["Grass", "Dragon", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Summer", species: "#0103 - Exeggutor", description: "Summer loved the sun so much, she tried to reach for it, almost there. caught at blueberry academy", imageUrl: "https://www.serebii.net/Shiny/SV/new/103.png", tags: ["Grass", "Psychic", "SV"], level: "?", nature: "?", moveset: [] }, // Corrected Exeggutor to Psychic as per standard typing, original image was Alolan
  { nickname: "Koffing", species: "#0109 - Koffing", description: "I caught this over a year ago in Kitakami, No clue why it's not named~", imageUrl: "https://www.serebii.net/Shiny/SV/new/109.png", tags: ["Poison", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Horseshoe", species: "#0128 - Paldean Tauros", description: "This raging tauros was for my first playthrough of violet, caught him on the second day of the game's release", imageUrl: "https://www.serebii.net/Shiny/SV/new/128-p.png", tags: ["Fighting", "Favourite", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "lavander", species: "#0131 - Lapras", description: "This lapras was found in the chilly seas of the polar biome in Blueberry Academy", imageUrl: "https://www.serebii.net/Shiny/SV/new/131.png", tags: ["Ice", "Water", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Bloby", species: "#0132 - Ditto", description: "This shapeshifter kept me busy on hunting in Paldea for a few days", imageUrl: "https://www.serebii.net/Shiny/SV/new/132.png", tags: ["Normal", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Iggly", species: "#0174 - Igglybuff", description: "Aww, what a cuti- wait why do you have competitive and copycat- Found in Paldea", imageUrl: "https://www.serebii.net/Shiny/SV/new/174.png", tags: ["Normal", "Fairy", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Fluffy", species: "#0179 - Mareep", description: "Fluffy is what would happen if cotten candy was alive, found in Paldea", imageUrl: "https://www.serebii.net/Shiny/SV/new/179.png", tags: ["Electric", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Flaffy", species: "#0180 - Flaaffy", description: "No, nor the name or species is a typo, thats how Flaaffy is spelt, its weird, caught in paldea", imageUrl: "https://www.serebii.net/Shiny/SV/new/180.png", tags: ["Electric", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Shine", species: "#0183 - Marill", description: "this green orb was caught in Paldea, do you think you can use it to awaken Primal Rayquaza?", imageUrl: "https://www.serebii.net/Shiny/SV/new/183.png", tags: ["Water", "Fairy", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Golden", species: "#0184 - Azumaril", description: "My first boosted odds shiny of Paldea", imageUrl: "https://www.serebii.net/Shiny/SV/new/184.png", tags: ["Water", "Fairy", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Sudo", species: "#0185 - Sudowoodo", description: "This is a natural tree of Paldea, what do you mean its a Pokemon?", imageUrl: "https://www.serebii.net/Shiny/SV/new/185.png", tags: ["Rock", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Green", species: "#0187 - Hoppip", description: "This Hoppip is said to have flown over all of Paldea until it got sunburnt, and then turned green", imageUrl: "https://www.serebii.net/Shiny/SV/new/187.png", tags: ["Grass", "Flying", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Hoppy", species: "#0188 - Skiploom", description: "The legend of Green may have been wrong, but you Cant deny the legend of Hoppy getting sunburnt in Paldea", imageUrl: "https://www.serebii.net/Shiny/SV/new/188.png", tags: ["Grass", "Flying", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Jumpy", species: "#0189 - Jumpluff", description: "Jumpy is the living embodiment of :3. bringing :3 to Paldea to this day", imageUrl: "https://www.serebii.net/Shiny/SV/new/189.png", tags: ["Grass", "Flying", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Poffy", species: "#0194 - Wooper", description: "This pink goof has no thoughts at any given time, caught in Paldea", imageUrl: "https://www.serebii.net/Shiny/SV/new/194.png", tags: ["Water", "Ground", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "King", species: "#0199 - Slowking", description: "This queen is slaying all gender norms in Paldea, slay Queen!", imageUrl: "https://www.serebii.net/Shiny/SV/new/199.png", tags: ["Water", "Psychic", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Forret", species: "#0205 - Forretress", description: "This is how the great crator of Paldea was formed", imageUrl: "https://www.serebii.net/Shiny/SV/new/205.png", tags: ["Bug", "Steel", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Dun", species: "#0206 - Dunsparce", description: "This snake was found in Paldea", imageUrl: "https://www.serebii.net/Shiny/SV/new/206.png", tags: ["Normal", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Present", species: "#0225 - Delibird", description: "Present is almost always late for Christmas in Paldea", imageUrl: "https://www.serebii.net/Shiny/SV/new/225.png", tags: ["Ice", "Flying", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Nick", species: "#0225 - Delibird", description: "Present's twin, caught in Paldea", imageUrl: "https://www.serebii.net/Shiny/SV/new/225.png", tags: ["Ice", "Flying", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Dour", species: "#0228 - Houndour", description: "This dark puppy was found in a cave in Paldea", imageUrl: "https://www.serebii.net/Shiny/SV/new/228.png", tags: ["Fire", "Dark", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Doom", species: "#0229 - Houndoom", description: "Doom was caught in the depths of Poco Path", imageUrl: "https://www.serebii.net/Shiny/SV/new/229.png", tags: ["Fire", "Dark", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Radaz", species: "#0258 - Mudkip", description: "this pink fish was found in Blueberry Academy", imageUrl: "https://www.serebii.net/Shiny/SV/new/258.png", tags: ["Water", "Ground", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Pooch", species: "#0261 - Poochyena", description: "this yellow doggo was found in Kitakami while hatching eggs for Blueberry", imageUrl: "https://www.serebii.net/Shiny/SV/new/261.png", tags: ["Dark", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Peckish", species: "#0285 - Shroomish", description: "Caught in Paldea. this took, 8 hours.", imageUrl: "https://www.serebii.net/Shiny/SV/new/285.png", tags: ["Grass", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Boxer", species: "#0296 - Makuhita", description: "I dont even remember catching this one, but its from Paldea", imageUrl: "https://www.serebii.net/Shiny/SV/new/296.png", tags: ["Fighting", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Emerald", species: "#0302 - Sableye", description: "This gem was found in Paldea", imageUrl: "https://www.serebii.net/Shiny/SV/new/302.png", tags: ["Dark", "Ghost", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Spoey", species: "#0325 - Spoink", description: "Bouncing all the way from Paldea", imageUrl: "https://www.serebii.net/Shiny/SV/new/325.png", tags: ["psychic", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Grum", species: "#0326 - Grumpig", description: "A psychic pig from Paldea, neat", imageUrl: "https://www.serebii.net/Shiny/SV/new/326.png", tags: ["psychic", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Swab", species: "#0334 - Altaria", description: "How is this a dragon From Paldea", imageUrl: "https://www.serebii.net/Shiny/SV/new/334.png", tags: ["flying", "dragon", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Cory", species: "#0341 - Corphish", description: "This Corphish was found in Kitakami", imageUrl: "https://www.serebii.net/Shiny/SV/new/341.png", tags: ["Water", "SV"], level: "?", nature: "?", moveset: [] }, // Corrected Pokedex number from 031 to 341
  { nickname: "Ivy", species: "#0373 - Salamence", description: "Palkias Weakness, from Paldea", imageUrl: "https://www.serebii.net/Shiny/SV/new/373.png", tags: ["dragon", "flying", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Lightning", species: "#0403 - Shinx", description: "Shinx was my first shiny actually, back in Gen 4, anyways this one is from Paldea", imageUrl: "https://www.serebii.net/Shiny/SV/new/403.png", tags: ["electric", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Static", species: "#0403 - Shinx", description: "From Paldea, nothing else to say", imageUrl: "https://www.serebii.net/Shiny/SV/new/403.png", tags: ["electric", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Sparse", species: "#0418 - Buizel", description: "I got the name from the sparse reef in Subnatica, this one is from Paldea though", imageUrl: "https://www.serebii.net/Shiny/SV/new/418.png", tags: ["water", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Savior", species: "#0418 - Buizel", description: "I barely remember this one, Paldea", imageUrl: "https://www.serebii.net/Shiny/SV/new/418.png", tags: ["water", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Excadrill", species: "#0530 - Excadrill", description: "Excadrill", imageUrl: "https://www.serebii.net/Shiny/SV/new/530.png", tags: ["ground", "steel", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Dream", species: "#0570 - Zorua", description: "Found him in Paldea, disquised as a Maschiff", imageUrl: "https://www.serebii.net/Shiny/SV/new/570.png", tags: ["dark", "SV"], level: "?", nature: "?", moveset: [] }, // Corrected species name
  { nickname: "Blueberry", species: "#0570 - Hisuian Zorua", description: "My first sucsessful masuda hunt, hatched in SV", imageUrl: "https://www.serebii.net/Shiny/SV/new/570-h.png", tags: ["Ghost", "normal", "Favourite", "SV"], level: "?", nature: "?", moveset: [] }, // Corrected species name
  { nickname: "Nightmare", species: "#0571 - Zoroark", description: "Found haunting dreams in Paldea", imageUrl: "https://www.serebii.net/Shiny/SV/new/571.png", tags: ["dark", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Mushrö", species: "#0591 - Amoonguss", description: "Caught this and 3 others in paldea in the span of 2 minutes", imageUrl: "https://www.serebii.net/Shiny/SV/new/591.png", tags: ["Grass", "Poison", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Lunar", species: "#0607 - Litwick", description: "Found her in Kitakami", imageUrl: "https://www.serebii.net/Shiny/SV/new/607.png", tags: ["Ghost", "Fire", "SV"], level: "?", nature: "?", moveset: [] }, // Corrected species name
  { nickname: "Volcano", species: "#0637 - Volcarona", description: "Used to hatch eggs for me for a bit, from Paldea", imageUrl: "https://www.serebii.net/Shiny/SV/new/637.png", tags: ["Bug", "Fire", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Fletch", species: "#0662 - Fletchinder", description: "Also used to hatch eggs for me for a bit, From Paldea", imageUrl: "https://www.serebii.net/Shiny/SV/new/662.png", tags: ["Fire", "Flying", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Lit", species: "#0667 - Litleo", description: "I have no memory of this - from Paldea", imageUrl: "https://www.serebii.net/Shiny/SV/new/667.png", tags: ["Fire", "Normal", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Pyroar", species: "#0668 - Pyroar", description: "Honestly I dont remember any of the pyroar line it would appear, from Paldea", imageUrl: "https://www.serebii.net/Shiny/SV/new/668.png", tags: ["Fire", "Normal", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Redemtion", species: "#0672 - Skiddo", description: "The brought back Paldean shiny", imageUrl: "https://www.serebii.net/Shiny/SV/new/672.png", tags: ["Grass", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Lil Leaf", species: "#0672 - Skiddo", description: "A skiddo a day keeps the sadness away, from Paldea", imageUrl: "https://www.serebii.net/Shiny/SV/new/672.png", tags: ["Grass", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Momento", species: "#0673 - Gogoat", description: "I dont know why I named it is, I dont regret it though, from Paldea", imageUrl: "https://www.serebii.net/Shiny/SV/new/673.png", tags: ["Grass", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Lucha", species: "#0701 - Hawlucha", description: "A wreastler at heart, from Paldea", imageUrl: "https://www.serebii.net/Shiny/SV/new/701.png", tags: ["Fighting", "Flying", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Token", species: "#0706 - Goodra", description: "My first shiny from a brand new game, caught on the release date of SV", imageUrl: "https://www.serebii.net/Shiny/SV/new/706.png", tags: ["Dragon", "Favourite", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Frost", species: "#0713 - Avalugg", description: "Why is the home model giant at the time of writing this, caught in Paldea", imageUrl: "https://www.serebii.net/Shiny/SV/new/713.png", tags: ["Ice", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Morgan", species: "#0730 - Primarina", description: "Caught him in Blueberry academy", imageUrl: "https://www.serebii.net/Shiny/SV/new/730.png", tags: ["Water", "Fairy", "SV"], level: "?", nature: "?", moveset: [] }, // Corrected species name
  { nickname: "Zazu", species: "#0733 - Toucannon", description: "Bisexual bird, found at Blueberry Academy", imageUrl: "https://www.serebii.net/Shiny/SV/new/733.png", tags: ["Normal", "Flying", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Chargi", species: "#0737 - Charjabug", description: "Caught in Kitakami, no history on this one", imageUrl: "https://www.serebii.net/Shiny/SV/new/737.png", tags: ["Bug", "Electric", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Volt", species: "#0738 - Vikavolt", description: "Ace of my dlc team for SV", imageUrl: "https://www.serebii.net/Shiny/SV/new/738.png", tags: ["Bug", "Electric", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Brawler", species: "#0739 - Crabrawler", description: "Always looking for a fight, found in Paldea", imageUrl: "https://www.serebii.net/Shiny/SV/new/739.png", tags: ["Fighting", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Kamal", species: "#0740 - Crabominable", description: "Never looking for a fight, Found in Blueberry Academy", imageUrl: "https://www.serebii.net/Shiny/SV/new/740.png", tags: ["Fighting", "Ice", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Cutie", species: "#0742 - Cutiefly", description: "So hard to see, yet such a nice shiny, Kitamaki", imageUrl: "https://www.serebii.net/Shiny/SV/new/742.png", tags: ["Bug", "Fairy", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Rocky", species: "#0744 - Rockruff", description: "No memory of this one :p, Paldea", imageUrl: "https://www.serebii.net/Shiny/SV/new/744.png", tags: ["Rock", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Marine", species: "#0747 - Mareanie", description: "While making this I realized Mareanie is a mix of Marine and Meanie...", imageUrl: "https://www.serebii.net/Shiny/SV/new/747.png", tags: ["Water", "Poison", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Toxic", species: "#0748 - Toxapex", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/748.png", tags: ["Water", "Poison", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Salandit", species: "#0757 - Salandit", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/757.png", tags: ["Fire", "Poison", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Ghosty", species: "#0769 - Sandygast", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/769.png", tags: ["Ground", "Ghost", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Shinyghast", species: "#0769 - Sandygast", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/769.png", tags: ["Ground", "Ghost", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Sandy", species: "#0770 - Palossand", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/770.png", tags: ["Ground", "Ghost", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Starlight", species: "#0774 - Minior", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/774.png", tags: ["Rock", "Flying", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Biter", species: "#0833 - Chewtle", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/833.png", tags: ["Water", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Dred", species: "#0834 - Drednaw", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/834.png", tags: ["Water", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Lactose", species: "#0868 - Milcery", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/868.png", tags: ["Fairy", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Waddles", species: "#0915 - Lechonk", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/915.png", tags: ["Normal", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Oinky", species: "#0916 - Oinkologne", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/916.png", tags: ["Normal", "SV"], level: "?", nature: "?", moveset: [] }, // Corrected species name
  { nickname: "Webber", species: "#0917 - Tarountula", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/917.png", tags: ["Bug", "SV"], level: "?", nature: "?", moveset: [] }, // Corrected species name
  { nickname: "Silky", species: "#0917 - Tarountula", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/917.png", tags: ["Bug", "SV"], level: "?", nature: "?", moveset: [] }, // Corrected species name
  { nickname: "Spiderman", species: "#0918 - Spidops", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/918.png", tags: ["Bug", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Kicks", species: "#0920 - Lokix", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/920.png", tags: ["Bug", "Dark", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Paw", species: "#0922 - Pawmo", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/922.png", tags: ["Electric", "Fighting", "SV"], level: "?", nature: "?", moveset: [] }, // Corrected type Dark to Fighting
  { nickname: "Smiles", species: "#0942 - Maschiff", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/942.png", tags: ["Dark", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Twig", species: "#0946 - Bramblin", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/946.png", tags: ["Ghost", "Grass", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Toed", species: "#0948 - Toedscool", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/948.png", tags: ["Grass", "Ground", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "scruel", species: "#0949 - Toedscruel", description: "The name is not missing a capital, I don't know why either", imageUrl: "https://www.serebii.net/Shiny/SV/new/949.png", tags: ["Grass", "ground", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Jolly", species: "#0950 - Klawf", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/950.png", tags: ["Rock", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Seeds", species: "#0951 - Capsakid", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/951.png", tags: ["Grass", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Scorch", species: "#0952 - Scovillain", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/952.png", tags: ["Grass", "Fire", "SV"], level: "?", nature: "?", moveset: [] }, // Corrected species name
  { nickname: "Richy", species: "#0953 - Rellor", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/953.png", tags: ["Bug", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Acient", species: "#0954 - Rabsca", description: "I don't know how I mispelled 'ancient' so much", imageUrl: "https://www.serebii.net/Shiny/SV/new/954.png", tags: ["Bug", "Psychic", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Spinny", species: "#0955 - Flittle", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/955.png", tags: ["Psychic", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Karen", species: "#0956 - Espathra", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/956.png", tags: ["Psychic", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Peral", species: "#0963 - Finizen", description: "I couldn't spell apparently...", imageUrl: "https://www.serebii.net/Shiny/SV/new/963.png", tags: ["Water", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "zen", species: "#0963 - Finizen", description: "Why and how is it not capitalized", imageUrl: "https://www.serebii.net/Shiny/SV/new/963.png", tags: ["Water", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Splash", species: "#0964 - Palafin", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/964.png", tags: ["Water", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Speds", species: "#0965 - Varoom", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/965.png", tags: ["Poison", "Steel", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Orth", species: "#0968 - Orthworm", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/968.png", tags: ["Steel", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Amigo", species: "#0973 - Flamigo", description: "Why is this fighting type? Caught in SV", imageUrl: "https://www.serebii.net/Shiny/SV/new/973.png", tags: ["Flying", "Fighting", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Amend", species: "#0976 - Veluza", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/976.png", tags: ["Water", "Psychic", "SV"], level: "?", nature: "?", moveset: [] }, // Added Psychic type based on game data
  { nickname: "Dozo", species: "#0977 - Dondozo", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/977.png", tags: ["Water", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Sushie", species: "#0978 - Tatsugiri", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/978.png", tags: ["Water", "Dragon", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Spook", species: "#0979 - Annihilape", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/979.png", tags: ["Ghost", "Fighting", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Fari", species: "#0981 - Farigiraf", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/981.png", tags: ["Normal", "Psychic", "SV"], level: "?", nature: "?", moveset: [] }, // Added Psychic type
  { nickname: "Dudun", species: "#0982 - Dudunsparce-two-segment", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/982.png", tags: ["Normal", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Sharpie", species: "#0983 - Kingambit", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/983.png", tags: ["Dark", "Steel", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Silver", species: "#0990 - Iron Treads", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/990.png", tags: ["Steel", "Ground", "SV", "Paradox"], level: "?", nature: "?", moveset: [] }, // Added Paradox tag
  { nickname: "Chrome", species: "#0991 - Iron Bundle", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/991.png", tags: ["Ice", "Water", "SV", "Paradox"], level: "?", nature: "?", moveset: [] }, // Added Paradox tag
  { nickname: "Warrior", species: "#0992 - Iron Hands", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/992.png", tags: ["Fighting", "Electric", "SV", "Paradox"], level: "?", nature: "?", moveset: [] },
  { nickname: "lantern", species: "#0993 - Iron Jugulis", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/993.png", tags: ["Dark", "Flying", "SV", "Paradox"], level: "?", nature: "?", moveset: [] },
  { nickname: "Mothlight", species: "#0994 - Iron Moth", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/994.png", tags: ["Fire", "Poison", "SV", "Paradox"], level: "?", nature: "?", moveset: [] },
  { nickname: "Thorns", species: "#0995 - Iron Thorns", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/995.png", tags: ["Rock", "Electric", "SV", "Paradox"], level: "?", nature: "?", moveset: [] },
  { nickname: "Gimmi", species: "#0999 - Gimmighoul", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/999.png", tags: ["Ghost", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Ribben", species: "#1006 - Iron Valiant", description: "I am just noticing i spelt Ribbon wrong over 2 years later", imageUrl: "https://www.serebii.net/Shiny/SV/new/1006.png", tags: ["Fairy", "Fighting", "SV", "Paradox"], level: "?", nature: "?", moveset: [] }, // Added Paradox tag
  { nickname: "Syrup", species: "#1011 - Dipplin", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/1011.png", tags: ["Dragon", "Grass", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Staples", species: "#1018 - Archaludon", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/1018.png", tags: ["Steel", "Dragon", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Si-fi", species: "#0055 - Golduck", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/055.png", tags: ["Water", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Jade", species: "#0067 - Machoke", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SWSH/067.png", tags: ["Fighting", "PLA"], level: "?", nature: "?", moveset: [] },
  { nickname: "Bolt", species: "#0081 - Magnemite", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SWSH/081.png", tags: ["Electric", "Steel", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Jean", species: "#0112 - Rhydon", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SWSH/112.png", tags: ["Ground", "Rock", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Dice", species: "#0123 - Scyther", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SWSH/123.png", tags: ["Bug", "Flying", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Flip", species: "#0129 - Magikarp", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SWSH/129.png", tags: ["Water", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Legendary", species: "#0130 - Gyarados", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/130.png", tags: ["Water", "Flying", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Snowy", species: "#0133 - Eevee", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/133.png", tags: ["Normal", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Jolt", species: "#0135 - Jolteon", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/135.png", tags: ["Electric", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Static", species: "#0137 - Porygon", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/137.png", tags: ["Normal", "SV"], level: "?", nature: "?", moveset: [] }, // Corrected Pokedex for Porygon
  { nickname: "Snorlax", species: "#0143 - Snorlax", description: "This Snorlax was my first SwSh shiny", imageUrl: "https://www.serebii.net/Shiny/SV/new/143.png", tags: ["Normal", "SwSh"], level: "?", nature: "?", moveset: [] },
  { nickname: "Puff", species: "#0173 - Cleffa", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/173.png", tags: ["Fairy", "PLA"], level: "?", nature: "?", moveset: [] },
  { nickname: "Eve", species: "#0196 - Espeon", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/196.png", tags: ["Psychic", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Midnight", species: "#0197 - Umbreon", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/197.png", tags: ["Dark", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Slice", species: "#0212 - Scizor", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/212.png", tags: ["Bug", "Steel", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Cross", species: "#0214 - Heracross", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/214.png", tags: ["Bug", "Fighting", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Pop", species: "#0215 - Sneasel", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/215.png", tags: ["Dark", "Ice", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Sleepy", species: "#0280 - Ralts", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/280.png", tags: ["Psychic", "Fairy", "SV"], level: "?", nature: "?", moveset: [] }, // Corrected Pokedex for Ralts
  { nickname: "Twist", species: "#0281 - Kirlia", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/281.png", tags: ["Psychic", "Fairy", "SV"], level: "?", nature: "?", moveset: [] }, // Corrected Pokedex for Kirlia
  { nickname: "Velvet", species: "#0355 - Duskull", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/355.png", tags: ["Ghost", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Hoover", species: "#0364 - Sealeo", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SWSH/364.png", tags: ["Ice", "Water", "PLA"], level: "?", nature: "?", moveset: [] },
  { nickname: "Flint", species: "#0390 - Chimchar", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/390.png", tags: ["Fire", "Starter", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Pearl", species: "#0393 - Piplup", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/393.png", tags: ["Water", "Starter", "PLA"], level: "?", nature: "?", moveset: [] },
  { nickname: "Beethoven", species: "#0401 - Kricketot", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/401.png", tags: ["Bug", "PLA"], level: "?", nature: "?", moveset: [] },
  { nickname: "Thunder", species: "#0404 - Luxio", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/404.png", tags: ["Electric", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Storm", species: "#0405 - Luxray", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/405.png", tags: ["Electric", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Rosie", species: "#0407 - Roserade", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/407.png", tags: ["Grass", "Poison", "PLA"], level: "?", nature: "?", moveset: [] },
  { nickname: "Strawberry", species: "#0435 - Skuntank", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/435.png", tags: ["Poison", "Dark", "PLA"], level: "?", nature: "?", moveset: [] },
  { nickname: "Penny", species: "#0437 - Bronzong", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/437.png", tags: ["Steel", "Psychic", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Bella", species: "#0440 - Happiny", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/440.png", tags: ["Normal", "PLA"], level: "?", nature: "?", moveset: [] },
  { nickname: "Crag", species: "#0453 - Croagunk", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/453.png", tags: ["Poison", "Fighting", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Toxicroak", species: "#0454 - Toxicroak", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/454.png", tags: ["Poison", "Fighting", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Snowflake", species: "#0474 - Porygon-Z", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/474.png", tags: ["Normal", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Plasma", species: "#0479 - Rotom", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/479.png", tags: ["Electric", "Ghost", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Abyss", species: "#0628 - Hisuian Braviary", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SWSH/628-h.png", tags: ["Psychic", "Flying", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Yellow", species: "#0712 - Bergmite", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/712.png", tags: ["Ice", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Chilly", species: "#0712 - Bergmite", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/712.png", tags: ["Ice", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Lust", species: "#0528 - Swoobat", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SWSH/528.png", tags: ["Psychic", "Flying", "SwSh"], level: "?", nature: "?", moveset: [] },
  { nickname: "Yellowstone", species: "#0879 - Copperajah", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SWSH/879.png", tags: ["Steel", "SwSh"], level: "?", nature: "?", moveset: [] },
  { nickname: "Queen", species: "#0075 - Alolan Graveler", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/075-a.png", tags: ["Rock", "Electric", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Butterscotch", species: "#0026 - Alolan Raichu", description: "Placeholder", imageUrl: "https://cdn.shopify.com/s/files/1/1732/7223/files/poke_capture_0026_001_mf_n_00000000_f_r_medium.png?v=1701796360", tags: ["Electric", "Psychic", "SWSh"], level: "?", nature: "?", moveset: [] },
  { nickname: "Sonar", species: "#0048 - Venonat", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/048.png", tags: ["Bug", "Poison", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Tempo", species: "#0163 - Hoothoot", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/163.png", tags: ["Normal", "Flying", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Hedwig", species: "#0164 - Noctowl", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/164.png", tags: ["Normal", "Flying", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Plasma", species: "#0181 - Ampharos", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/181.png", tags: ["Electric", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Orbet", species: "#0211 - Qwilfish", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/211.png", tags: ["Water", "Poison", "SwSh"], level: "?", nature: "?", moveset: [] },
  { nickname: "Glitch", species: "#0233 - Porygon2", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/233.png", tags: ["Normal", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Green Apple", species: "#0234 - Stantler", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/234.png", tags: ["Normal", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Rabaz", species: "#0260 - Swampert", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/260.png", tags: ["Water", "Ground", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Lovely", species: "#0370 - Luvdisc", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/370.png", tags: ["Water", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Shifu", species: "#0619 - Mienfoo", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/619.png", tags: ["Fighting", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Autumn", species: "#0709 - Trevenant", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/709.png", tags: ["Ghost", "Grass", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Mudé", species: "#0749 - Mudbray", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/749.png", tags: ["Ground", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Agent", species: "#0752 - Araquanid", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/752.png", tags: ["Water", "Bug", "SwSh"], level: "?", nature: "?", moveset: [] },
  { nickname: "Tock", species: "#0962 - Bombirdier", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/962.png", tags: ["Dark", "Flying", "SV"], level: "?", nature: "?", moveset: [] }, // Corrected species name
  { nickname: "Earl Grey", species: "#0854 - Sinistea", description: "Placeholder, Authentic form", imageUrl: "https://www.serebii.net/Shiny/SV/new/854.png", tags: ["Ghost", "SV"], level: "?", nature: "?", moveset: [] }, // Corrected species name
  { nickname: "Bronze", species: "#0823 - Corviknight", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/823.png", tags: ["Flying", "Steel", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Lime", species: "#0027 - Sandshrew", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/027.png", tags: ["Ground", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Naught", species: "#0074 - Geodude", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/074.png", tags: ["Rock", "Ground", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Pink", species: "#0147 - Dratini", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/147.png", tags: ["Dragon", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Blue", species: "#0167 - Spinarak", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/167.png", tags: ["Bug", "Poison", "SV"], level: "?", nature: "?", moveset: [] }, // Corrected image URL to match Spinarak
  { nickname: "Moonbound", species: "#0216 - Teddiursa", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/216.png", tags: ["Normal", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Deli", species: "#0225 - Delibird", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/225.png", tags: ["Ice", "Flying", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Flya", species: "#0330 - Flygon", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/330.png", tags: ["Ground", "Dragon", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Uranium", species: "#0436 - Bronzor", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/436.png", tags: ["Steel", "Psychic", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Claw", species: "#0693 - Clawitzer", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/693.png", tags: ["Water", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Bannana", species: "#0810 - Grookey", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/810.png", tags: ["Grass", "SV", "Starter"], level: "?", nature: "?", moveset: [] },
  { nickname: "Chilly", species: "#0875 - Eiscue", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/875.png", tags: ["Ice", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Jessica", species: "#0195 - Quagsire", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/195.png", tags: ["Water", "Ground", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Fauna", species: "#0357 - Tropius", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/357.png", tags: ["Grass", "Flying", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Pawn", species: "#0624 - Pawniard", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/624.png", tags: ["Dark", "Steel", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Apple Pie", species: "#0842 - Appletun", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/842.png", tags: ["Grass", "Dragon", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Derpy", species: "#0928 - Smoliv", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/928.png", tags: ["Grass", "Normal", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Char-Chi", species: "#0935 - Charcadet", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/935.png", tags: ["Fire", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Purple", species: "#0943 - Mabosstiff", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/943.png", tags: ["Dark", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Phantom", species: "#0442 - Spiritomb", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/442.png", tags: ["Ghost", "Dark", "Favourite", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Energy", species: "#0100 - Hisuian Voltorb", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/100-h.png", tags: ["Grass", "Electric", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Beryl", species: "#0246 - Larvitar", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/246.png", tags: ["Rock", "Ground", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Flame", species: "#0608 - Lampent", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/608.png", tags: ["Ghost", "Fire", "SV"], level: "?", nature: "?", moveset: [] }, // Corrected species name
  { nickname: "Nosey", species: "#0299 - Nosepass", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/299.png", tags: ["Rock", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Cloak", species: "#0361 - Snorunt", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/361.png", tags: ["Ice", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Compass", species: "#0476 - Probopass", description: "Plaeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/476.png", tags: ["Rock", "Steel", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Dasie", species: "#0970 - Glimmora", description: "Plaeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/970.png", tags: ["Rock", "Poison", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Electrode", species: "#0101 - Hisuian Electrode", description: "Plaeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/101-h.png", tags: ["Electric", "Grass", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Rufflet", species: "#0627 - Rufflet", description: "Plaeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/627.png", tags: ["Normal", "Flying", "Pla"], level: "?", nature: "?", moveset: [] },
  { nickname: "Abra", species: "#0063 - Abra", description: "Plaeholder", imageUrl: "https://www.serebii.net/Shiny/SWSH/063.png", tags: ["Psychic", "PLA"], level: "?", nature: "?", moveset: [] },
  { nickname: "Kadabra", species: "#0064 - Kadabra", description: "Plaeholder", imageUrl: "https://www.serebii.net/Shiny/SWSH/064.png", tags: ["Psychic", "PLA"], level: "?", nature: "?", moveset: [] },
  { nickname: "Chance", species: "#0113 - Chansey", description: "Plaeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/113.png", tags: ["Normal", "SV"], level: "?", nature: "?", moveset: [] }, // Corrected Chansey Pokedex and image
  { nickname: "Flop", species: "#0130 - Gyarados", description: "Plaeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/130.png", tags: ["Water", "Flying", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Darky", species: "#0198 - Murkrow", description: "Plaeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/198.png", tags: ["Dark", "Flying", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Floaté", species: "#0419 - Floatzel", description: "Plaeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/419.png", tags: ["Water", "SV"], level: "?", nature: "?", moveset: [] }, // Removed Flying tag as Floatzel is pure Water
  { nickname: "Krow", species: "#0430 - Honchkrow", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/430.png", tags: ["Dark", "Flying", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Lemon", species: "#0463 - Lickilicky", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SWSH/463.png", tags: ["Normal", "PLA"], level: "?", nature: "?", moveset: [] },
  { nickname: "Shade", species: "#0092 - Gastly", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SWSH/092.png", tags: ["Ghost", "Poison", "Pla"], level: "?", nature: "?", moveset: [] }, // Corrected species name
  { nickname: "Gul", species: "#0316 - Gulpin", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/316.png", tags: ["Poison", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Twig", species: "#0387 - Turtwig", description: "Plaeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/387.png", tags: ["Grass", "PLA", "Starter"], level: "?", nature: "?", moveset: [] },
  { nickname: "Beach", species: "#0369 - Relicanth", description: "Plaeholder", imageUrl: "https://www.serebii.net/Shiny/SWSH/369.png", tags: ["Water", "Rock", "Favourite", "SwSh"], level: "?", nature: "?", moveset: [] },
  { nickname: "Toxic", species: "#0849 - Toxtricity", description: "Plaeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/849.png", tags: ["Poison", "Electric", "SwSh"], level: "?", nature: "?", moveset: [] },
  { nickname: "Leah", species: "#0270 - Lotad", description: "Plaeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/270.png", tags: ["Water", "Grass", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Droop", species: "#0271 - Lombre", description: "Plaeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/271.png", tags: ["Water", "Grass", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Marty", species: "#0272 - Ludicolo", description: "Plaeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/272.png", tags: ["Water", "Grass", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Blaze", species: "#0391 - Monferno", description: "Plaeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/391.png", tags: ["Fire", "Fighting", "Starter", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Fault", species: "#0436 - Bronzor", description: "Plaeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/436.png", tags: ["Steel", "Psychic", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Bloom", species: "#0585 - Deerling", description: "Plaeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/585.png", tags: ["Normal", "Grass", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Bubbles", species: "#0657 - Frogadier", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/657.png", tags: ["Water", "Starter", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Rogue", species: "#0658 - Greninja", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/658.png", tags: ["Water", "Dark", "Starter", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Rachel", species: "#0739 - Crabrawler", description: "Plaeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/739.png", tags: ["Fighting", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Koka", species: "#0958 - Tinkatuff", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/958.png", tags: ["Fairy", "Steel", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Dane", species: "#0965 - Varoom", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/965.png", tags: ["Steel", "Poison", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Motar", species: "#0966 - Revavroom", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/966.png", tags: ["Steel", "Poison", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Serpant", species: "#1019 - Hydrapple", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/1019.png", tags: ["Grass", "Dragon", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Inferno", species: "#0392 - Infernape", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/392.png", tags: ["Fire", "Fighting", "Starter", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Palm", species: "#0103 - Exeggutor", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/103.png", tags: ["Grass", "Psychic", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Night", species: "#0164 - Noctowl", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/164.png", tags: ["Normal", "Flying", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Golden", species: "#0250 - Ho-Oh", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/250.png", tags: ["Fire", "Flying", "SwSh", "Legendary", "Favourite"], level: "?", nature: "?", moveset: [] },
  { nickname: "Shock", species: "#0403 - Shinx", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/403.png", tags: ["Electric", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Clawy", species: "#0693 - Clawitzer", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/693.png", tags: ["Water", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Bowtie", species: "#0722 - Rowlet", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/722.png", tags: ["Grass", "Flying", "Starter", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Heart", species: "#0782 - Jangmo-o", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/782.png", tags: ["Dragon", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Rose Quartz", species: "#0783 - Hakamo-o", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/783.png", tags: ["Dragon", "Fighting", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Eclipse", species: "#0792 - Lunala", description: "Placeholder", imageUrl: "https://www.serebii.net/Shiny/SV/new/792.png", tags: ["Psychic", "Ghost", "SwSh", "Favourite", "Legendary"], level: "?", nature: "?", moveset: [] },
  { nickname: "Shockasaur", species: "#0880 - Dracozolt", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Electric", "Dragon", "Swsh", "Fossil"], level: "?", nature: "?", moveset: [] },
  { nickname: "Wiskers", species: "#0882 - Dracovish", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Fossil", "Water", "Dragon", "Swsh", "Favourite"], level: "?", nature: "?", moveset: [] },
  { nickname: "Shelly", species: "#0139 - Omastar", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Rock", "Water", "SwSh", "Fossil"], level: "?", nature: "?", moveset: [] },
  { nickname: "Aero", species: "#0142 - Aerodactyl", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Rock", "Flying", "SwSh", "Fossil"], level: "?", nature: "?", moveset: [] },
  { nickname: "Icicle", species: "#0881 - Arctozolt", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Electric", "Ice", "SwSh", "Fossil"], level: "?", nature: "?", moveset: [] },
  { nickname: "Frox", species: "#0883 - Arctovish", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Water", "Ice", "SwSh", "Fossil"], level: "?", nature: "?", moveset: [] },
  { nickname: "Fishius", species: "#0883 - Arctovish", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Water", "Ice", "SwSh", "Fossil"], level: "?", nature: "?", moveset: [] },
  { nickname: "Spike", species: "#0028 - Sandslash", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Ground", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Rocky", species: "#0074 - Geodude", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Rock", "Ground", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Gem", species: "#0356 - Dusclops", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Ghost", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Mustard", species: "#0749 - Mudbray", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Ground", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Clay", species: "#0750 - Mudsdale", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Ground", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Foilage", species: "#0069 - Bellsprout", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Grass", "Poison", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Diamond", species: "#0703 - Carbink", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Rock", "Fairy", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Pike", species: "#0731 - Pikipek", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Normal", "Flying", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Sarry", species: "#0070 - Weepinbell", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Grass", "Poison", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Honey", species: "#0749 - Mudbray", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Ground", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Morka", species: "#0877 - Morpeko", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Electric", "Dark", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Sugar", species: "#0861 - Grimmsnarl", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Dark", "Fairy", "Favourite", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Star", species: "#0396 - Starly", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Normal", "Flying", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Mozart", species: "#0402 - Kricketune", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Bug", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Fergus", species: "#0590 - Foongus", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Grass", "Poison", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Theo", species: "#0811 - Thwackey", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Grass", "Starter", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Shade", species: "#0157 - Hisuian Typhlosion", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Fire", "Ghost", "Starter", "PLA"], level: "?", nature: "?", moveset: [] },
  { nickname: "Journey", species: "#0874 - Stonjourner", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Rock", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Rory", species: "#0931 - Squawkabilly-blue-plumage", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Normal", "Flying", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Ori", species: "#0741 - Oricorio-baile", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Flying", "Fire", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Wyrm", species: "#0840 - Applin", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Grass", "Dragon", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Sky", species: "#0841 - Flapple", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Grass", "Dragon", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Indigo", species: "#0937 - Ceruledge", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Fire", "Ghost", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Noodle", species: "#0944 - Shroodle", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Poison", "Normal", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Hocus", species: "#0065 - Alakazam", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Psychic", "PLA"], level: "?", nature: "?", moveset: [] },
  { nickname: "Tessa", species: "#0365 - Walrein", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Ice", "Water", "PLA"], level: "?", nature: "?", moveset: [] },
  { nickname: "Tabba", species: "#0901 - Ursaluna", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Ground", "Normal", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Husk", species: "#0947 - Brambleghast", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Grass", "Ghost", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Calamari", species: "#0224 - Octillery", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Water", "PLA"], level: "?", nature: "?", moveset: [] },
  { nickname: "Gilded", species: "#0205 - Forretress", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Bug", "Steel", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Toya", species: "#0754 - Lurantis", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Grass", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Muck", species: "#0980 - Clodsire", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Poison", "Ground", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Salad", species: "#0757 - Salandit", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Poison", "Fire", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Pako", species: "#0765 - Oranguru", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Normal", "Psychic", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Cupa", species: "#0247 - Pupitar", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Rock", "Ground", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Latte", species: "#0924 - Tandemaus", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Normal", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Dunny", species: "#0982 - Dudunsparce-two-segment", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Normal", "SV"], level: "?", nature: "?", moveset: [] }, // Species was Dudunsparce, image shows it.
  { nickname: "Flutter", species: "#0987 - Flutter Mane", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Ghost", "Fairy", "SV", "Paradox"], level: "?", nature: "?", moveset: [] },
  { nickname: "Brood", species: "#0985 - Scream Tail", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Fairy", "Psychic", "Paradox", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Virtue", species: "#0049 - Venomoth", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["bug", "Poison", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Venom", species: "#0049 - Venomoth", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Bug", "Poison", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Alta", species: "#0334 - Altaria", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Dragon", "Flying", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Girl Boss", species: "#0443 - Gible", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Dragon", "Ground", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Zwelly", species: "#0634 - Zweilous", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Dark", "Dragon", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Agore", species: "#0986 - Brute Bonnet", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Grass", "Dark", "Paradox", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Brute", species: "#0986 - Brute Bonnet", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Grass", "Dark", "Paradox", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Solarflare", species: "#0988 - Slither Wing", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Bug", "Fighting", "Paradox", "SV"], level: "?", nature: "?", moveset: [] }, // Added Paradox tag
  { nickname: "Olive", species: "#0635 - Hydreigon", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Dark", "Dragon", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Salt", species: "#0934 - Garganacl", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Rock", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Shine", species: "#0970 - Glimmora", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Rock", "Poison", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Dominari", species: "#0984 - Great Tusk", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Ground", "Fighting", "Paradox", "SV"], level: "?", nature: "?", moveset: [] }, // Added Paradox tag
  { nickname: "Ion", species: "#0989 - Sandy Shocks", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Electric", "Ground", "Paradox", "SV"], level: "?", nature: "?", moveset: [] }, // Added Paradox tag
  { nickname: "Burning Sun", species: "#1005 - Roaring Moon", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Dragon", "Dark", "Paradox", "SV"], level: "?", nature: "?", moveset: [] }, // Corrected Pokedex number
  { nickname: "Poke", species: "#0025 - Pikachu", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Electric", "PLA"], level: "?", nature: "?", moveset: [] },
  { nickname: "Perry", species: "#0047 - Parasect", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Grass", "Bug", "PLA"], level: "?", nature: "?", moveset: [] },
  { nickname: "Silver", species: "#0078 - Rapidash", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Fire", "Alpha", "PLA"], level: "?", nature: "?", moveset: [] },
  { nickname: "Bluetooth", species: "#0093 - Haunter", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Ghost", "Poison", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Volo", species: "#0198 - Murkrow", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Dark", "Flying", "PLA"], level: "?", nature: "?", moveset: [] },
  { nickname: "Mirra", species: "#0198 - Murkrow", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Dark", "Flying", "PLA"], level: "?", nature: "?", moveset: [] },
  { nickname: "Qwil", species: "#0211 - Hisuian Qwilfish", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Dark", "Poison", "PLA"], level: "?", nature: "?", moveset: [] },
  { nickname: "Qwilly", species: "#0211 - Hisuian Qwilfish", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Dark", "Poison", "PLA"], level: "?", nature: "?", moveset: [] },
  { nickname: "Silk", species: "#0265 - Wurmple", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Bug", "PLA"], level: "?", nature: "?", moveset: [] },
  { nickname: "Egg", species: "#0268 - Cascoon", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Bug", "PLA"], level: "?", nature: "?", moveset: [] },
  { nickname: "Aqua", species: "#0388 - Grotle", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Grass", "Starter", "PLA"], level: "?", nature: "?", moveset: [] },
  { nickname: "Captin", species: "#0397 - Staravia", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Normal", "Flying", "PLA"], level: "?", nature: "?", moveset: [] },
  { nickname: "Feather", species: "#0397 - Staravia", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Normal", "Flying", "PLA"], level: "?", nature: "?", moveset: [] },
  { nickname: "Piolit", species: "#0398 - Staraptor", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Normal", "Flying", "PLA"], level: "?", nature: "?", moveset: [] },
  { nickname: "Key", species: "#0404 - Luxio", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Electric", "PLA"], level: "?", nature: "?", moveset: [] },
  { nickname: "Para", species: "#0441 - Chatot", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Normal", "Flying", "Alpha", "PLA"], level: "?", nature: "?", moveset: [] }, // Corrected species name
  { nickname: "Eaties", species: "#0446 - Munchlax", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Normal", "PLA"], level: "?", nature: "?", moveset: [] },
  { nickname: "Flytrap", species: "#0455 - Carnivine", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Grass", "Alpha", "PLA"], level: "?", nature: "?", moveset: [] },
  { nickname: "Sherbert", species: "#0712 - Bergmite", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Ice", "PLA"], level: "?", nature: "?", moveset: [] },
  { nickname: "Charm", species: "#0267 - Beautifly", description: "My first shiny on the switch", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Bug", "Flying", "PLA", "Favourite"], level: "?", nature: "?", moveset: [] },
  { nickname: "Razor", species: "#0461 - Weavile", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Dark", "Ice", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Steel", species: "#0208 - Steelix", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Ground", "Steel", "PLA"], level: "?", nature: "?", moveset: [] },
  { nickname: "Blackberry", species: "#0571 - Hisuian Zoroark", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Normal", "Ghost", "Alpha", "PLA"], level: "?", nature: "?", moveset: [] },
  { nickname: "Reaper", species: "#0487 - Giratina-origin", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Ghost", "Dragon", "Legendary", "SwSh"], level: "?", nature: "?", moveset: [] },
  { nickname: "Ashen", species: "#0038 - Ninetales", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Fire", "Alpha", "PLA"], level: "?", nature: "?", moveset: [] },
  { nickname: "Pumpkin", species: "#0041 - Zubat", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Poison", "Flying", "PLA"], level: "?", nature: "?", moveset: [] },
  { nickname: "Batty", species: "#0042 - Golbat", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Poison", "Flying", "PLA"], level: "?", nature: "?", moveset: [] },
  { nickname: "Anas Blue", species: "#0054 - Psyduck", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Water", "PLA"], level: "?", nature: "?", moveset: [] },
  { nickname: "Onyx", species: "#0095 - Onix", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Rock", "Ground", "PLA"], level: "?", nature: "?", moveset: [] },
  { nickname: "Lime", species: "#0108 - Lickitung", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Normal", "PLA"], level: "?", nature: "?", moveset: [] },
  { nickname: "Slaybat", species: "#0169 - Crobat", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Poison", "Flying", "PLA"], level: "?", nature: "?", moveset: [] },
  { nickname: "Pin", species: "#0172 - Pichu", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Electric", "PLA"], level: "?", nature: "?", moveset: [] },
  { nickname: "Yolk", species: "#0176 - Togetic", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Fairy", "Flying", "PLA"], level: "?", nature: "?", moveset: [] },
  { nickname: "Fraze", species: "#0362 - Glalie", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Ice", "PLA"], level: "?", nature: "?", moveset: [] },
  { nickname: "Tres", species: "#0364 - Sealeo", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Ice", "Water", "PLA"], level: "?", nature: "?", moveset: [] },
  { nickname: "Flight", species: "#0396 - Starly", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Normal", "Flying", "PLA"], level: "?", nature: "?", moveset: [] },
  { nickname: "Ivy", species: "#0406 - Budew", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Grass", "Poison", "PLA"], level: "?", nature: "?", moveset: [] },
  { nickname: "Elliott", species: "#0444 - Gabite", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Dragon", "Ground", "Alpha", "PLA"], level: "?", nature: "?", moveset: [] },
  { nickname: "Chompa", species: "#0445 - Garchomp", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Dragon", "Ground", "PLA"], level: "?", nature: "?", moveset: [] },
  { nickname: "Potas", species: "#0449 - Hippopotas", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Ground", "PLA"], level: "?", nature: "?", moveset: [] },
  { nickname: "Boldu", species: "#0450 - Hippowdon", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Ground", "PLA"], level: "?", nature: "?", moveset: [] },
  { nickname: "Angel", species: "#0458 - Mantyke", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Water", "Flying", "PLA"], level: "?", nature: "?", moveset: [] }, // Corrected Mantyke entry
  { nickname: "Doom", species: "#0477 - Dusknoir", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Ghost", "PLA"], level: "?", nature: "?", moveset: [] },
  { nickname: "Ravanger", species: "#0903 - Sneasler", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Fighting", "Poison", "PLA"], level: "?", nature: "?", moveset: [] },
  { nickname: "Melmetal", species: "#0809 - Melmetal", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Steel", "Mythical", "PoGO"], level: "?", nature: "?", moveset: [] },
  { nickname: "Azelea", species: "#0829 - Gossifleur", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Grass", "Favourite", "SwSh"], level: "?", nature: "?", moveset: [] },
  { nickname: "Skotch", species: "#0851 - Centiskorch", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Fire", "Bug", "SwSh"], level: "?", nature: "?", moveset: [] },
  { nickname: "Galla", species: "#0055 - Golduck", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Water", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Electron", species: "#0082 - Magneton", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Electric", "Steel", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Goose", species: "#0102 - Exeggcute", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Grass", "Psychic", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Duck", species: "#0103 - Alolan Exeggutor", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Grass", "Dragon", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Bio", species: "#0152 - Chikorita", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Grass", "Starter", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Foilage", species: "#0153 - Bayleef", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Grass", "Starter", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Beachball", species: "#0183 - Marill", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Water", "Fairy", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Presto", species: "#0418 - Buizel", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Water", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Bronze", species: "#0437 - Bronzong", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Steel", "Psychic", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Forest", species: "#0673 - Gogoat", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Grass", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Chorus", species: "#0747 - Mareanie", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Poison", "Water", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Sports", species: "#0766 - Passimian", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Fighting", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Teacup", species: "#0878 - Cufant", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Steel", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Gulf", species: "#0959 - Tinkaton", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Fairy", "Steel", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Mr. Wiggles", species: "#0960 - Wiglett", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Water", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Meltan", species: "#0808 - Meltan", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Steel", "Mythical", "PoGo"], level: "?", nature: "?", moveset: [] },
  { nickname: "Sweet", species: "#0134 - Vaporeon", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Water", "SV"], level: "?", nature: "?", moveset: [] }, // Corrected species name
  { nickname: "Essence", species: "#0677 - Espurr", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Psychic", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Meow Meow", species: "#0678 - Meowstic-female", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Psychic", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Champion", species: "#0068 - Machamp", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Fighting", "PLA"], level: "?", nature: "?", moveset: [] },
  { nickname: "Sunny", species: "#0136 - Flareon", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Fire", "PLA"], level: "?", nature: "?", moveset: [] },
  { nickname: "Anchove", species: "#0223 - Remoraid", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Water", "PLA"], level: "?", nature: "?", moveset: [] },
  { nickname: "Charger", species: "#0239 - Elekid", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Electric", "PLA"], level: "?", nature: "?", moveset: [] },
  { nickname: "Krick", species: "#0401 - Kricketot", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Bug", "PLA"], level: "?", nature: "?", moveset: [] },
  { nickname: "Hank", species: "#0449 - Hippopotas", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Ground", "PLA"], level: "?", nature: "?", moveset: [] },
  { nickname: "Circles", species: "#0201 - Unown", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Psychic", "Alpha", "PLA"], level: "?", nature: "?", moveset: [] },
  { nickname: "Rhyme", species: "#0866 - Mr. Rime", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Ice", "Psychic", "PLA"], level: "?", nature: "?", moveset: [] },
  { nickname: "Waffles", species: "#0780 - Drampa", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Normal", "Dragon", "SwSh"], level: "?", nature: "?", moveset: [] }, // Corrected species name
  { nickname: "Ragnarock", species: "#0075 - Graveler", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Rock", "Ground", "Alpha", "PLA"], level: "?", nature: "?", moveset: [] },
  { nickname: "Vector", species: "#0071 - Victreebel", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Grass", "Poison", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Blaine", species: "#0778 - Mimikyu-disguised", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Ghost", "Fairy", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Sunshine", species: "#0695 - Heliolisk", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Electric", "Normal", "SwSh"], level: "?", nature: "?", moveset: [] },
  { nickname: "Granitarus", species: "#0408 - Cranidos", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Rock", "Fossil", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Stega", species: "#0409 - Rampardos", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Rock", "Fossil", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Sludge", species: "#0704 - Goomy", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Dragon", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Wigoo", species: "#0705 - Sliggoo", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Dragon", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Frosty", species: "#0361 - Snorunt", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Ice", "PLA"], level: "?", nature: "?", moveset: [] },
  { nickname: "Quirl", species: "#0397 - Staravia", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Normal", "Flying", "PLA"], level: "?", nature: "?", moveset: [] },
  { nickname: "Timber", species: "#0400 - Bibarel", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Normal", "Water", "PLA"], level: "?", nature: "?", moveset: [] },
  { nickname: "Chime", species: "#0148 - Dragonair", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Dragon", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Aria", species: "#0168 - Ariados", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Bug", "Poison", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Pinecone", species: "#0204 - Pineco", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Bug", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Jane", species: "#0232 - Donphan", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Ground", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Tyrent", species: "#0248 - Tyranitar", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Rock", "Dark", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Brelee", species: "#0286 - Breloom", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Grass", "Fighting", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Belsmart", species: "#0374 - Beldum", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Steel", "Psychic", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Tango", species: "#0375 - Metang", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Steel", "Psychic", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Metaverse", species: "#0376 - Metagross", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Steel", "Psychic", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Brevis", species: "#0447 - Riolu", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Fighting", "SV"], level: "?", nature: "?", moveset: [] }, // Corrected Type Steel to Fighting
  { nickname: "Ferro Vulpis", species: "#0448 - Lucario", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Fighting", "Steel", "SV"], level: "?", nature: "?", moveset: [] }, // Corrected Type Steel to Fighting
  { nickname: "Frozin", species: "#0478 - Froslass", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Ice", "Ghost", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Season", species: "#0586 - Sawsbuck", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Normal", "Grass", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Snö", species: "#0712 - Bergmite", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Ice", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Coldaa", species: "#0712 - Bergmite", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Ice", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: ":3", species: "#0712 - Bergmite", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Ice", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Necklace", species: "#0764 - Comfey", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Fairy", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Nym", species: "#0919 - Nymble", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Bug", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Polly", species: "#0921 - Pawmi", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Electric", "Fighting", "SV"], level: "?", nature: "?", moveset: [] }, // Added Fighting type
  { nickname: "Watt", species: "#0940 - Wattrel", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Electric", "Flying", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Kilowatt", species: "#0941 - Kilowattrel", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Electric", "Flying", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Jet", species: "#0974 - Cetoddle", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Ice", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Titan", species: "#0975 - Cetitan", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Ice", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Paris", species: "#0046 - Paras", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Grass", "Bug", "PLA"], level: "?", nature: "?", moveset: [] },
  { nickname: "Charlie", species: "#0077 - Ponyta", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Fire", "PLA"], level: "?", nature: "?", moveset: [] },
  { nickname: "Seaweed", species: "#0503 - Hisuian Samurott", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Water", "Dark", "PLA", "Starter"], level: "?", nature: "?", moveset: [] }, // Added Starter tag
  { nickname: "Wisder", species: "#0899 - Wyrdeer", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Normal", "Psychic", "PLA"], level: "?", nature: "?", moveset: [] },
  { nickname: "Machette", species: "#0900 - Kleavor", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Bug", "Rock", "PLA"], level: "?", nature: "?", moveset: [] },
  { nickname: "Wally", species: "#0365 - Walrein", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Ice", "Water", "PLA"], level: "?", nature: "?", moveset: [] },
  { nickname: "Skore", species: "#0451 - Skorupi", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Poison", "Bug", "PLA"], level: "?", nature: "?", moveset: [] },
  { nickname: "Haunt", species: "#0055 - Golduck", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Water", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "King", species: "#0076 - Golem", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Rock", "Ground", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Dewlong", species: "#0087 - Dewgong", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Water", "Ice", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Shells", species: "#0090 - Shellder", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Water", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Cressa", species: "#0091 - Cloyster", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Water", "Ice", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Eli", species: "#0239 - Elekid", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Electric", "SV"], level: "?", nature: "?", moveset: [] }, // Corrected Pokedex for Elekid
  { nickname: "Swally", species: "#0317 - Swalot", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Poison", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Zango", species: "#0335 - Zangoose", description: "Zango here has the rare mark", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Normal", "SV"], level: "?", nature: "?", moveset: [] }, // Corrected species to Zangoose
  { nickname: "Frosa", species: "#0873 - Frosmoth", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Ice", "Bug", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Gholden", species: "#1000 - Gholdengo", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Steel", "Ghost", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Vampire", species: "#0041 - Zubat", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Poison", "Flying", "PLA"], level: "?", nature: "?", moveset: [] },
  { nickname: "Shelly", species: "#0422 - Shellos", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Water", "PLA"], level: "?", nature: "?", moveset: [] },
  { nickname: "Luna", species: "#0431 - Glameow", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Normal", "PLA"], level: "?", nature: "?", moveset: [] },
  { nickname: "Leaf", species: "#0459 - Snover", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Grass", "Ice", "PLA"], level: "?", nature: "?", moveset: [] }, // Corrected species name
  { nickname: "Overgloom", species: "#0904 - Overqwil", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Dark", "Poison", "PLA"], level: "?", nature: "?", moveset: [] },
  { nickname: "Aqua", species: "#0226 - Mantine", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Water", "Flying", "PLA"], level: "?", nature: "?", moveset: [] },
  { nickname: "Charger", species: "#0466 - Electivire", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Electric", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Reef", species: "#0864 - Cursola", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Ghost", "SwSh"], level: "?", nature: "?", moveset: [] },
  { nickname: "Vira", species: "#0640 - Virizion", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Grass", "Fighting", "Legendary", "SwSh"], level: "?", nature: "?", moveset: [] },
  { nickname: "Nightsky", species: "#0037 - Alolan Vulpix", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Ice", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Gary", species: "#0130 - Gyarados", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Water", "Flying", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Exeggcute", species: "#0102 - Exeggcute", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Grass", "Psychic", "SV"], level: "?", nature: "?", moveset: [] }, // Corrected type
  { nickname: "Stantler", species: "#0234 - Stantler", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Normal", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Spooksie", species: "#0353 - Shuppet", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Ghost", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Baguette", species: "#0354 - Banette", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Ghost", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Tini", species: "#0226 - Mantyke", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Water", "Flying", "SwSh"], level: "?", nature: "?", moveset: [] }, // Corrected species to Mantyke
  { nickname: "Lin", species: "#0264 - Galarian Linoone", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Dark", "Normal", "Swsh"], level: "?", nature: "?", moveset: [] }, // Corrected species name
  { nickname: "Bello", species: "#0182 - Bellossom", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Grass", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "En Garde", species: "#0282 - Gardevoir", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Psychic", "Fairy", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Ribo", species: "#0743 - Ribombee", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Bug", "Fairy", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Impi", species: "#0859 - Impidimp", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Dark", "Fairy", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Morga", species: "#0860 - Morgrem", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Dark", "Fairy", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Artist", species: "#0945 - Grafaiai", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Poison", "Normal", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Greaves", species: "#0971 - Greavard", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Ghost", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Glacies", species: "#0215 - Sneasel", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Dark", "Ice", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Sprout", species: "#0906 - Sprigatito", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Grass", "Starter", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Spoin", species: "#0325 - Spoink", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Psychic", "SV"], level: "?", nature: "?", moveset: [] }, // Corrected species, was Psychic tag itself
  { nickname: "Vibra", species: "#0329 - Vibrava", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Ground", "Dragon", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Xure", species: "#0611 - Fraxure", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Dragon", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Noisa", species: "#0714 - Noibat", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Flying", "Dragon", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Cyclaz", species: "#0967 - Cyclizar", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Dragon", "Normal", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Starride", species: "#0263 - Galarian Zigzagoon", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Dark", "Normal", "Swsh"], level: "?", nature: "?", moveset: [] },
  { nickname: "Bishup", species: "#0625 - Bisharp", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Dark", "Steel", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Cloak", species: "#0886 - Drakloak", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Dragon", "Ghost", "SV"], level: "?", nature: "?", moveset: [] },
  { nickname: "Telly", species: "#0498 - Tepig", description: "Placeholder", imageUrl: "https://via.placeholder.com/200x200.png", tags: ["Fire", "Starter", "SV"], level: "?", nature: "?", moveset: [] }
];

export const mockPokemonData: Pokemon[] = userPokemonData.map((pkm, index) => {
  const { pokedexNumber, speciesName } = parseSpeciesString(pkm.species);
  const types = extractTypesFromTags(pkm.tags);
  
  // Ensure there's always a species name, even if parsing fails slightly
  const finalSpeciesName = speciesName || pkm.species.split(' - ').pop() || "Unknown Species";

  // Handle placeholder images for new entries
  let shinySprite = pkm.imageUrl;
  if (shinySprite && shinySprite.startsWith("https://via.placeholder.com/")) {
     shinySprite = `https://placehold.co/200x200.png`;
  }


  return {
    id: pkm.idUnique !== undefined ? pkm.idUnique : index + 1000, // Fallback ID for entries without idUnique
    name: pkm.nickname,
    pokedexNumber,
    speciesName: finalSpeciesName,
    sprites: {
      default: `https://placehold.co/96x96.png`,
      shiny: shinySprite,
    },
    tags: pkm.tags,
    shinyViewed: false,
    height: 0,
    weight: 0,
    types: types.length > 0 ? types : ["Unknown"],
    abilities: ["Unknown Ability"],
    description: pkm.description,
    level: pkm.level || "?",
    nature: pkm.nature || "?",
    moveset: pkm.moveset || [],
  };
});

// Ensure all IDs are unique after transformation, especially if fallback IDs were used.
// This is a simple way to ensure uniqueness if there were collisions from fallback.
// A more robust solution might be needed if pkm.idUnique can overlap with index + 1000 range.
const finalUniquePokemonData: Pokemon[] = [];
const usedIds = new Set<number>();
let nextAvailableId = 1;

mockPokemonData.forEach(pkm => {
  let currentId = pkm.id;
  if (usedIds.has(currentId)) {
    while(usedIds.has(nextAvailableId)) {
      nextAvailableId++;
    }
    currentId = nextAvailableId;
  }
  usedIds.add(currentId);
  finalUniquePokemonData.push({ ...pkm, id: currentId });
  if (currentId >= nextAvailableId) {
    nextAvailableId = currentId + 1;
  }
});

export const fullPokemonData: Pokemon[] = finalUniquePokemonData;

    