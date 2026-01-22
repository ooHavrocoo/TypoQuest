
import React, { useState, useEffect, useRef } from 'react';
import { GameStats } from '../types';

interface NumberRaceGameProps {
  onFinish: (stats: GameStats) => void;
  onCancel: () => void;
}

const NumberRaceGame: React.FC<NumberRaceGameProps> = ({ onFinish, onCancel }) => {
  const [sequence, setSequence] = useState<string>("");
  const [input, setInput] = useState<string>("");
  const [progress, setProgress] = useState(0); 
  const [timeLeft, setTimeLeft] = useState(25);
  const [gameActive, setGameActive] = useState(false);
  const [showCountdown, setShowCountdown] = useState(3);
  const [isError, setIsError] = useState(false);
  const [combo, setCombo] = useState(0);
  const [isEnding, setIsEnding] = useState(false);
  
  const totalPressed = useRef(0);
  const errors = useRef(0);
  const correctKeys = useRef(0);

  const generateSequence = (length = 4) => {
    let s = "";
    for(let i=0; i < length; i++) s += Math.floor(Math.random()*10).toString();
    return s;
  };

  useEffect(() => {
    if (showCountdown > 0) {
      const timer = setTimeout(() => setShowCountdown(showCountdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setGameActive(true);
      setSequence(generateSequence());
    }
  }, [showCountdown]);

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
      if (!/^[0-9]$/.test(e.key)) return;
      
      const char = e.key;
      totalPressed.current += 1;
      
      if (char === sequence[input.length]) {
        correctKeys.current += 1;
        const newInput = input + char;
        setInput(newInput);
        setCombo(prev => prev + 1);
        
        if (newInput === sequence) {
          const bonus = 10 + Math.min(combo, 10);
          const newProgress = Math.min(100, progress + bonus);
          setProgress(newProgress);
          if (newProgress >= 100) {
            setIsEnding(true);
          } else {
            setSequence(generateSequence(sequence.length < 8 ? sequence.length + 1 : 8));
            setInput("");
          }
        }
      } else {
        errors.current += 1;
        setCombo(0);
        setIsError(true);
        setTimeout(() => setIsError(false), 300);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameActive, isEnding, sequence, input, progress, combo]);

  useEffect(() => {
    if (isEnding) {
      setGameActive(false);
      const accuracy = totalPressed.current > 0 ? Math.round(((correctKeys.current) / totalPressed.current) * 100) : 100;
      setTimeout(() => {
          onFinish({
            wpm: Math.round(correctKeys.current * 2.4), 
            accuracy: Math.max(0, accuracy),
            keysPressed: totalPressed.current,
            errors: errors.current
          });
      }, 2000);
    }
  }, [isEnding, onFinish]);

  return (
    <div className={`relative w-full max-w-4xl bg-slate-950 border-4 rounded-[3rem] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col items-center transition-all duration-300 ${isError ? 'border-red-500 animate-shake' : 'border-cyan-500/50'} outline-none`}
         tabIndex={0}
    >
      {isEnding && (
        <div className="absolute inset-0 z-[120] bg-slate-950/80 flex flex-col items-center justify-center animate-in zoom-in duration-300 text-center px-4">
           <div className="text-7xl font-black text-white italic mb-4">LIGNE D'ARRIVÉE !</div>
           <p className="text-cyan-400 font-bold uppercase tracking-widest text-xl">Calcul de la vitesse de propulsion...</p>
        </div>
      )}

      <div className="absolute inset-0 pointer-events-none opacity-40">
        {[...Array(30)].map((_, i) => (
          <div key={i} className={`absolute bg-white rounded-full ${gameActive ? 'animate-pulse' : ''}`} 
               style={{ 
                 width: Math.random() * 3 + 'px', 
                 height: Math.random() * 3 + 'px', 
                 top: Math.random() * 100 + '%', 
                 left: Math.random() * 100 + '%',
                 animationDuration: (0.5 + Math.random() * 2) + 's'
               }}></div>
        ))}
      </div>

      <header className="w-full flex justify-between items-center p-8 relative z-[110]">
        <div className="flex gap-4">
           <button 
            onClick={(e) => { e.stopPropagation(); onCancel(); }} 
            className="bg-slate-900 hover:bg-red-500 px-6 py-2 rounded-2xl border border-white/10 transition-all flex items-center gap-2 group text-white shadow-lg active:scale-90"
          >
            <i className="fas fa-home"></i>
            <span className="text-xs font-black uppercase">Quitter</span>
          </button>
          
           <div className="bg-slate-900/80 px-6 py-2 rounded-2xl border border-cyan-500/30 backdrop-blur-md">
            <span className="text-[10px] text-cyan-400 font-black uppercase tracking-widest block">Chrono</span>
            <div className={`text-3xl font-black ${timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-white'}`}>{timeLeft}s</div>
          </div>
        </div>
        
        <div className="bg-slate-900/80 px-6 py-2 rounded-2xl border border-yellow-500/30 backdrop-blur-md">
          <span className="text-[10px] text-yellow-400 font-black uppercase tracking-widest block">Combo</span>
          <div className="text-3xl font-black text-white">x{combo}</div>
        </div>
      </header>

      <div className="w-full h-48 relative flex items-center overflow-hidden px-10 mb-8">
        <div className="absolute inset-x-0 h-1 bg-cyan-500/20 top-1/2 -translate-y-1/2"></div>
        <div className="absolute inset-x-0 h-24 border-y-2 border-white/5 top-1/2 -translate-y-1/2 bg-gradient-to-b from-cyan-500/5 to-transparent"></div>
        
        <div className="absolute inset-0 flex justify-between pointer-events-none opacity-20">
           {[...Array(12)].map((_, i) => (
             <div key={i} className={`h-full w-px bg-cyan-400 ${gameActive ? 'animate-move-grid' : ''}`} 
                  style={{ animationDelay: `${i * 0.2}s` }}></div>
           ))}
        </div>
        
        <div 
          className="relative text-7xl transition-all duration-700 ease-out z-20 flex items-center"
          style={{ left: `${progress}%`, transform: 'translateX(-50%)' }}
        >
          <div className="relative">
            🚀
            {gameActive && (
              <div className="absolute -left-14 top-1/2 -translate-y-1/2 flex items-center gap-1 scale-x-[-1]">
                <div className={`h-6 bg-orange-500 rounded-full blur-md transition-all ${combo > 5 ? 'w-16 bg-blue-400' : 'w-10'}`}></div>
                <div className={`h-4 bg-yellow-300 rounded-full blur-sm animate-ping ${combo > 5 ? 'w-10 bg-cyan-200' : 'w-6'}`}></div>
              </div>
            )}
          </div>
        </div>
        
        <div className="absolute right-8 top-1/2 -translate-y-1/2 text-5xl z-10 filter drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]">
          🏁
        </div>
      </div>

      <div className="relative z-10 w-full max-w-2xl bg-slate-900/80 p-10 rounded-[2.5rem] border border-white/10 backdrop-blur-xl mb-12 shadow-2xl">
        <div className="flex flex-col items-center gap-8">
          <h3 className="text-cyan-400 text-sm font-black uppercase tracking-widest">Séquence de Boost</h3>
          
          <div className="flex gap-4">
            {sequence.split("").map((num, i) => (
              <div 
                key={i} 
                className={`w-16 h-20 rounded-2xl flex items-center justify-center text-5xl font-black border-4 transition-all duration-150
                  ${i < input.length ? 'bg-cyan-500 border-cyan-300 text-white scale-90 shadow-[0_0_20px_rgba(34,211,238,0.5)]' : 
                    i === input.length ? 'bg-slate-800 border-white/40 text-white animate-pulse' : 
                    'bg-slate-950 border-white/5 text-slate-700'}
                `}
              >
                {num}
              </div>
            ))}
          </div>

          <p className="text-slate-500 font-bold italic text-center">
            {combo > 5 ? "VITESSE LUMIÈRE ACTIVÉE ! 🔥" : "Tape les chiffres pour accélérer !"}
          </p>
        </div>
      </div>

      {showCountdown > 0 && (
        <div className="absolute inset-0 bg-slate-950/90 z-[130] flex flex-col items-center justify-center text-white">
           <span className="text-2xl font-bold text-cyan-400 mb-4 tracking-widest uppercase">Préparez-vous</span>
           <div className="text-9xl font-black italic animate-bounce">{showCountdown}</div>
        </div>
      )}

      <style>{`
        @keyframes move-grid {
          0% { transform: translateX(100px); opacity: 0; }
          50% { opacity: 0.2; }
          100% { transform: translateX(-100px); opacity: 0; }
        }
        .animate-move-grid {
          animation: move-grid 1s linear infinite;
        }
        @keyframes shake {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(-5px, 0); }
          50% { transform: translate(5px, 0); }
          75% { transform: translate(-5px, 0); }
        }
        .animate-shake {
          animation: shake 0.2s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default NumberRaceGame;
