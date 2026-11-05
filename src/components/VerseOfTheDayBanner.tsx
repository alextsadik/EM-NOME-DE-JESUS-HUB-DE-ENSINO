import React, { useState, useEffect } from 'react';
import dailyVerses from '../data/dailyVerses.json';
import { Volume2, Copy, Check, Sparkles, ChevronDown, ChevronUp, BookOpen, SunMedium } from 'lucide-react';

interface DailyVerse {
  id: string;
  reference: string;
  text: string;
  theme: string;
  reflection: string;
}

interface VerseOfTheDayBannerProps {
  onAddScore?: (points: number, reason: string) => void;
}

export const VerseOfTheDayBanner: React.FC<VerseOfTheDayBannerProps> = ({ onAddScore }) => {
  const [verse, setVerse] = useState<DailyVerse>(dailyVerses[0]);
  const [isCopied, setIsCopied] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [hasMeditatedToday, setHasMeditatedToday] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  // Compute 24h verse based on current epoch day (changes automatically every midnight)
  useEffect(() => {
    const today = new Date();
    const todayKey = today.toISOString().slice(0, 10);
    const dayNumber = Math.floor(today.getTime() / (1000 * 60 * 60 * 24));
    const verseIndex = dayNumber % dailyVerses.length;
    setVerse(dailyVerses[verseIndex]);

    // Check if player already meditated on today's verse
    const meditatedKey = `verse_meditated_${todayKey}`;
    if (localStorage.getItem(meditatedKey) === 'true') {
      setHasMeditatedToday(true);
    }
  }, []);

  const handleCopy = () => {
    const textToCopy = `"${verse.text}" — ${verse.reference} (${verse.theme})`;
    navigator.clipboard.writeText(textToCopy);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2200);
  };

  const handleProclaimAudio = () => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    if (isPlayingAudio) {
      setIsPlayingAudio(false);
      return;
    }

    const proclamation = `Versículo do Dia sobre a Graça e o Nome de Jesus. ${verse.reference}. ${verse.text}. Reflexão: ${verse.reflection}`;
    const utterance = new SpeechSynthesisUtterance(proclamation);
    utterance.lang = 'pt-BR';
    utterance.rate = 0.92;
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsPlayingAudio(true);
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleMeditate = () => {
    if (hasMeditatedToday) return;

    const today = new Date().toISOString().slice(0, 10);
    localStorage.setItem(`verse_meditated_${today}`, 'true');
    setHasMeditatedToday(true);
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 3000);

    if (onAddScore) {
      onAddScore(10, `Meditação Diária: ${verse.reference}`);
    }

    // Play subtle celestial chime
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(528, audioCtx.currentTime); // Solfeggio 528Hz Transformation & Miracles
      osc.frequency.exponentialRampToValueAtTime(792, audioCtx.currentTime + 0.6);
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.8);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.85);
    } catch {
      // AudioContext not allowed or unsupported
    }
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-amber-950/70 via-slate-900/95 to-amber-950/70 border-b border-amber-500/30 text-amber-100 shadow-lg backdrop-blur-md transition-all">
      {/* Decorative divine glow */}
      <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-96 h-20 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 py-2.5">
        <div className="flex items-center justify-between gap-3">
          {/* Header indicator */}
          <div className="flex items-center gap-2 text-xs font-serif tracking-widest text-amber-300 uppercase">
            <SunMedium className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>Versículo do Dia</span>
            <span className="text-amber-500/60 font-sans">•</span>
            <span className="bg-amber-900/60 text-amber-200 border border-amber-600/40 px-2 py-0.5 rounded text-[11px] font-sans font-medium">
              {verse.theme}
            </span>
            <span className="hidden sm:inline font-sans text-amber-300 font-semibold text-xs ml-1">
              — {verse.reference}
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {!hasMeditatedToday ? (
              <button
                onClick={handleMeditate}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-serif rounded shadow-sm hover:shadow-amber-500/20 active:scale-95 transition-all"
                title="Meditar neste versículo e receber +10 WorshipScore hoje"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Meditar</span> (+10)
              </button>
            ) : (
              <span className="flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded">
                <Check className="w-3 h-3" />
                <span className="hidden sm:inline">Meditado hoje</span>
              </span>
            )}

            <button
              onClick={handleProclaimAudio}
              className={`p-1.5 rounded border text-xs transition-colors ${
                isPlayingAudio
                  ? 'bg-amber-500/30 text-amber-200 border-amber-400 animate-pulse'
                  : 'bg-slate-800/80 hover:bg-slate-700/80 text-amber-200 border-amber-500/20'
              }`}
              title="Ouvir Proclamação Sagrada"
            >
              <Volume2 className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleCopy}
              className="p-1.5 rounded border border-amber-500/20 bg-slate-800/80 hover:bg-slate-700/80 text-amber-200 transition-colors"
              title="Copiar versículo"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 rounded border border-amber-500/20 bg-slate-800/80 hover:bg-slate-700/80 text-amber-300 transition-colors"
              title={isExpanded ? 'Recolher detalhes' : 'Expandir texto completo'}
            >
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Expanded body with sacred scripture styling */}
        {isExpanded && (
          <div className="mt-2 pt-2 border-t border-amber-500/20 grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            <div className="md:col-span-8 flex items-start gap-2.5">
              <BookOpen className="w-4 h-4 text-amber-400 shrink-0 mt-0.5 opacity-80" />
              <div>
                <p className="font-serif text-sm sm:text-base text-amber-100 leading-relaxed italic">
                  "{verse.text}"
                </p>
                <p className="sm:hidden text-xs text-amber-400 font-semibold mt-1">
                  — {verse.reference}
                </p>
              </div>
            </div>

            <div className="md:col-span-4 bg-slate-950/40 border border-amber-500/20 rounded-md p-2 text-xs text-amber-200/80 font-sans">
              <span className="text-amber-400 font-medium block mb-0.5">Reflexão do Espírito:</span>
              <p className="leading-snug">{verse.reflection}</p>
            </div>
          </div>
        )}

        {/* Celebration toast when meditated */}
        {showCelebration && (
          <div className="mt-2 bg-gradient-to-r from-amber-500/20 via-amber-400/30 to-amber-500/20 border border-amber-400/50 rounded p-1.5 text-center text-xs text-amber-200 font-serif animate-fade-in flex items-center justify-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
            <span>Meditação selada no Espírito! +10 WorshipScore depositados em seu altar interior.</span>
          </div>
        )}
      </div>
    </div>
  );
};
