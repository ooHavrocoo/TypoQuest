
import React, { useState, useEffect, useRef } from 'react';
import { GameStats } from '../types';

interface WordRocketGameProps {
  onFinish: (stats: GameStats) => void;
  onCancel: () => void;
}

const EASY_WORDS = [
  "LUNE", "MARS", "CIEL", "FEU", "BOL", "CHAT", "ROBOT", "STAR", "EAU", "TOP",
  "GAZ", "BASE", "SOL", "NAGE", "AIR", "VOL", "ALLO", "ZOOM", "VIF", "AMI"
];

const WordRocketGame: React.FC<WordRocketGameProps> = ({ onFinish, onCancel }) => {
  const [currentWord, setCurrentWord] = useState("");
  const [input, setInput] = useState("");
  const [altitude, setAltitude] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameActive, setGameActive] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [isEnding, setIsEnding] = useState(false);
  
  const totalPressed = useRef(0);
  const correctKeys = useRef(0);
  const errors = useRef(0);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setGameActive(true);
      setCurrentWord(EASY_WORDS[Math.floor(Math.random() * EASY_WORDS.length)]);
    }
  }, [countdown]);

  useEffect(() => {
    if (!gameActive || isEnding) return;
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          setIsEnding(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameActive, isEnding]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameActive || isEnding) return;
      const char = e.key.toUpperCase();
      // On n'accepte que les lettres A-Z standards pour ce mini-jeu rapide
      if (char.length !== 1 || !/[A-Z]/.test(char)) return;

      totalPressed.current += 1;

      if (char === currentWord[input.length]) {
        correctKeys.current += 1;
        const newInput = input + char;
        setInput(newInput);

        if (newInput === currentWord) {
          setAltitude(prev => prev + 10);
          setInput("");
          setCurrentWord(EASY_WORDS[Math.floor(Math.random() * EASY_WORDS.length)]);
        }
      } else {
        errors.current += 1;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameActive, isEnding, currentWord, input]);

  useEffect(() => {
    if (isEnding) {
      setGameActive(false);
      const acc = totalPressed.current > 0 ? Math.round((correctKeys.current / totalPressed.current) * 100) : 100;
      setTimeout(() => {
          onFinish({
            wpm: Math.round(correctKeys.current / 5 * 2),
            accuracy: acc,
            keysPressed: totalPressed.current,
            errors: errors.current
          });
      }, 2000);
    }
  }, [isEnding, onFinish]);

  return (
    <div 
      className="relative w-full max-w-4xl h-[600px] bg-slate-950 border-4 border-purple-500/50 rounded-[3rem] overflow-hidden shadow-2xl flex flex-col items-center outline-none"
      tabIndex={0}
    >
      {isEnding && (
        <div className="absolute inset-0 z-[120] bg-slate-950/80 flex flex-col items-center justify-center animate-in zoom-in duration-300">
           <div className="text-7xl font-black text-white italic mb-4">DÉCOLLAGE RÉUSSI !</div>
           <p className="text-purple-400 font-bold uppercase tracking-widest text-xl">Calcul de l'orbite finale...</p>
        </div>
      )}

      <header className="w-full flex justify-between p-8 relative z-[110]">
        <div className="flex gap-4">
          <button 
            onClick={(e) => { e.stopPropagation(); onCancel(); }} 
            className="bg-slate-900 hover:bg-red-500 px-6 py-2 rounded-2xl border border-white/10 transition-all flex items-center gap-2 text-white shadow-lg active:scale-90"
          >
            <i className="fas fa-home"></i>
            <span className="text-xs font-black uppercase">Quitter</span>
          </button>
          
          <div className="bg-slate-900/80 px-6 py-2 rounded-2xl border border-purple-500/30 backdrop-blur-md">
            <span className="text-[10px] text-purple-400 font-black uppercase tracking-widest block">Altitude</span>
            <div className="text-3xl font-black text-white">{altitude}m</div>
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-4xl font-black text-white italic">{timeLeft}s</div>
          <span className="text-[10px] text-indigo-400 font-black tracking-widest uppercase">Temps Restant</span>
        </div>

        <div className="w-24"></div>
      </header>

      <div className="flex-1 w-full relative">
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div 
              key={i} 
              className="absolute bg-white rounded-full w-1 h-1" 
              style={{ 
                left: `${Math.random() * 100}%`, 
                top: `${Math.random() * 100}%`,
                animation: `fall ${1.5 - (altitude/200)}s linear infinite`,
                animationDelay: `${Math.random() * 2}s`
              }}
            ></div>
          ))}
        </div>

        <div 
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center transition-all duration-500"
          style={{ transform: `translateX(-50%) translateY(${-Math.min(altitude, 200)}px)` }}
        >
          <div className="text-8xl mb-2 animate-bounce">🚀</div>
          {altitude > 0 && (
            <div className="flex flex-col gap-1 items-center">
              <div className="w-6 h-12 bg-gradient-to-t from-transparent via-orange-500 to-yellow-300 rounded-full blur-md animate-pulse"></div>
            </div>
          )}
        </div>
      </div>

      <div className="w-full bg-slate-900/90 border-t-2 border-purple-500/20 p-10 flex flex-col items-center z-10">
        <div className="flex gap-4">
          {currentWord.split("").map((char, i) => (
            <div 
              key={i} 
              className={`w-14 h-16 rounded-xl border-4 flex items-center justify-center text-3xl font-black transition-all
                ${i < input.length ? 'bg-purple-600 border-purple-300 text-white scale-90' : 
                  i === input.length ? 'bg-slate-800 border-white/50 text-white animate-pulse' : 
                  'bg-slate-950 border-white/5 text-slate-700'}
              `}
            >
              {char}
            </div>
          ))}
        </div>
        <p className="mt-4 text-purple-400 font-bold tracking-widest uppercase text-xs">Tape le mot pour décoller !</p>
      </div>

      {countdown > 0 && (
        <div className="absolute inset-0 bg-slate-950/90 z-[130] flex flex-col items-center justify-center">
          <span className="text-purple-400 text-2xl font-black mb-4 uppercase tracking-widest">Initialisation...</span>
          <div className="text-9xl font-black text-white italic animate-ping">{countdown}</div>
        </div>
      )}

      <style>{`
        @keyframes fall {
          from { transform: translateY(-100px); opacity: 0; }
          50% { opacity: 1; }
          to { transform: translateY(600px); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default WordRocketGame;
