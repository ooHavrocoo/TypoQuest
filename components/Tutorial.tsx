
import React, { useState } from 'react';

interface TutorialProps {
  onComplete: () => void;
}

const Tutorial: React.FC<TutorialProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: "Bienvenue, Recrue !",
      text: "Je suis ROB-O, ton guide pour cette aventure. Prêt à devenir le meilleur pilote de clavier de la galaxie ?",
      icon: "🤖",
      position: "center",
    },
    {
      title: "Choisis ton Clavier",
      text: "Ici, tu peux choisir entre AZERTY (France) ou QWERTY (International). Sélectionne celui qui ressemble au tien !",
      icon: "⌨️",
      highlight: "keyboard-layout",
    },
    {
      title: "Ton Avatar de Pilote",
      text: "C'est toi ! Tu débloqueras de nouveaux amis en terminant des missions ou en étant très précis.",
      icon: "👤",
      highlight: "avatar-selector",
    },
    {
      title: "Tes Missions",
      text: "Clique sur une mission pour commencer. Les premières sont faciles pour s'échauffer !",
      icon: "🚀",
      highlight: "mission-list",
    },
    {
      title: "Score et Combo",
      text: "Tape sans faire d'erreur pour faire grimper ton COMBO ! Plus il est haut, plus tu gagnes de points.",
      icon: "⚡",
      position: "center",
    },
    {
      title: "C'est parti !",
      text: "La galaxie a besoin de pilotes rapides. Bonne chance, astronaute !",
      icon: "✨",
      position: "center",
    }
  ];

  const nextStep = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  const currentStep = steps[step];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-500">
      {/* Visual guidance arrow or box logic could go here if we had specific IDs in MainMenu */}
      <div className="relative max-w-lg w-full bg-slate-900 border-4 border-indigo-500 rounded-[3rem] p-10 shadow-2xl shadow-indigo-500/20 flex flex-col items-center text-center animate-in zoom-in slide-in-from-bottom-10 duration-500">
        <div className="absolute -top-16 text-8xl animate-float">
          {currentStep.icon}
        </div>
        
        <div className="mt-8 space-y-4">
          <h2 className="text-3xl font-black text-indigo-400 uppercase tracking-tighter italic">
            {currentStep.title}
          </h2>
          <p className="text-lg text-slate-300 font-medium leading-relaxed">
            {currentStep.text}
          </p>
        </div>

        <div className="mt-10 flex gap-4 w-full">
          <button 
            onClick={nextStep}
            className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-indigo-600/30"
          >
            {step === steps.length - 1 ? "DÉCOLLAGE !" : "SUIVANT"}
          </button>
        </div>

        <div className="mt-6 flex gap-2">
          {steps.map((_, i) => (
            <div 
              key={i} 
              className={`h-2 w-2 rounded-full transition-all duration-300 ${i === step ? 'w-6 bg-indigo-400' : 'bg-slate-700'}`}
            />
          ))}
        </div>
        
        {/* Progress Skip button */}
        {step < steps.length - 1 && (
          <button 
            onClick={onComplete}
            className="absolute -bottom-12 text-slate-500 hover:text-indigo-400 font-bold text-sm uppercase tracking-widest transition-colors"
          >
            Passer le tuto
          </button>
        )}
      </div>
    </div>
  );
};

export default Tutorial;
