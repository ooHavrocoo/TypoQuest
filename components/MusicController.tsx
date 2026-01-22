
import React, { useState, useEffect, useRef } from 'react';
import { MusicStyle } from '../types';

const MUSIC_TRACKS: Record<MusicStyle, { url: string; label: string; icon: string }> = {
  COSMIC_SYNTH: {
    url: 'https://cdn.pixabay.com/audio/2023/11/05/audio_5b98218765.mp3', // Synthwave retro
    label: 'Cosmic Synth',
    icon: '🎹'
  },
  GALACTIC_AMBIENT: {
    url: 'https://cdn.pixabay.com/audio/2022/02/10/audio_510446f5c8.mp3', // Space deep ambient
    label: 'Galactic Calm',
    icon: '✨'
  },
  '8BIT_ADVENTURE': {
    url: 'https://cdn.pixabay.com/audio/2021/11/24/audio_983637651a.mp3', // Happy 8-bit
    label: '8-Bit Quest',
    icon: '👾'
  }
};

const MusicController: React.FC = () => {
  const [style, setStyle] = useState<MusicStyle>('COSMIC_SYNTH');
  const [isMuted, setIsMuted] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initial audio setup
    audioRef.current = new Audio(MUSIC_TRACKS[style].url);
    audioRef.current.loop = true;
    audioRef.current.volume = 0.3;

    const handleFirstInteraction = () => {
      if (!hasInteracted) {
        setHasInteracted(true);
        // On ne joue pas automatiquement pour laisser l'utilisateur choisir via le bouton mute
      }
    };

    window.addEventListener('mousedown', handleFirstInteraction);
    window.addEventListener('keydown', handleFirstInteraction);

    return () => {
      window.removeEventListener('mousedown', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Handle source changes
  useEffect(() => {
    if (audioRef.current) {
      const wasPlaying = !audioRef.current.paused;
      audioRef.current.src = MUSIC_TRACKS[style].url;
      audioRef.current.load();
      if (wasPlaying && !isMuted) {
        audioRef.current.play().catch(console.warn);
      }
    }
  }, [style]);

  // Handle play/pause
  useEffect(() => {
    if (!audioRef.current) return;

    if (isMuted) {
      audioRef.current.pause();
    } else {
      if (hasInteracted) {
        audioRef.current.play().catch(err => {
          console.warn("Autoplay bloqué ou erreur de lecture", err);
          setIsMuted(true);
        });
      }
    }
  }, [isMuted, hasInteracted]);

  const cycleStyle = () => {
    const styles: MusicStyle[] = ['COSMIC_SYNTH', 'GALACTIC_AMBIENT', '8BIT_ADVENTURE'];
    const currentIndex = styles.indexOf(style);
    const nextIndex = (currentIndex + 1) % styles.length;
    setStyle(styles[nextIndex]);
    if (isMuted) setIsMuted(false);
  };

  const toggleMute = () => {
    if (!hasInteracted) setHasInteracted(true);
    setIsMuted(!isMuted);
  };

  return (
    <div className="fixed top-6 right-6 z-[60] flex items-center gap-3">
      {/* Interaction Hint */}
      {!hasInteracted && !isMuted && (
        <div className="bg-indigo-600 text-white text-[10px] font-bold px-3 py-1 rounded-full animate-bounce shadow-lg">
          Clique n'importe où pour le son ! 🎧
        </div>
      )}

      {/* Music Style Display */}
      {!isMuted && (
        <div className="hidden sm:flex flex-col items-end animate-in slide-in-from-right-4 fade-in duration-300">
          <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest leading-none mb-1">Style</span>
          <span className="text-xs font-bold text-white whitespace-nowrap bg-slate-900/80 px-3 py-1 rounded-lg border border-white/5">
            {MUSIC_TRACKS[style].icon} {MUSIC_TRACKS[style].label}
          </span>
        </div>
      )}

      {/* Control Buttons */}
      <div className="flex bg-slate-900/60 backdrop-blur-xl border-2 border-white/10 p-1.5 rounded-2xl shadow-2xl">
        <button
          onClick={cycleStyle}
          title="Changer de musique"
          className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/10 text-xl transition-all active:scale-90"
        >
          {MUSIC_TRACKS[style].icon}
        </button>
        
        <div className="w-px h-6 bg-white/10 self-center mx-1"></div>

        <button
          onClick={toggleMute}
          className={`w-10 h-10 flex flex-col items-center justify-center rounded-xl transition-all active:scale-90 ${isMuted ? 'text-slate-500 hover:text-slate-300' : 'text-indigo-400 hover:bg-indigo-500/10'}`}
        >
          {isMuted ? (
            <i className="fas fa-volume-mute text-lg"></i>
          ) : (
            <div className="flex items-end gap-[2px] h-4">
              <div className="w-[3px] bg-current animate-[music-bar_0.8s_ease-in-out_infinite] h-full"></div>
              <div className="w-[3px] bg-current animate-[music-bar_1.2s_ease-in-out_infinite] h-2/3"></div>
              <div className="w-[3px] bg-current animate-[music-bar_1s_ease-in-out_infinite] h-4/5"></div>
            </div>
          )}
        </button>
      </div>

      <style>{`
        @keyframes music-bar {
          0%, 100% { height: 20%; }
          50% { height: 100%; }
        }
      `}</style>
    </div>
  );
};

export default MusicController;
