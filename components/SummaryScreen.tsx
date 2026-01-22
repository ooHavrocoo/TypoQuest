
import React, { useEffect, useState, useRef } from 'react';
import { GameStats, Level, UserProgression } from '../types';

interface SummaryScreenProps {
  stats: GameStats;
  level: Level;
  onSaveAndBack: (playerName: string) => void;
  progression: UserProgression;
}

const SummaryScreen: React.FC<SummaryScreenProps> = ({ stats, level, onSaveAndBack, progression }) => {
  const [showUnlocks, setShowUnlocks] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (progression.newUnlocks.levels.length > 0 || progression.newUnlocks.avatars.length > 0) {
      const timer = setTimeout(() => setShowUnlocks(true), 1000);
      return () => clearTimeout(timer);
    }
    // Auto-focus the input on mount
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [progression]);

  const getRating = () => {
    if (stats.accuracy >= 98 && stats.wpm > 35) return { label: "LÉGENDE DU COSMOS", color: "text-yellow-400", emoji: "👑", sub: "Performance divine !" };
    if (stats.accuracy >= 90) return { label: "EXPERT DE L'ESPACE", color: "text-indigo-400", emoji: "🌟", sub: "Bravo, c'est du propre !" };
    return { label: "APPRENTI ASTRONAUTE", color: "text-green-400", emoji: "👨‍🚀", sub: "Continue de t'entraîner !" };
  };

  const rating = getRating();

  const handleFinalize = () => {
    onSaveAndBack(playerName.trim() || "Astronaute");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleFinalize();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-5xl px-6 text-center animate-in fade-in zoom-in duration-700 bg-slate-900/40 border-2 border-white/5 rounded-[3rem] p-12 backdrop-blur-md shadow-2xl">
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full scale-150 animate-pulse"></div>
        <div className="relative text-8xl sm:text-9xl animate-float">{rating.emoji}</div>
      </div>

      <h1 className={`text-4xl sm:text-6xl font-black mb-2 tracking-tighter ${rating.color} drop-shadow-xl`}>
        {rating.label}
      </h1>
      <p className="text-indigo-300/60 text-lg sm:text-xl font-medium mb-10 italic">{rating.sub}</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 w-full mb-10">
        {[
          { label: "Vitesse", value: stats.wpm, unit: "MPM", icon: "⚡", color: "bg-yellow-500/10 text-yellow-400" },
          { label: "Précision", value: stats.accuracy, unit: "%", icon: "🎯", color: "bg-green-500/10 text-green-400" },
          { label: "Frappes", value: stats.keysPressed, unit: "touches", icon: "⌨️", color: "bg-blue-500/10 text-blue-400" },
          { label: "Erreurs", value: stats.errors, unit: "ratés", icon: "❌", color: "bg-red-500/10 text-red-400" },
        ].map((item, i) => (
          <div key={i} className="bg-slate-900/60 p-6 rounded-3xl border border-white/5 shadow-lg group hover:border-indigo-500/30 transition-all duration-300">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg mb-3 mx-auto ${item.color}`}>
              {item.icon}
            </div>
            <div className="text-[9px] uppercase text-slate-500 font-black tracking-widest mb-1">{item.label}</div>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-2xl sm:text-3xl font-black text-white">{item.value}</span>
              <span className="text-[10px] text-slate-500 font-bold">{item.unit}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Name Input Section */}
      <div className="mb-10 w-full max-w-md">
        <label className="block text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-3">Entre ton prénom de héros :</label>
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            maxLength={15}
            placeholder="Ton prénom..."
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full bg-slate-800 border-2 border-indigo-500/30 rounded-2xl px-6 py-4 text-white text-xl font-bold focus:outline-none focus:border-indigo-400 transition-all text-center placeholder:opacity-20"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20 text-xl">✍️</div>
        </div>
        <p className="mt-2 text-[10px] text-slate-500 italic">Appuie sur Entrée pour valider</p>
      </div>

      {/* Unlock Notifications */}
      {showUnlocks && (
        <div className="mb-10 w-full animate-in slide-in-from-bottom-10 fade-in duration-500">
          <h2 className="text-lg font-black text-white mb-6 uppercase tracking-widest flex items-center justify-center gap-4">
            <span className="h-px w-8 bg-indigo-500"></span>
            DÉBLOQUÉ !
            <span className="h-px w-8 bg-indigo-500"></span>
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            {progression.newUnlocks.levels.map(id => (
              <div key={`lvl-${id}`} className="bg-green-500/20 text-green-400 border border-green-500/30 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
                <span>🚀</span> Mission {id}
              </div>
            ))}
            {progression.newUnlocks.avatars.map(icon => (
              <div key={`av-${icon}`} className="bg-purple-500/20 text-purple-400 border border-purple-500/30 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
                <span className="text-lg">{icon}</span> Nouvel Avatar
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="w-full flex justify-center">
        <button
          onClick={handleFinalize}
          className="group relative w-full sm:w-auto px-12 py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-3xl font-black text-xl shadow-2xl shadow-indigo-600/30 transition-all duration-300 hover:scale-105 active:scale-95 overflow-hidden"
        >
          <span className="relative z-10 flex items-center justify-center gap-3 uppercase">
            Enregistrer et Terminer <i className="fas fa-arrow-right group-hover:translate-x-2 transition-transform"></i>
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
        </button>
      </div>
      
      <div className="mt-10 text-slate-500 font-medium flex items-center gap-3 animate-pulse text-sm">
        <span className="text-xl">👾</span>
        <p>"Le commandant t'attend au menu principal !"</p>
      </div>
    </div>
  );
};

export default SummaryScreen;
