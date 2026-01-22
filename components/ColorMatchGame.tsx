
import React, { useState, useEffect, useRef } from 'react';
import { GameStats } from '../types';

interface ColorMatchGameProps {
  onFinish: (stats: GameStats) => void;
  onCancel: () => void;
}

const COLORS = [
  { name: "ROUGE", hex: "bg-red-500", text: "text-red-400" },
  { name: "BLEU", hex: "bg-blue-500", text: "text-blue-400" },
  { name: "VERT", hex: "bg-green-500", text: "text-green-400" },
  { name: "JAUNE", hex: "bg-yellow-400", text: "text-yellow-300" },
  { name: "ROSE", hex: "bg-pink-500", text: "text-pink-400" },
  { name: "NOIR", hex: "bg-slate-900", text: "text-slate-400" }
];

const ColorMatchGame: React.FC<ColorMatchGameProps> = ({ onFinish, onCancel }) => {
  const [targetColor, setTargetColor] = useState(COLORS[0]);
  const [input, setInput] = useState("");
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameActive, setGameActive] = useState(false);
  const [score, setScore] = useState(0);
  const [shake, setShake] = useState(false);
  const [isEnding, setIsEnding] = useState(false);

  const totalPressed = useRef(0);
  const errors = useRef(0);
  const correctKeys = useRef(0);

  useEffect(() => {
    setTargetColor(COLORS[Math.floor(Math.random() * COLORS.length)]);
    setGameActive(true);
  }, []);

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
      if (char.length !== 1 || !/[A-Z]/.test(char)) return;

      totalPressed.current += 1;

      if (char === targetColor.name[input.length]) {
        correctKeys.current += 1;
        const newInput = input + char;
        setInput(newInput);

        if (newInput === targetColor.name) {
          setScore(prev => prev + 1);
          setInput("");
          setTargetColor(COLORS[Math.floor(Math.random() * COLORS.length)]);
        }
      } else {
        errors.current += 1;
        setShake(true);
        setTimeout(() => setShake(false), 300);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameActive, isEnding, targetColor, input]);

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
      className="relative w-full max-w-4xl h-[600px] bg-slate-950 border-4 border-green-500/50 rounded-[3rem] overflow-hidden shadow-2xl flex flex-col items-center outline-none"
      tabIndex={0}
    >
      {isEnding && (
        <div className="absolute inset-0 z-[120] bg-slate-950/80 flex flex-col items-center justify-center animate-in zoom-in duration-300">
           <div className="text-7xl font-black text-white italic mb-4">TEMPS ÉCOULÉ !</div>
           <p className="text-green-400 font-bold uppercase tracking-widest text-xl">L'alien a retrouvé ses couleurs !</p>
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
          
          <div className="bg-slate-900/80 px-6 py-2 rounded-2xl border border-green-500/30 backdrop-blur-md">
            <span className="text-[10px] text-green-400 font-black uppercase tracking-widest block">Énergie Alien</span>
            <div className="text-3xl font-black text-white">{score}</div>
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-4xl font-black text-white italic">{timeLeft}s</div>
          <span className="text-[10px] text-indigo-400 font-black tracking-widest uppercase">Temps Restant</span>
        </div>

        <div className="w-24"></div>
      </header>

      <div className="flex-1 w-full flex flex-col items-center justify-center relative">
        <div className={`text-9xl transition-all duration-500 ${shake ? 'animate-shake' : 'animate-float'}`}>
          <div className={`relative ${targetColor.hex} p-10 rounded-full transition-colors duration-500 shadow-[0_0_50px_rgba(255,255,255,0.1)]`}>
            👾
            <div className={`absolute inset-0 ${targetColor.hex} rounded-full blur-2xl opacity-40 animate-pulse`}></div>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center">
          <div className="flex gap-2">
             {targetColor.name.split("").map((char, i) => (
               <div 
                key={i} 
                className={`w-12 h-16 border-b-4 flex items-center justify-center text-4xl font-black transition-all
                  ${i < input.length ? targetColor.text + ' border-current' : 'text-white/20 border-white/5'}
                `}
               >
                 {char}
               </div>
             ))}
          </div>
          <p className={`mt-6 font-black tracking-[0.3em] ${targetColor.text} animate-pulse text-lg`}>
            {targetColor.name}
          </p>
        </div>
      </div>

      <div className="w-full p-6 text-center bg-slate-900/40 z-10">
         <p className="text-green-400 font-bold uppercase tracking-widest text-xs">Aide l'alien à devenir {targetColor.name} ! 🌈</p>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        .animate-shake {
          animation: shake 0.2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default ColorMatchGame;
