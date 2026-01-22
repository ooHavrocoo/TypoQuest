
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameStats } from '../types';

interface LetterHuntGameProps {
  onFinish: (stats: GameStats) => void;
  onCancel: () => void;
}

interface FallingLetter {
  id: number;
  char: string;
  x: number;
  y: number;
  speed: number;
}

const LetterHuntGame: React.FC<LetterHuntGameProps> = ({ onFinish, onCancel }) => {
  const [letters, setLetters] = useState<FallingLetter[]>([]);
  const [score, setScore] = useState(0);
  const [missed, setMissed] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameActive, setGameActive] = useState(true);
  const [isEnding, setIsEnding] = useState(false);
  const [hasFocus, setHasFocus] = useState(true);
  
  const totalPressed = useRef(0);
  const errors = useRef(0);
  const letterIdCounter = useRef(0);
  const lastSpawnTime = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const spawnLetter = useCallback(() => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const newLetter: FallingLetter = {
      id: letterIdCounter.current++,
      char: chars[Math.floor(Math.random() * chars.length)],
      x: 10 + Math.random() * 80,
      y: -10,
      speed: 1.5 + Math.random() * 2.5
    };
    setLetters(prev => [...prev, newLetter]);
  }, []);

  useEffect(() => {
    if (!gameActive || isEnding || !hasFocus) return;

    const gameLoop = setInterval(() => {
      setLetters(prev => {
        const next = prev.map(l => ({ ...l, y: l.y + l.speed }));
        const missedCount = next.filter(l => l.y > 100).length;
        if (missedCount > 0) {
          setMissed(m => m + missedCount);
          errors.current += missedCount;
        }
        return next.filter(l => l.y <= 100);
      });

      const now = Date.now();
      if (now - lastSpawnTime.current > 1000) {
        spawnLetter();
        lastSpawnTime.current = now;
      }
    }, 50);

    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          setIsEnding(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => {
      clearInterval(gameLoop);
      clearInterval(timer);
    };
  }, [gameActive, isEnding, hasFocus, spawnLetter]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!gameActive || isEnding || !hasFocus) return;
      
      const key = e.key.toUpperCase();
      if (key.length !== 1 || !/[A-Z]/.test(key)) return;

      totalPressed.current += 1;
      
      setLetters(prev => {
        const index = prev.findIndex(l => l.char === key);
        if (index !== -1) {
          setScore(s => s + 1);
          const next = [...prev];
          next.splice(index, 1);
          return next;
        } else {
          errors.current += 1;
          return prev;
        }
      });
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [gameActive, isEnding, hasFocus]);

  useEffect(() => {
    if (isEnding) {
      setGameActive(false);
      const accuracy = totalPressed.current > 0 ? Math.round(((score) / (totalPressed.current)) * 100) : 100;
      setTimeout(() => {
          onFinish({
            wpm: Math.round(score * 2),
            accuracy: Math.max(0, accuracy),
            keysPressed: totalPressed.current,
            errors: errors.current
          });
      }, 2000);
    }
  }, [isEnding, score, onFinish]);

  const refocus = () => {
    if (containerRef.current) containerRef.current.focus();
    setHasFocus(true);
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full max-w-4xl aspect-video bg-slate-900 border-4 border-indigo-500/30 rounded-[2rem] overflow-hidden shadow-2xl outline-none" 
      tabIndex={0}
      onFocus={() => setHasFocus(true)}
      onBlur={() => setHasFocus(false)}
      onClick={refocus}
    >
      {!hasFocus && !isEnding && (
        <div className="absolute inset-0 z-[100] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center cursor-pointer">
           <div className="bg-slate-900 border-2 border-yellow-400 p-8 rounded-3xl text-center shadow-2xl">
              <div className="text-5xl mb-4">⏸️</div>
              <h2 className="text-2xl font-black text-white uppercase italic">Jeu en Pause</h2>
              <p className="text-yellow-400 font-bold mt-2">Clique ici pour reprendre la chasse !</p>
           </div>
        </div>
      )}

      {isEnding && (
        <div className="absolute inset-0 z-50 bg-slate-950/80 flex flex-col items-center justify-center animate-in zoom-in duration-300">
           <div className="text-7xl font-black text-white italic mb-4 animate-bounce">FIN DE MISSION !</div>
           <p className="text-indigo-400 font-bold uppercase tracking-widest text-xl">Calcul du score final...</p>
        </div>
      )}

      {/* Background stars */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="absolute bg-white rounded-full w-1 h-1 animate-pulse" style={{ top: `${Math.random()*100}%`, left: `${Math.random()*100}%` }}></div>
        ))}
      </div>

      {/* HUD - Increased Z-index to be above overlay */}
      <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-[110]">
        <div className="flex gap-4">
          <button 
            onClick={(e) => { e.stopPropagation(); onCancel(); }} 
            className="bg-slate-800 hover:bg-red-500 px-4 py-2 rounded-xl border border-white/10 shadow-lg transition-all flex items-center gap-2 text-white active:scale-90"
          >
            <i className="fas fa-home"></i>
            <span className="text-xs font-black uppercase">Quitter</span>
          </button>
          
          <div className="bg-slate-800/80 px-4 py-2 rounded-xl border border-white/5">
            <span className="text-[10px] block text-slate-500 font-bold uppercase">Score</span>
            <span className="text-2xl font-black text-yellow-400">{score}</span>
          </div>
        </div>
        
        <div className="text-center">
           <div className="text-4xl font-black text-white italic">{timeLeft}s</div>
           <div className="text-[10px] text-indigo-400 font-black tracking-widest uppercase">Temps Restant</div>
        </div>

        <div className="w-24"></div> 
      </div>

      {/* Letters Container */}
      <div className="absolute inset-0 pt-20">
        {letters.map(l => (
          <div 
            key={l.id}
            className="absolute flex flex-col items-center justify-center transition-all duration-75"
            style={{ left: `${l.x}%`, top: `${l.y}%` }}
          >
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg border-2 border-white/20 flex items-center justify-center text-white text-2xl font-black animate-pulse">
              {l.char}
            </div>
            <div className="w-8 h-2 bg-indigo-500/20 blur-sm rounded-full mt-2"></div>
          </div>
        ))}
      </div>

      {/* Ship at bottom */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-6xl drop-shadow-2xl z-10">
        🚀
      </div>
    </div>
  );
};

export default LetterHuntGame;
