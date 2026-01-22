
import React from 'react';
import { KeyboardLayout } from '../types';
import { AZERTY_KEYS, QWERTY_KEYS } from '../constants';

interface KeyboardComponentProps {
  layout: KeyboardLayout;
  activeKey: string | null;
  lastErrorKey: string | null;
}

const KeyboardComponent: React.FC<KeyboardComponentProps> = ({ layout, activeKey, lastErrorKey }) => {
  const keys = layout === 'AZERTY' ? AZERTY_KEYS : QWERTY_KEYS;

  const normalizeChar = (char: string) => {
    if (!char) return "";
    // Pour les touches spéciales comme "Enter", "Space", "Shift"
    if (char === " ") return " ";
    if (char.length > 1) return char.toUpperCase();
    
    // Pour les lettres individuelles, on met en majuscule MAIS on garde les accents
    // car sur un clavier AZERTY, 'é' et 'e' sont des touches physiquement différentes.
    return char.toUpperCase();
  };

  const isMatch = (target: string | null, key: string) => {
    if (!target) return false;
    
    const normTarget = normalizeChar(target);
    const normKey = normalizeChar(key);

    // Correspondance directe (insensible à la casse mais sensible aux accents)
    if (normTarget === normKey) return true;
    
    // Mappages spécifiques pour les touches spéciales
    if (normTarget === "BACKSPACE" && normKey === "DELETE") return true;
    if (normTarget === "CONTROL" && normKey === "CTRL") return true;
    if (normTarget === "ALTGRAPH" && normKey === "ALTGR") return true;
    if (normTarget === "CAPSLOCK" && normKey === "CAPS") return true;
    if (normTarget === "ESCAPE" && normKey === "ESC") return true;

    // Support pour les caractères AZERTY secondaires (AltGr ou Shift)
    // On mappe ici les caractères courants qui se trouvent sur la même touche physique
    if (layout === 'AZERTY') {
      const azertyShiftMap: Record<string, string> = {
        '1': '&', '2': 'É', '3': '"', '4': "'", '5': '(', '6': '-', '7': 'È', '8': '_', '9': 'Ç', '0': 'À',
        '°': ')', '+': '=', '£': '$', 'µ': '*', '/': ':', '.': ';', '?': ',', '§': '!'
      };
      if (azertyShiftMap[normTarget] === normKey || azertyShiftMap[normKey] === normTarget) return true;
      
      const azertyAltGrMap: Record<string, string> = {
        '~': 'É', '#': '"', '{': "'", '[': '(', '|': '-', '`': 'È', '\\': '_', '^': 'Ç', '@': 'À',
        ']': ')', '}': '=', '€': 'E', '¤': '$'
      };
      if (azertyAltGrMap[normTarget] === normKey) return true;
    }

    return false;
  };

  const getKeyWidth = (key: string) => {
    switch (key) {
      case 'Tab': return 'w-16';
      case 'Caps': return 'w-20';
      case 'Shift': return 'w-24';
      case 'Enter': return 'w-24';
      case 'Delete': return 'w-20';
      case ' ': return 'w-64';
      default: return 'w-10 sm:w-12';
    }
  };

  return (
    <div className="bg-slate-800/80 p-6 rounded-2xl shadow-2xl border-4 border-indigo-500/50 backdrop-blur-md transition-all duration-300">
      <div className="flex flex-col gap-2">
        {keys.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center gap-1.5">
            {row.map((key, keyIndex) => {
              const isHighlight = isMatch(activeKey, key);
              const isError = isMatch(lastErrorKey, key);
              
              return (
                <div
                  key={keyIndex}
                  className={`
                    h-10 sm:h-12 flex items-center justify-center rounded-lg font-bold text-xs sm:text-sm transition-all duration-75 select-none
                    ${getKeyWidth(key)}
                    ${isHighlight ? 'bg-yellow-400 text-slate-900 scale-110 shadow-lg shadow-yellow-400/50 z-10' : 
                      isError ? 'bg-red-500 text-white animate-pulse' : 
                      'bg-slate-700 text-slate-300 border-b-4 border-slate-900'}
                  `}
                >
                  {key}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default KeyboardComponent;
