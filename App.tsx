
import React, { useState, useEffect } from 'react';
import { GameState, KeyboardLayout, Level, GameStats, UserProgression, HighScore, MiniGame } from './types';
import MainMenu from './components/MainMenu';
import GameScreen from './components/GameScreen';
import SummaryScreen from './components/SummaryScreen';
import MiniGameMenu from './components/MiniGameMenu';
import LetterHuntGame from './components/LetterHuntGame';
import NumberRaceGame from './components/NumberRaceGame';
import WordRocketGame from './components/WordRocketGame';
import StarLinkGame from './components/StarLinkGame';
import ColorMatchGame from './components/ColorMatchGame';
import Tutorial from './components/Tutorial';

const PROGRESSION_KEY = 'typoquest_progression';
const HIGHSCORES_KEY = 'typoquest_highscores';

const INITIAL_PROGRESSION: UserProgression = {
  unlockedLevels: [1],
  unlockedAvatars: ['👽', '👾'],
  hasCompletedTutorial: false,
  newUnlocks: { levels: [], avatars: [] }
};

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('START');
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
  const [selectedMiniGame, setSelectedMiniGame] = useState<MiniGame | null>(null);
  const [layout, setLayout] = useState<KeyboardLayout>('AZERTY');
  const [avatar, setAvatar] = useState('👽');
  const [stats, setStats] = useState<GameStats | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);
  
  const [progression, setProgression] = useState<UserProgression>(() => {
    const saved = localStorage.getItem(PROGRESSION_KEY);
    return saved ? JSON.parse(saved) : INITIAL_PROGRESSION;
  });

  const [highScores, setHighScores] = useState<HighScore[]>(() => {
    const saved = localStorage.getItem(HIGHSCORES_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    if (!progression.hasCompletedTutorial) {
      setShowTutorial(true);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(PROGRESSION_KEY, JSON.stringify({
      ...progression,
      newUnlocks: { levels: [], avatars: [] }
    }));
  }, [progression]);

  useEffect(() => {
    localStorage.setItem(HIGHSCORES_KEY, JSON.stringify(highScores));
  }, [highScores]);

  const handleStartLevel = (level: Level, l: KeyboardLayout, a: string) => {
    setSelectedLevel(level);
    setLayout(l);
    setAvatar(a);
    setGameState('PLAYING');
  };

  const handleStartMiniGame = (game: MiniGame) => {
    setSelectedMiniGame(game);
    setGameState('MINIGAME_PLAYING');
  };

  const handleFinish = (finalStats: GameStats) => {
    setStats(finalStats);
    
    if (selectedLevel) {
      const newUnlockedLevels = [...progression.unlockedLevels];
      const newUnlockedAvatars = [...progression.unlockedAvatars];
      const justUnlockedLevels: number[] = [];
      const justUnlockedAvatars: string[] = [];

      const nextLevelId = selectedLevel.id + 1;
      if (nextLevelId <= 4 && !newUnlockedLevels.includes(nextLevelId)) {
        newUnlockedLevels.push(nextLevelId);
        justUnlockedLevels.push(nextLevelId);
      }

      if (selectedLevel.id === 1 && !newUnlockedAvatars.includes('🤖')) {
        newUnlockedAvatars.push('🤖');
        justUnlockedAvatars.push('🤖');
      }
      if (selectedLevel.id === 2 && !newUnlockedAvatars.includes('👻')) {
        newUnlockedAvatars.push('👻');
        justUnlockedAvatars.push('👻');
      }
      if (selectedLevel.id === 3 && !newUnlockedAvatars.includes('🦖')) {
        newUnlockedAvatars.push('🦖');
        justUnlockedAvatars.push('🦖');
      }
      if (finalStats.accuracy >= 95 && !newUnlockedAvatars.includes('👑')) {
        newUnlockedAvatars.push('👑');
        justUnlockedAvatars.push('👑');
      }

      setProgression(prev => ({
        ...prev,
        unlockedLevels: newUnlockedLevels,
        unlockedAvatars: newUnlockedAvatars,
        newUnlocks: { levels: justUnlockedLevels, avatars: justUnlockedAvatars }
      }));
    } else {
        setProgression(prev => ({ ...prev, newUnlocks: { levels: [], avatars: [] } }));
    }
    
    setGameState('SUMMARY');
  };

  const handleSaveScoreAndBack = (playerName: string) => {
    if ((selectedLevel || selectedMiniGame) && stats) {
      const now = new Date();
      const levelId = selectedLevel ? selectedLevel.id : (selectedMiniGame?.id || "MG");
      const levelName = selectedLevel ? selectedLevel.name : (selectedMiniGame?.name || "Mini-Jeu");
      
      const newScore: HighScore = {
        levelId,
        levelName,
        playerName: playerName || "Astronaute",
        wpm: stats.wpm,
        accuracy: stats.accuracy,
        date: now.toLocaleDateString('fr-FR'),
        timestamp: now.getTime()
      };
      
      setHighScores(prev => {
        const updated = [...prev, newScore];
        return updated.sort((a, b) => {
          if (b.wpm !== a.wpm) return b.wpm - a.wpm;
          if (b.accuracy !== a.accuracy) return b.accuracy - a.accuracy;
          return (b.timestamp || 0) - (a.timestamp || 0);
        }).slice(0, 10);
      });
    }

    setGameState('START');
    setStats(null);
    setSelectedLevel(null);
    setSelectedMiniGame(null);
  };

  const completeTutorial = () => {
    setProgression(prev => ({ ...prev, hasCompletedTutorial: true }));
    setShowTutorial(false);
  };

  const renderMiniGame = () => {
    const backToMenu = () => setGameState('MINIGAME_MENU');
    
    switch (selectedMiniGame?.id) {
      case 'letter-hunt':
        return <LetterHuntGame onFinish={handleFinish} onCancel={backToMenu} />;
      case 'number-race':
        return <NumberRaceGame onFinish={handleFinish} onCancel={backToMenu} />;
      case 'word-rocket':
        return <WordRocketGame onFinish={handleFinish} onCancel={backToMenu} />;
      case 'star-link':
        return <StarLinkGame onFinish={handleFinish} onCancel={backToMenu} />;
      case 'color-match':
        return <ColorMatchGame onFinish={handleFinish} onCancel={backToMenu} />;
      default:
        return null;
    }
  };

  return (
    <main className="min-h-screen relative bg-slate-950">
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20">
        {[...Array(50)].map((_, i) => (
          <div 
            key={i} 
            className="absolute bg-white rounded-full" 
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 3}px`,
              height: `${Math.random() * 3}px`,
              animation: `pulse ${2 + Math.random() * 5}s infinite`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 container mx-auto">
        {gameState === 'START' && (
          <MainMenu 
            onStart={handleStartLevel} 
            onGoToMiniGames={() => setGameState('MINIGAME_MENU')}
            selectedLayout={layout} 
            setSelectedLayout={setLayout}
            selectedAvatar={avatar}
            setSelectedAvatar={setAvatar}
            progression={progression}
            highScores={highScores}
          />
        )}

        {showTutorial && <Tutorial onComplete={completeTutorial} />}

        {gameState === 'MINIGAME_MENU' && (
          <MiniGameMenu onSelect={handleStartMiniGame} onBack={() => setGameState('START')} />
        )}

        {gameState === 'MINIGAME_PLAYING' && (
           <div className="flex items-center justify-center min-h-screen p-4">
              {renderMiniGame()}
           </div>
        )}

        {gameState === 'PLAYING' && selectedLevel && (
          <div className="flex items-center justify-center min-h-screen">
            <GameScreen 
              level={selectedLevel} 
              layout={layout} 
              avatar={avatar}
              onFinish={handleFinish}
              onBack={() => setGameState('START')}
            />
          </div>
        )}

        {gameState === 'SUMMARY' && stats && (selectedLevel || selectedMiniGame) && (
          <div className="flex items-center justify-center min-h-screen py-10">
            <SummaryScreen 
              stats={stats} 
              level={selectedLevel || { id: 0, name: selectedMiniGame!.name, description: "", difficulty: "easy" }} 
              onSaveAndBack={handleSaveScoreAndBack}
              progression={progression}
            />
          </div>
        )}
      </div>
    </main>
  );
};

export default App;
