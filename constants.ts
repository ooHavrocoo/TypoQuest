import { KeyboardLayout, Level, MiniGame } from './types';

export const AZERTY_KEYS = [
  ['²', '&', 'é', '"', "'", '(', '-', 'è', '_', 'ç', 'à', ')', '=', 'Delete'],
  ['Tab', 'A', 'Z', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '^', '$', 'Enter'],
  ['Caps', 'Q', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'ù', '*', 'Enter'],
  ['Shift', '<', 'W', 'X', 'C', 'V', 'B', 'N', ',', ';', ':', '!', 'Shift'],
  ['Ctrl', 'Alt', ' ', 'AltGr', 'Ctrl']
];

export const QWERTY_KEYS = [
  ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'Delete'],
  ['Tab', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '[', ']', '\\'],
  ['Caps', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', "'", 'Enter'],
  ['Shift', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/', 'Shift'],
  ['Ctrl', 'Alt', ' ', 'Alt', 'Ctrl']
];

export const LEVELS: Level[] = [
  { id: 1, name: "Planète des Lettres", description: "Apprends les lettres de base", difficulty: 'easy' },
  { id: 2, name: "Station Spatiale des Mots", description: "Tape des mots simples de l'espace", difficulty: 'easy' },
  { id: 3, name: "Comète Rigolote", description: "Phrases drôles générées par l'IA", difficulty: 'medium' },
  { id: 4, name: "Black Hole of Speed", description: "The ultimate speed test!", difficulty: 'hard' }
];

export const MINI_GAMES: MiniGame[] = [
  { 
    id: 'letter-hunt', 
    name: "Chasse aux Lettres", 
    description: "Des astéroïdes-lettres tombent ! Détruis-les avant qu'ils ne touchent ton vaisseau.", 
    icon: "🎯",
    color: "from-red-500 to-orange-600"
  },
  { 
    id: 'number-race', 
    name: "Course aux Chiffres", 
    description: "Tape les séquences numériques pour donner du boost à ton propulseur !", 
    icon: "🏎️",
    color: "from-blue-500 to-cyan-600"
  },
  { 
    id: 'word-rocket', 
    name: "Mots-Fusée", 
    description: "Tape des mots courts pour faire décoller ta fusée !", 
    icon: "🚀",
    color: "from-purple-500 to-pink-600"
  },
  { 
    id: 'star-link', 
    name: "Connexion Stellaire", 
    description: "Relie les étoiles entre elles en tapant les lettres qui apparaissent !", 
    icon: "✨",
    color: "from-yellow-400 to-orange-500"
  },
  { 
    id: 'color-match', 
    name: "Couleurs Alien", 
    description: "Aide l'alien à changer de couleur en tapant son nom !", 
    icon: "🌈",
    color: "from-green-400 to-emerald-600"
  }
];

export const AVATARS = [
  { id: 'alien1', icon: '👽', color: 'bg-green-400', unlockCondition: 'Initial' },
  { id: 'alien2', icon: '👾', color: 'bg-purple-400', unlockCondition: 'Initial' },
  { id: 'alien3', icon: '🤖', color: 'bg-blue-400', unlockCondition: 'Terminer Niveau 1' },
  { id: 'alien4', icon: '👻', color: 'bg-orange-400', unlockCondition: 'Terminer Niveau 2' },
  // Fixed duplicate 'icon' property by removing 'REX'
  { id: 'alien5', icon: '🦖', color: 'bg-emerald-500', unlockCondition: 'Terminer Niveau 3' },
  // Fixed duplicate 'icon' property by removing 'KING'
  { id: 'alien6', icon: '👑', color: 'bg-yellow-400', unlockCondition: 'Précision > 95%' }
];