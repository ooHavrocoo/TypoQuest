
import React from 'react';

interface ParentGuideProps {
  onClose: () => void;
}

const ParentGuide: React.FC<ParentGuideProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="bg-slate-900 w-full max-w-2xl rounded-[3rem] border-4 border-indigo-500/50 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        
        <header className="p-8 border-b border-white/5 bg-indigo-600/10 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-black text-white italic">COIN DES PARENTS 💡</h2>
            <p className="text-indigo-300 text-sm">Comment installer et utiliser TypoQuest</p>
          </div>
          <button 
            onClick={onClose}
            className="w-12 h-12 rounded-2xl bg-slate-800 hover:bg-red-500 text-white transition-all flex items-center justify-center"
          >
            <i className="fas fa-times"></i>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-8 space-y-10">
          {/* Installation Section */}
          <section className="space-y-4">
            <h3 className="text-xl font-bold text-indigo-400 flex items-center gap-2">
              <span className="text-2xl">📥</span> Installer l'application
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-800/50 p-5 rounded-2xl border border-white/5">
                <h4 className="font-black text-white text-xs uppercase mb-2">Windows 10 / 11</h4>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Dans la barre d'adresse de votre navigateur (Chrome/Edge), cliquez sur l'icône <span className="bg-indigo-500/20 text-indigo-300 px-1 rounded">➕</span> ou <span className="bg-indigo-500/20 text-indigo-300 px-1 rounded">📥</span> pour créer un raccourci sur votre bureau.
                </p>
              </div>
              <div className="bg-slate-800/50 p-5 rounded-2xl border border-white/5">
                <h4 className="font-black text-white text-xs uppercase mb-2">Linux (Debian)</h4>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Allez dans le menu (les 3 points en haut à droite) et choisissez <span className="text-white italic">"Installer TypoQuest"</span>. Le jeu apparaîtra dans vos applications.
                </p>
              </div>
            </div>
          </section>

          {/* Offline Section */}
          <section className="space-y-4">
            <h3 className="text-xl font-bold text-green-400 flex items-center gap-2">
              <span className="text-2xl">📶</span> Mode Hors Ligne
            </h3>
            <p className="text-slate-400 text-sm bg-slate-800/50 p-5 rounded-2xl border border-white/5">
              Une fois installée, l'application fonctionne **sans internet**. Idéal pour les voyages ou pour limiter l'exposition web des enfants.
            </p>
          </section>

          {/* Keyboard Layout Section */}
          <section className="space-y-4">
            <h3 className="text-xl font-bold text-yellow-400 flex items-center gap-2">
              <span className="text-2xl">⌨️</span> AZERTY ou QWERTY ?
            </h3>
            <p className="text-slate-400 text-sm">
              Par défaut, l'app est en **AZERTY** (clavier français). Si vous avez un clavier international, changez-le dans le menu principal avant de commencer.
            </p>
          </section>

          {/* Security/Privacy */}
          <section className="space-y-4">
            <h3 className="text-xl font-bold text-purple-400 flex items-center gap-2">
              <span className="text-2xl">🛡️</span> Sécurité
            </h3>
            <p className="text-slate-400 text-sm">
              Aucune donnée personnelle n'est envoyée sur un serveur. Les scores et la progression sont stockés uniquement sur **votre** ordinateur.
            </p>
          </section>
        </div>

        <footer className="p-6 bg-slate-950 flex justify-center border-t border-white/5">
          <button 
            onClick={onClose}
            className="px-10 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black transition-all shadow-xl shadow-indigo-600/20 uppercase tracking-widest"
          >
            J'ai compris !
          </button>
        </footer>
      </div>
    </div>
  );
};

export default ParentGuide;
