
import React, { useState, useEffect } from 'react';
import { KeyboardLayout, Level, UserProgression, HighScore } from '../types';
import { LEVELS, AVATARS } from '../constants';
import ParentGuide from './ParentGuide';

interface MainMenuProps {
  onStart: (level: Level, layout: KeyboardLayout, avatar: string) => void;
  onGoToMiniGames: () => void;
  selectedLayout: KeyboardLayout;
  setSelectedLayout: (l: KeyboardLayout) => void;
  selectedAvatar: string;
  setSelectedAvatar: (a: string) => void;
  progression: UserProgression;
  highScores: HighScore[];
}

const MainMenu: React.FC<MainMenuProps> = ({ 
  onStart, 
  onGoToMiniGames,
  selectedLayout, 
  setSelectedLayout,
  selectedAvatar,
  setSelectedAvatar,
  progression,
  highScores
}) => {
  const [showScores, setShowScores] = useState(false);
  const [showParentGuide, setShowParentGuide] = useState(false);
  const [installable, setInstallable] = useState(false);

  useEffect(() => {
    const checkInstallable = () => {
      if ((window as any).deferredPrompt) {
        setInstallable(true);
      }
    };
    
    checkInstallable();
    window.addEventListener('beforeinstallprompt', checkInstallable);
    return () => window.removeEventListener('beforeinstallprompt', checkInstallable);
  }, []);

  const handleInstallClick = async () => {
    const promptEvent = (window as any).deferredPrompt;
    if (!promptEvent) return;
    
    promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;
    console.log(`User response to install prompt: ${outcome}`);
    (window as any).deferredPrompt = null;
    setInstallable(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 max-w-6xl mx-auto space-y-12 animate-in fade-in duration-700">
      
      {showParentGuide && <ParentGuide onClose={() => setShowParentGuide(false)} />}

      <header className="text-center space-y-4 relative">
        <h1 className="text-6xl sm:text-8xl font-black bg-clip-text text-transparent bg-gradient-to-br from-blue-400 via-indigo-400 to-purple-500 drop-shadow-2xl italic tracking-tighter">
          TYPOQUEST
        </h1>
        <p className="text-xl text-indigo-300 font-medium tracking-wide">L'aventure commence ici ! 🚀</p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
          {installable && (
            <button 
              onClick={handleInstallClick}
              className="px-6 py-2 bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 hover:text-white rounded-full border border-indigo-500/50 transition-all text-xs font-bold uppercase tracking-widest flex items-center gap-2"
            >
              <i className="fas fa-download"></i> Installer
            </button>
          )}
          <button 
            onClick={() => setShowParentGuide(true)}
            className="px-6 py-2 bg-slate-800/50 hover:bg-slate-700 text-slate-300 hover:text-white rounded-full border border-white/10 transition-all text-xs font-bold uppercase tracking-widest flex items-center gap-2"
          >
            <i className="fas fa-lightbulb"></i> Aide Parents
          </button>
        </div>
      </header>

      {/* High Scores Modal Overlay */}
      {showScores && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in zoom-in duration-300">
          <div className="bg-slate-900 w-full max-w-3xl rounded-[2.5rem] border-2 border-indigo-500/30 overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
            <div className="p-8 border-b border-white/10 flex justify-between items-center bg-indigo-600/10">
              <h2 className="text-3xl font-black text-white flex items-center gap-3 italic">
                <span className="text-yellow-400">🏆</span> PANTHÉON GALACTIQUE
              </h2>
              <button 
                onClick={() => setShowScores(false)}
                className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-white hover:bg-slate-700 transition-colors"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 space-y-4">
              {highScores.length === 0 ? (
                <div className="text-center py-20 text-slate-500">
                  <div className="text-6xl mb-4">🛸</div>
                  <p className="text-xl">Pas encore de scores ! Termine une mission pour apparaître ici.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-slate-500 text-[10px] uppercase tracking-widest font-black border-b border-white/5">
                        <th className="pb-4">Rang</th>
                        <th className="pb-4">Pilote</th>
                        <th className="pb-4">Mission</th>
                        <th className="pb-4">WPM</th>
                        <th className="pb-4">Précision</th>
                        <th className="pb-4">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {highScores.map((score, idx) => (
                        <tr key={idx} className="border-b border-white/5 group hover:bg-white/5 transition-colors">
                          <td className="py-4 font-black text-indigo-400">#{idx + 1}</td>
                          <td className="py-4">
                            <div className="flex items-center gap-2">
                              <span className="text-xl">👨‍🚀</span>
                              <span className="font-black text-indigo-200">{score.playerName}</span>
                            </div>
                          </td>
                          <td className="py-4 font-bold text-white">{score.levelName}</td>
                          <td className="py-4 font-black text-yellow-400">{score.wpm} <span className="text-[10px] font-normal text-slate-500">MPM</span></td>
                          <td className="py-4 font-black text-green-400">{score.accuracy}%</td>
                          <td className="py-4 text-[10px] text-slate-500 uppercase font-bold">{score.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            
            <div className="p-6 bg-slate-950 flex justify-center border-t border-white/5">
              <button 
                onClick={() => setShowScores(false)}
                className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold transition-all"
              >
                C'est compris !
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 w-full items-start">
        {/* Left column: Configuration & High Score Toggle */}
        <section className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900/40 p-8 rounded-[2.5rem] border-2 border-white/5 backdrop-blur-xl shadow-2xl space-y-8">
            <div className="grid grid-cols-2 gap-4">
               <button 
                onClick={() => setShowScores(true)}
                className="py-4 px-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-2xl flex flex-col items-center justify-center group hover:scale-[1.05] transition-all"
              >
                <span className="text-3xl mb-2 group-hover:rotate-12 transition-transform">🏆</span>
                <h3 className="font-black text-white text-[10px] uppercase tracking-tighter">Records</h3>
              </button>

              <button 
                onClick={onGoToMiniGames}
                className="py-4 px-4 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-2xl flex flex-col items-center justify-center group hover:scale-[1.05] transition-all"
              >
                <span className="text-3xl mb-2 group-hover:rotate-12 transition-transform">🎯</span>
                <h3 className="font-black text-white text-[10px] uppercase tracking-tighter">Mini-Jeux</h3>
              </button>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-6 text-slate-300 uppercase tracking-widest flex items-center gap-3">
                <span className="p-2 bg-indigo-500/20 rounded-lg">⌨️</span> Clavier
              </h2>
              <div className="flex gap-4">
                {['AZERTY', 'QWERTY'].map((l) => (
                  <button
                    key={l}
                    onClick={() => setSelectedLayout(l as KeyboardLayout)}
                    className={`flex-1 py-4 rounded-2xl font-bold transition-all duration-300 border-b-4 ${
                      selectedLayout === l 
                      ? 'bg-indigo-600 border-indigo-800 text-white scale-105 shadow-lg shadow-indigo-600/30' 
                      : 'bg-slate-800 border-slate-950 text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-6 text-slate-300 uppercase tracking-widest flex items-center gap-3">
                <span className="p-2 bg-purple-500/20 rounded-lg">👤</span> Pilote
              </h2>
              <div className="grid grid-cols-3 gap-4">
                {AVATARS.map((a) => {
                  const isLocked = !progression.unlockedAvatars.includes(a.icon);
                  return (
                    <button
                      key={a.id}
                      disabled={isLocked}
                      onClick={() => setSelectedAvatar(a.icon)}
                      title={isLocked ? `Verrouillé: ${a.unlockCondition}` : a.id}
                      className={`relative aspect-square flex flex-col items-center justify-center rounded-2xl transition-all duration-300 overflow-hidden ${
                        selectedAvatar === a.icon && !isLocked
                        ? `${a.color} scale-110 shadow-xl shadow-white/10 ring-4 ring-white/50 z-10` 
                        : isLocked 
                        ? 'bg-slate-950/50 grayscale opacity-40 cursor-not-allowed border border-white/5' 
                        : 'bg-slate-800 hover:bg-slate-700'
                      }`}
                    >
                      <span className="text-4xl mb-1">{isLocked ? '🔒' : a.icon}</span>
                      {isLocked && <span className="text-[8px] text-white/60 font-bold px-1 text-center leading-tight uppercase">{a.unlockCondition}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Right column: Missions */}
        <section className="lg:col-span-7 space-y-6">
          <h2 className="text-xl font-bold text-slate-300 uppercase tracking-widest flex items-center gap-3 ml-2">
            <span className="p-2 bg-green-500/20 rounded-lg">🚀</span> Missions Disponibles
          </h2>
          <div className="grid grid-cols-1 gap-4">
            {LEVELS.map((level) => {
              const isLocked = !progression.unlockedLevels.includes(level.id);
              return (
                <button
                  key={level.id}
                  disabled={isLocked}
                  onClick={() => onStart(level, selectedLayout, selectedAvatar)}
                  className={`group relative flex items-center gap-6 p-6 rounded-3xl border-2 transition-all duration-300 text-left ${
                    isLocked 
                    ? 'bg-slate-950/30 border-white/5 opacity-50 cursor-not-allowed grayscale' 
                    : 'bg-slate-900/60 border-indigo-500/20 hover:border-indigo-400 hover:translate-x-3 hover:bg-slate-800/80 shadow-lg'
                  }`}
                >
                  <div className={`w-16 h-16 shrink-0 rounded-2xl flex items-center justify-center text-3xl transition-transform group-hover:rotate-12 ${
                    isLocked ? 'bg-slate-800' : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'
                  }`}>
                    {isLocked ? '🔒' : level.id}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className={`font-black text-xl tracking-tight ${isLocked ? 'text-slate-600' : 'text-white'}`}>
                        {level.name}
                      </h3>
                      {!isLocked && (
                         <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                          level.difficulty === 'easy' ? 'bg-green-500/20 text-green-400' :
                          level.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {level.difficulty}
                        </span>
                      )}
                    </div>
                    <p className={`text-sm mt-1 font-medium ${isLocked ? 'text-slate-700' : 'text-indigo-300/60'}`}>
                      {isLocked ? `Termine la mission précédente pour débloquer !` : level.description}
                    </p>
                  </div>

                  {!isLocked && (
                    <div className="text-2xl text-indigo-400 group-hover:translate-x-2 transition-transform opacity-0 group-hover:opacity-100">
                      <i className="fas fa-chevron-right"></i>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </section>
      </div>

      <footer className="text-slate-600 text-sm font-medium pt-8 flex items-center gap-4">
        <div className="h-px w-12 bg-slate-800"></div>
        <span>UN JEU POUR LES FUTURS ASTRONAUTES</span>
        <div className="h-px w-12 bg-slate-800"></div>
      </footer>
    </div>
  );
};

export default MainMenu;
