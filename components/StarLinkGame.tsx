
import React, { useState, useEffect, useRef } from 'react';
import { GameStats } from '../types';

interface StarLinkGameProps {
  onFinish: (stats: GameStats) => void;
  onCancel: () => void;
}

interface Star {
  id: number;
  char: string;
  x: number;
  y: number;
}

const StarLinkGame: React.FC<StarLinkGameProps> = ({ onFinish, onCancel }) => {
  const [stars, setStars] = useState<Star[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameActive, setGameActive] = useState(false);
  const [score, setScore] = useState(0);
  const [isEnding, setIsEnding] = useState(false);

  const totalPressed = useRef(0);
  const errors = useRef(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateStars = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const newStars: Star[] = [];
    for (let i = 0; i < 10; i++) {
      newStars.push({
        id: i,
        char: chars[Math.floor(Math.random() * chars.length)],
        x: 15 + Math.random() * 70,
        y: 15 + Math.random() * 70
      });
    }
    return newStars;
  };

  useEffect(() => {
    setStars(generateStars());
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

      if (char === stars[currentIndex].char) {
        setScore(prev => prev + 1);
        if (currentIndex < stars.length - 1) {
          setCurrentIndex(prev => prev + 1);
        } else {
          setStars(generateStars());
          setCurrentIndex(0);
        }
      } else {
        errors.current += 1;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameActive, isEnding, stars, currentIndex]);

  useEffect(() => {
    if (isEnding) {
      setGameActive(false);
      const acc = totalPressed.current > 0 ? Math.round((score / totalPressed.current) * 100) : 100;
      setTimeout(() => {
          onFinish({
            wpm: Math.round(score * 2),
            accuracy: acc,
            keysPressed: totalPressed.current,
            errors: errors.current
          });
      }, 2000);
    }
  }, [isEnding, score, onFinish]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx || stars.length === 0) return;

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#eab308';

    if (currentIndex > 0) {
      ctx.beginPath();
      ctx.moveTo(stars[0].x * 8, stars[0].y * 6);
      for (let i = 1; i <= currentIndex; i++) {
        ctx.lineTo(stars[i].x * 8, stars[i].y * 6);
      }
      ctx.stroke();
    }
  }, [currentIndex, stars]);

  return (
    <div 
      className="relative w-full max-w-4xl h-[600px] bg-slate-950 border-4 border-yellow-500/50 rounded-[3rem] overflow-hidden shadow-2xl flex flex-col items-center outline-none"
      tabIndex={0}
    >
      {isEnding && (
        <div className="absolute inset-0 z-[120] bg-slate-950/80 flex flex-col items-center justify-center animate-in zoom-in duration-300">
           <div className="text-7xl font-black text-white italic mb-4">CONSTELLATION TRACÉE !</div>
           <p className="text-yellow-400 font-bold uppercase tracking-widest text-xl">Cartographie stellaire terminée...</p>
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
          
          <div className="bg-slate-900/80 px-6 py-2 rounded-2xl border border-yellow-500/30 backdrop-blur-md">
            <span className="text-[10px] text-yellow-400 font-black uppercase tracking-widest block">Constellations</span>
            <div className="text-3xl font-black text-white">{score}</div>
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-4xl font-black text-white italic">{timeLeft}s</div>
          <span className="text-[10px] text-indigo-400 font-black tracking-widest uppercase">Temps Restant</span>
        </div>

        <div className="w-24"></div>
      </header>

      <div className="flex-1 w-full relative">
        <canvas 
          ref={canvasRef} 
          width={800} 
          height={600} 
          className="absolute inset-0 w-full h-full"
        ></canvas>

        {stars.map((star, i) => (
          <div 
            key={i} 
            className={`absolute flex items-center justify-center transition-all duration-300
              ${i === currentIndex ? 'scale-125 z-10' : i < currentIndex ? 'opacity-50' : ''}
            `}
            style={{ left: `${star.x}%`, top: `${star.y}%` }}
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-black border-2
              ${i === currentIndex ? 'bg-yellow-400 border-white text-slate-900 shadow-[0_0_20px_#facc15]' : 
                i < currentIndex ? 'bg-indigo-500 border-indigo-300 text-white' : 
                'bg-slate-900 border-white/20 text-slate-400'}
            `}>
              {star.char}
            </div>
            {i === currentIndex && (
              <div className="absolute inset-0 w-full h-full border-4 border-yellow-400 rounded-full animate-ping"></div>
            )}
          </div>
        ))}
      </div>

      <div className="w-full p-6 text-center z-10 bg-slate-900/40">
        <p className="text-yellow-400 font-bold uppercase tracking-widest text-xs">Touche l'étoile brillante pour tracer la ligne ! ✨</p>
      </div>
    </div>
  );
};

export default StarLinkGame;
