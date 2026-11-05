import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Flame, 
  Volume2, 
  CheckCircle2, 
  RefreshCw,
  Award,
  Heart
} from 'lucide-react';
import { PraiseChallenge, ActivePraiseMultiplier, PlayerStats } from '../types/game';
import { PSALM_PRAISE_CHALLENGES } from '../data/biblicalContent';
import { soundService } from '../services/soundEffects';

interface PraiseChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCompleteChallenge: (challenge: PraiseChallenge) => void;
  activeMultiplier: ActivePraiseMultiplier | null;
}

export const PraiseChallengeModal: React.FC<PraiseChallengeModalProps> = ({
  isOpen,
  onClose,
  onCompleteChallenge,
  activeMultiplier,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isCelebrated, setIsCelebrated] = useState<boolean>(false);

  if (!isOpen) return null;

  const challenge = PSALM_PRAISE_CHALLENGES[currentIndex] || PSALM_PRAISE_CHALLENGES[0];

  const handleNextChallenge = () => {
    setCurrentIndex((prev) => (prev + 1) % PSALM_PRAISE_CHALLENGES.length);
    setIsCelebrated(false);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
    soundService.playDecreeClick();
  };

  const handleSpeakDeclaration = () => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const textToSpeak = `${challenge.psalmRef}. ${challenge.verseText} Proclamação: ${challenge.proclamationDeclaration}`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = 'pt-BR';
    utterance.rate = 0.95;

    setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    soundService.playDecreeClick();
  };

  const handleClaimReward = () => {
    setIsCelebrated(true);
    soundService.playVictoryChime();
    onCompleteChallenge(challenge);

    setTimeout(() => {
      onClose();
      setIsCelebrated(false);
    }, 2500);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="praise-challenge-title"
    >
      <div className="bg-slate-900 border border-amber-500/30 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden text-slate-100 relative">
        
        {/* Glow Header Accent */}
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600"></div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider">
                Intervalo de Adoração & Gamificação
              </span>
              <h2 id="praise-challenge-title" className="text-base font-bold text-slate-100">
                Desafio de Louvor nos Salmos
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleNextChallenge}
              title="Ver outro desafio dos Salmos"
              className="p-2 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-slate-800 transition-colors text-xs flex items-center gap-1.5"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline text-xs">Outro Salmo</span>
            </button>
            <button
              onClick={onClose}
              aria-label="Fechar desafio de louvor"
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          
          {/* Psalm Passage Banner */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 relative">
            <div className="flex items-center justify-between text-xs text-amber-400 font-semibold mb-2">
              <span className="flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-red-400" />
                <span>{challenge.psalmRef}</span>
              </span>
              <span className="text-[11px] text-slate-400">
                Tema: {challenge.theme.toUpperCase()}
              </span>
            </div>

            <h3 className="text-sm font-bold text-slate-100 mb-2">
              "{challenge.title}"
            </h3>
            
            <p className="text-xs sm:text-sm text-slate-200 italic leading-relaxed pl-3 border-l-2 border-amber-400/50">
              "{challenge.verseText}"
            </p>
          </div>

          {/* Theological Purpose Note */}
          <div className="p-3.5 rounded-lg bg-amber-950/20 border border-amber-500/20 text-xs text-amber-200/90 leading-relaxed">
            <span className="font-bold text-amber-400">O Privilégio de Adorar: </span>
            {challenge.theologicalContext}
          </div>

          {/* Proclamation of Faith */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wide">
                Proclamação com Autoridade de Filho
              </span>
              <button
                onClick={handleSpeakDeclaration}
                className={`p-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-colors ${
                  isSpeaking
                    ? 'bg-amber-500 text-slate-950 font-bold animate-pulse'
                    : 'text-slate-400 hover:text-amber-300 hover:bg-slate-800'
                }`}
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span className="text-[11px]">{isSpeaking ? 'Proclamando...' : 'Ouvir Voz'}</span>
              </button>
            </div>

            <p className="text-xs text-slate-200 font-medium leading-relaxed bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
              "{challenge.proclamationDeclaration}"
            </p>
          </div>

          {/* Reward Bonus Preview */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-300">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-400" />
              <span>
                Recompensa: <strong>+{challenge.fruitAmount} Fruto de {challenge.fruitRewardType.toUpperCase()}</strong>
              </span>
            </div>
            <div className="flex items-center gap-1 font-semibold text-amber-300">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Bônus x{challenge.multiplierBoost} ({challenge.durationMinutes} min)</span>
            </div>
          </div>

          {/* Celebration Feedback */}
          {isCelebrated && (
            <div className="p-3 rounded-xl bg-emerald-900/60 border border-emerald-400 text-center text-xs font-bold text-emerald-100 flex items-center justify-center gap-2 animate-bounce">
              <CheckCircle2 className="w-5 h-5 text-emerald-300" />
              <span>Aleluia! A alegria do SENHOR é a sua força! Multiplicador ativado!</span>
            </div>
          )}

          {/* Action CTAs */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={onClose}
              disabled={isCelebrated}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
            >
              Agora não
            </button>

            <button
              onClick={handleClaimReward}
              disabled={isCelebrated}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg transition-transform active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>Proclamar Louvor & Ativar Multiplicador</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
