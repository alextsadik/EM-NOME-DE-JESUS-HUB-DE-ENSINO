/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  BellRing,
  Volume2,
  Heart,
  Sparkles,
  BookMarked,
  Check,
  X,
  Flame,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { PrayerReminder, PlayerStats } from '../types/game';
import { soundService } from '../services/soundEffects';

interface PrayerReminderNotificationModalProps {
  isOpen: boolean;
  reminder: PrayerReminder | null;
  onClose: () => void;
  onNavigateToJournal?: () => void;
  onUpdateStats?: (updater: React.SetStateAction<PlayerStats>) => void;
}

export const PrayerReminderNotificationModal: React.FC<PrayerReminderNotificationModalProps> = ({
  isOpen,
  reminder,
  onClose,
  onNavigateToJournal,
  onUpdateStats,
}) => {
  const [hasPrayed, setHasPrayed] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  if (!isOpen || !reminder) return null;

  const handlePrayNow = () => {
    soundService.playCelestialDecreeSound();
    setHasPrayed(true);
    setIsSpeaking(true);

    const spokenPrayer = `Momento Sagrado de Oração em Nome de Jesus Cristo. ${reminder.title}. Conforme Colossenses capítulo 3, versículo 17: ${reminder.verseText}. ${reminder.adorationPrompt}. Pai Celeste, consagramos nossas palavras, obras e pensamentos. Em Nome de Jesus, amém e glória a Deus!`;

    soundService.speakText(spokenPrayer, () => {
      setIsSpeaking(false);
    });

    if (onUpdateStats) {
      onUpdateStats((prev) => ({
        ...prev,
        fruits: {
          ...prev.fruits,
          paz: prev.fruits.paz + 10,
          fidelidade: prev.fruits.fidelidade + 10,
          alegria: prev.fruits.alegria + 5,
          amor: prev.fruits.amor + 5,
        },
        dailyProgress: prev.dailyProgress?.map((item, idx) => {
          if (idx === (prev.dailyProgress?.length || 1) - 1) {
            return { ...item, oracoes: item.oracoes + 1 };
          }
          return item;
        }),
      }));
    }
  };

  const handleGoToJournal = () => {
    onClose();
    if (onNavigateToJournal) {
      onNavigateToJournal();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-2 border-amber-500/50 rounded-3xl p-6 md:p-8 shadow-2xl shadow-amber-500/20 text-slate-100 overflow-hidden">
        {/* Glow ambient background effect */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/60 hover:bg-slate-800 transition-colors"
          title="Dispensar lembrete"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with Church Bell / Clock Icon */}
        <div className="flex items-center gap-4 mb-5">
          <div className="relative p-3.5 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/30 animate-pulse">
            <BellRing className="w-7 h-7" />
            <Sparkles className="w-3.5 h-3.5 absolute -top-1 -right-1 text-white" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 tabular-nums">
                <Clock className="w-3.5 h-3.5" />
                {reminder.time}
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-400/90">
                Lembrete de Oração & Adoração Contínua
              </span>
            </div>
            <h2 className="font-cinzel text-xl md:text-2xl font-bold text-white mt-1">
              {reminder.title}
            </h2>
          </div>
        </div>

        {/* Colossians 3:17 Scripture Banner */}
        <div className="relative rounded-2xl bg-amber-950/30 border border-amber-500/40 p-4 md:p-5 mb-5 shadow-inner">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-cinzel font-bold text-amber-300 flex items-center gap-1.5 uppercase tracking-wide">
              <Flame className="w-4 h-4 text-amber-400" />
              {reminder.scriptureRef || 'Colossenses 3:17'}
            </span>
            <span className="text-[10px] bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded border border-amber-500/20">
              Padrão Sagrado
            </span>
          </div>

          <p className="font-serif italic text-sm md:text-base text-amber-100 leading-relaxed">
            "{reminder.verseText}"
          </p>

          <p className="text-xs text-slate-300 mt-2.5 font-sans leading-relaxed">
            {reminder.adorationPrompt}
          </p>
        </div>

        {/* Practical Application prompt */}
        {reminder.practicalAction && (
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 mb-6 flex items-start gap-2.5">
            <Heart className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-sky-300 uppercase tracking-wider text-[11px] block mb-0.5 font-sans">
                Ação Prática em Cristo Jesus:
              </strong>
              <span>{reminder.practicalAction}</span>
            </div>
          </div>
        )}

        {/* Rewarded Status notification */}
        {hasPrayed && (
          <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-xs mb-5 flex items-center justify-between animate-fade-in">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Oração proclamada e santificada! +10 Paz, +10 Fidelidade, +5 Alegria.</span>
            </div>
            {isSpeaking && (
              <span className="text-[10px] text-amber-300 animate-pulse font-semibold">
                Proclamando...
              </span>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
          <button
            type="button"
            onClick={handleGoToJournal}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800/80 hover:bg-slate-700 hover:text-white transition-colors"
          >
            <BookMarked className="w-4 h-4 text-amber-400" />
            <span>Abrir Diário de Oração</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </button>

          <div className="flex items-center gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              {hasPrayed ? 'Concluir' : 'Lembrar Mais Tarde'}
            </button>

            <button
              type="button"
              onClick={handlePrayNow}
              disabled={isSpeaking}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs md:text-sm font-bold bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-slate-950 shadow-md shadow-amber-500/20 transition-all active:scale-95 disabled:opacity-60"
            >
              <Volume2 className="w-4 h-4" />
              <span>{hasPrayed ? 'Orar Novamente' : 'Orar e Adorar Agora'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
