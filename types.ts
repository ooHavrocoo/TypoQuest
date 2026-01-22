
export type KeyboardLayout = 'AZERTY' | 'QWERTY';

export type GameState = 'START' | 'PLAYING' | 'SUMMARY' | 'MINIGAME_MENU' | 'MINIGAME_PLAYING';

// Missing MusicStyle type used for managing background music themes
export type MusicStyle = 'COSMIC_SYNTH' | 'GALACTIC_AMBIENT' | '8BIT_ADVENTURE';

export interface Level {
  id: number;
  name: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface MiniGame {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export interface Achievement {
  id: string;
  title: string;
  icon: string;
  unlocked: boolean;
}

export interface GameStats {
  wpm: number;
  accuracy: number;
  keysPressed: number;
  errors: number;
}

export interface HighScore {
  levelId: number | string;
  levelName: string;
  playerName: string;
  wpm: number;
  accuracy: number;
  date: string;
  timestamp: number;
}

export interface UserProgression {
  unlockedLevels: number[];
  unlockedAvatars: string[];
  hasCompletedTutorial: boolean;
  newUnlocks: {
    levels: number[];
    avatars: string[];
  };
}
