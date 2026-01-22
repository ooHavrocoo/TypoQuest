
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { KeyboardLayout, Level, GameStats } from '../types';
import { getFunnySentences } from '../services/geminiService';
import KeyboardComponent from './KeyboardComponent';

interface GameScreenProps {
  level: Level;
  layout: KeyboardLayout;
  onFinish: (stats: GameStats) => void;
  onBack: () => void;
  avatar: string;
}

type Reaction = 'idle' | 'happy' | 'sad' | 'super';

// URLs de sons robustes et vérifiés
const COMBO_ASSETS = {
  MILESTONE_5: 'https://cdn.pixabay.com/audio/2021/08/04/audio_0625c1539c.mp3',   // Ding clair
  MILESTONE_10: 'https://cdn.pixabay.com/audio/2021/08/04/audio_12b0aed169.mp3',  // Power-up
  MILESTONE_15: 'https://cdn.pixabay.com/audio/2022/03/15/audio_5064e43f55.mp3',  // Succès magique
};

const GameScreen: React.FC<GameScreenProps> = ({ level, layout, onFinish, onBack, avatar }) => {
  const [sentences, setSentences] = useState<string[]>([]);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [lastErrorKey, setLastErrorKey] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [errors, setErrors] = useState(0);
  const [totalKeys, setTotalKeys] = useState(0);
  const [reaction, setReaction] = useState<Reaction>('idle');
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [hasFocus, setHasFocus] = useState(true);
  const [comboMilestone, setComboMilestone] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const reactionTimerRef = useRef<number | null>(null);
  
  const comboRef = useRef(0);
  const audioMilestone5 = useRef<HTMLAudioElement | null>(null);
  const audioMilestone10 = useRef<HTMLAudioElement | null>(null);
  const audioMilestone15 = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioMilestone5.current = new Audio(COMBO_ASSETS.MILESTONE_5);
    audioMilestone10.current = new Audio(COMBO_ASSETS.MILESTONE_10);
    audioMilestone15.current = new Audio(COMBO_ASSETS.MILESTONE_15);

    [audioMilestone5, audioMilestone10, audioMilestone15].forEach(ref => {
      if (ref.current) {
        ref.current.volume = 0.4;
        ref.current.preload = 'auto';
      }
    });
  }, []);

  const playMilestoneSound = (milestone: 5 | 10 | 15) => {
    let audio: HTMLAudioElement | null = null;
    if (milestone === 5) audio = audioMilestone5.current;
    else if (milestone === 10) audio = audioMilestone10.current;
    else if (milestone === 15) audio = audioMilestone15.current;

    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(e => console.warn("Audio play blocked", e));
    }
  };

  const loadContent = useCallback(async () => {
    setLoading(true);
    let content: string[] = [];
    try {
      if (level.id === 1) {
        content = ["a s d f", "j k l m", "q s d f", "m l k j", "f d s a", "a a s s"];
      } else if (level.id === 2) {
        // Suppression de "Étoile" car le É est trop dur
        content = ["Espace", "Lune", "Soleil", "Robot", "Fusée", "Etoile", "Mars", "Terre", "Planète"];
      } else if (level.id === 4) {
        // Nettoyage des majuscules accentuées dans le niveau Speed Test
        content = [
          "Alerte maximale : l'horizon des événements est atteint !",
          "La gravité augmente de façon exponentielle à l'approche du trou noir.",
          "Calcul des trajectoires de saut hyper-espace : 99%.",
          "Ejection du noyau de distorsion dans trois, deux, un... Maintenant !",
          "Vitesse lumière engagée. Destination finale : galaxie d'Andromède."
        ];
      } else {
        content = await getFunnySentences(level.difficulty, "français");
      }
    } catch (err) {
      content = ["Le robot rigole.", "Mars est orange.", "Le vaisseau danse."];
    }
    setSentences(content);
    setLoading(false);
  }, [level]);

  useEffect(() => {
    loadContent();
  }, [loadContent]);

  useEffect(() => {
    if (!loading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [loading]);

  const triggerReaction = (type: Reaction) => {
    setReaction(type);
    if (reactionTimerRef.current) window.clearTimeout(reactionTimerRef.current);
    reactionTimerRef.current = window.setTimeout(() => setReaction('idle'), 600);
  };

  const triggerMilestoneEffect = () => {
    setComboMilestone(true);
    setTimeout(() => setComboMilestone(false), 600);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isFinished) return;
    const val = e.target.value;
    const target = sentences[currentSentenceIndex];

    if (!startTime) setStartTime(Date.now());

    if (val.length > inputValue.length) {
      setTotalKeys(prev => prev + 1);
      const lastCharTyped = val[val.length - 1];
      const expectedChar = target[val.length - 1];

      if (lastCharTyped !== expectedChar) {
        setErrors(prev => prev + 1);
        setLastErrorKey(lastCharTyped);
        comboRef.current = 0;
        setCombo(0);
        triggerReaction('sad');
        setTimeout(() => setLastErrorKey(null), 500);
        return;
      } else {
        comboRef.current += 1;
        const currentComboCount = comboRef.current;
        setCombo(currentComboCount);
        
        if (currentComboCount > maxCombo) setMaxCombo(currentComboCount);
        
        if (currentComboCount === 5) {
          playMilestoneSound(5);
          triggerMilestoneEffect();
        } else if (currentComboCount === 10) {
          playMilestoneSound(10);
          triggerMilestoneEffect();
        } else if (currentComboCount === 15) {
          playMilestoneSound(15);
          triggerMilestoneEffect();
        } else if (currentComboCount > 15 && currentComboCount % 10 === 0) {
          playMilestoneSound(15);
          triggerMilestoneEffect();
        }

        if (currentComboCount >= 10 && currentComboCount % 5 === 0) {
          triggerReaction('super');
        } else {
          triggerReaction('happy');
        }
      }
    }

    setInputValue(val);

    if (val === target) {
      if (currentSentenceIndex < sentences.length - 1) {
        setTimeout(() => {
          setCurrentSentenceIndex(prev => prev + 1);
          setInputValue("");
        }, 300);
      } else {
        setIsFinished(true);
        const endTime = Date.now();
        const durationMinutes = (endTime - (startTime || endTime)) / 60000;
        const wordCount = sentences.join(" ").split(" ").length;
        const wpm = Math.round(wordCount / durationMinutes) || 0;
        const accuracy = Math.round(((totalKeys + 1 - errors) / (totalKeys + 1)) * 100);
        setTimeout(() => onFinish({ wpm, accuracy, keysPressed: totalKeys + 1, errors }), 1500);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    setActiveKey(e.key);
    setTimeout(() => setActiveKey(null), 100);
  };

  const refocusInput = () => {
    if (inputRef.current) {
      inputRef.current.focus();
      setHasFocus(true);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-6">
        <div className="text-6xl animate-bounce">🚀</div>
        <p className="text-2xl font-bold text-indigo-300 italic">Préparation du moteur hyper-espace...</p>
      </div>
    );
  }

  const targetSentence = sentences[currentSentenceIndex] || "";
  const comboLevel = Math.min(Math.floor(combo / 5), 5);

  return (
    <div className="flex flex-col items-center w-full max-w-5xl mx-auto p-4 gap-8 outline-none min-h-screen justify-center" onClick={refocusInput}>
      {!hasFocus && !isFinished && (
        <div className="fixed inset-0 z-[100] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center cursor-pointer" onClick={refocusInput}>
           <div className="bg-slate-900 border-4 border-yellow-400 p-10 rounded-[2.5rem] text-center shadow-2xl animate-bounce">
              <div className="text-6xl mb-4">⌨️</div>
              <h2 className="text-3xl font-black text-white uppercase italic">Oups ! Clique ici</h2>
              <p className="text-yellow-400 font-bold mt-2 text-lg">Pour continuer ton aventure spatiale !</p>
           </div>
        </div>
      )}

      <div className={`w-full flex justify-between items-center bg-slate-800/60 p-5 rounded-[2rem] border-2 transition-all duration-300 backdrop-blur-md relative z-[110]
        ${comboMilestone ? 'border-yellow-400 scale-[1.02] shadow-[0_0_40_rgba(250,204,21,0.4)]' : 'border-indigo-500/30'}
      `}>
        <div className="flex items-center gap-4">
          <button 
            onClick={(e) => { e.stopPropagation(); onBack(); }}
            className="w-12 h-12 rounded-2xl bg-slate-700 hover:bg-red-500 flex items-center justify-center transition-all text-white shadow-lg active:scale-90"
          >
            <i className="fas fa-home text-lg"></i>
          </button>

          <div className="relative">
            <div className={`absolute inset-0 rounded-full blur-md opacity-50 transition-colors duration-300 ${reaction === 'happy' || reaction === 'super' ? 'bg-green-400' : reaction === 'sad' ? 'bg-red-500' : 'bg-indigo-400'}`}></div>
            <span className={`relative text-5xl transition-transform duration-300 block ${comboMilestone ? 'scale-150 rotate-12' : ''}`}>{avatar}</span>
          </div>
          
          <div className="hidden sm:block">
            <h3 className="font-black text-white uppercase tracking-tighter italic">{level.name}</h3>
            <div className="w-32 h-2.5 bg-slate-950 rounded-full mt-1 overflow-hidden border border-white/5">
               <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500" 
                style={{ width: `${((currentSentenceIndex) / (sentences.length || 1)) * 100}%` }}
               ></div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-center px-4">
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black">Combo Actuel</p>
            <div className="flex items-center gap-2">
              <span className={`text-3xl font-black italic transition-all duration-300 ${combo > 0 ? 'text-yellow-400 scale-110' : 'text-slate-600 opacity-30'}`}>
                X{combo}
              </span>
              {combo >= 5 && <span className={`transition-all duration-300 ${comboMilestone ? 'scale-150 text-3xl' : 'text-2xl'} animate-pulse`}>🔥</span>}
            </div>
        </div>

        <div className="flex gap-6 sm:gap-10">
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Erreurs</p>
            <p className="text-2xl font-black text-red-500">{errors}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Précision</p>
            <p className="text-2xl font-black text-green-400">
              {totalKeys > 0 ? Math.round(((totalKeys - errors) / totalKeys) * 100) : 100}%
            </p>
          </div>
        </div>
      </div>

      <div className={`relative w-full bg-slate-900/80 backdrop-blur-2xl p-12 sm:p-20 rounded-[3rem] border-4 transition-all duration-500 shadow-2xl overflow-hidden group
        ${combo >= 15 ? 'border-yellow-400 shadow-[0_0_50px_rgba(250,204,21,0.2)]' : combo >= 5 ? 'border-indigo-400/50' : 'border-indigo-500/20'}
      `}>
        {isFinished && (
           <div className="absolute inset-0 z-50 bg-slate-950/90 flex flex-col items-center justify-center animate-in zoom-in duration-300">
              <div className="text-7xl font-black text-white italic mb-4 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">VICTOIRE !</div>
              <p className="text-indigo-400 font-bold uppercase tracking-[0.3em] animate-pulse">Synchronisation des données...</p>
           </div>
        )}

        <div className="flex flex-wrap justify-center text-4xl sm:text-6xl font-bold tracking-tight leading-relaxed text-center font-mono">
          {targetSentence.split("").map((char, idx) => {
            let color = "text-slate-700";
            let underline = "";
            let scale = "scale-100";
            
            if (idx < inputValue.length) {
              color = combo >= 10 ? "text-yellow-100" : "text-indigo-300";
            } else if (idx === inputValue.length) {
              color = "text-yellow-400 animate-pulse";
              underline = "border-b-4 border-yellow-400/50";
              scale = "scale-110";
            }
            
            return (
              <span key={idx} className={`${color} ${underline} ${scale} transition-all duration-150 inline-block px-1`}>
                {char === " " ? "\u00A0" : char}
              </span>
            );
          })}
        </div>

        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={() => setHasFocus(false)}
          onFocus={() => setHasFocus(true)}
          className="absolute inset-0 opacity-0 cursor-default"
          autoFocus
          autoComplete="off"
        />
      </div>

      <div className="flex flex-col items-center relative py-6">
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[60px] transition-all duration-500 
          ${reaction === 'happy' || reaction === 'super' ? 'bg-green-500/30' : reaction === 'sad' ? 'bg-red-500/30' : 'bg-indigo-500/10 animate-pulse-glow'}`}
          style={{ width: `${120 + comboLevel * 30}px`, height: `${120 + comboLevel * 30}px`, opacity: 0.3 + (comboLevel * 0.1) }}
        ></div>
        
        <div className={`text-9xl select-none transition-all duration-300 z-10
          ${reaction === 'super' ? 'animate-bounce scale-125 rotate-12' : 
            reaction === 'happy' ? 'animate-bounce' : 
            reaction === 'sad' ? 'animate-shake opacity-70' : 
            'animate-float'}
          ${comboMilestone ? 'scale-150 brightness-150 drop-shadow-[0_0_20px_rgba(255,255,255,0.8)]' : ''}
        `}>
          {reaction === 'super' ? '🔥' : reaction === 'sad' ? '😱' : reaction === 'happy' ? '🤩' : avatar}
        </div>
      </div>

      <KeyboardComponent 
        layout={layout} 
        activeKey={activeKey || (targetSentence[inputValue.length] || null)}
        lastErrorKey={lastErrorKey}
      />
    </div>
  );
};

export default GameScreen;
