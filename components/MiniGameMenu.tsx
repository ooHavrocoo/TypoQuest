
import React from 'react';
import { MiniGame } from '../types';
import { MINI_GAMES } from '../constants';

interface MiniGameMenuProps {
  onSelect: (game: MiniGame) => void;
  onBack: () => void;
}

const MiniGameMenu: React.FC<MiniGameMenuProps> = ({ onSelect, onBack }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 max-w-5xl mx-auto animate-in fade-in zoom-in duration-500">
      <header className="text-center mb-12">
        <button 
          onClick={onBack}
          className="mb-8 px-6 py-2 bg-slate-800 hover:bg-slate-700 text-indigo-400 rounded-full font-bold transition-all flex items-center gap-2 group"
        >
          <i className="fas fa-arrow-left group-hover:-translate-x-1 transition-transform"></i> Retour au Menu
        </button>
        <h1 className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-red-500 italic uppercase tracking-tighter">
          Zone de Mini-Jeux
        </h1>
        <p className="text-slate-400 mt-2">Entraîne tes réflexes avec des défis rapides !</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
        {MINI_GAMES.map((game) => (
          <button
            key={game.id}
            onClick={() => onSelect(game)}
            className="group relative bg-slate-900/60 border-2 border-white/5 rounded-[2.5rem] p-8 text-left hover:border-indigo-500/30 hover:scale-[1.02] transition-all duration-300 overflow-hidden"
          >
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${game.color} opacity-10 blur-2xl group-hover:opacity-20 transition-opacity`}></div>
            
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${game.color} flex items-center justify-center text-4xl mb-6 shadow-lg shadow-black/40`}>
              {game.icon}
            </div>

            <h2 className="text-2xl font-black text-white mb-2">{game.name}</h2>
            <p className="text-slate-400 text-sm leading-relaxed">{game.description}</p>
            
            <div className="mt-6 flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-widest">
              Lancer le défi <i className="fas fa-play ml-1 group-hover:translate-x-1 transition-transform"></i>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-16 text-slate-600 text-xs font-black tracking-widest">
        D'AUTRES DÉFIS ARRIVERONT BIENTÔT DANS LA GALAXIE...
      </div>
    </div>
  );
};

export default MiniGameMenu;
