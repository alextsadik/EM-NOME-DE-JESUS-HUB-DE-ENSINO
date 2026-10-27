/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Shield,
  Sparkles,
  BookOpen,
  Volume2,
  VolumeX,
  Shuffle,
  BookmarkCheck,
  BookmarkPlus,
  Check,
  Share2,
  ArrowRight,
  Flame,
  Award,
} from 'lucide-react';
import { BiblicalProtectionPromise, PlayerStats, PrayerEntry, MinistryDayActivity } from '../types/game';
import { BIBLICAL_PROTECTION_PROMISES, INITIAL_PRAYER_ENTRIES } from '../data/biblicalContent';
import { soundService } from '../services/soundEffects';

interface DailyPromiseCardProps {
  stats: PlayerStats;
  onUpdateStats: (newStats: PlayerStats) => void;
  onNavigateToJournal?: () => void;
}

export const DailyPromiseCard: React.FC<DailyPromiseCardProps> = ({
  stats,
  onUpdateStats,
  onNavigateToJournal,
}) => {
  // Pick a random promise on initial load
  const [currentPromise, setCurrentPromise] = useState<BiblicalProtectionPromise>(() => {
    const randomIndex = Math.floor(Math.random() * BIBLICAL_PROTECTION_PROMISES.length);
    return BIBLICAL_PROTECTION_PROMISES[randomIndex];
  });

  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [savedToast, setSavedToast] = useState<boolean>(false);
  const [isFlipping, setIsFlipping] = useState<boolean>(false);

  // Check if current promise is already saved in the user's prayer entries
  const currentEntries: PrayerEntry[] =
    stats.prayerEntries && stats.prayerEntries.length > 0
      ? stats.prayerEntries
      : INITIAL_PRAYER_ENTRIES;

  const isAlreadySaved = currentEntries.some(
    (entry) =>
      entry.scriptureRef === currentPromise.reference ||
      entry.title.includes(currentPromise.reference)
  );

  // Randomize a new promise
  const handleShufflePromise = () => {
    setIsFlipping(true);
    soundService.playScriptureTone();

    setTimeout(() => {
      let nextIndex = Math.floor(Math.random() * BIBLICAL_PROTECTION_PROMISES.length);
      // Ensure we pick a different one if more than 1 exist
      if (
        BIBLICAL_PROTECTION_PROMISES.length > 1 &&
        BIBLICAL_PROTECTION_PROMISES[nextIndex].id === currentPromise.id
      ) {
        nextIndex = (nextIndex + 1) % BIBLICAL_PROTECTION_PROMISES.length;
      }
      setCurrentPromise(BIBLICAL_PROTECTION_PROMISES[nextIndex]);
      setIsFlipping(false);
      setSavedToast(false);
      if (isSpeaking) {
        soundService.stopSpeaking();
        setIsSpeaking(false);
      }
    }, 200);
  };

  // Speak aloud the promise and faith confession
  const handleToggleSpeak = () => {
    if (isSpeaking) {
      soundService.stopSpeaking();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      const textToSpeak = `${currentPromise.reference}. ${currentPromise.text} Confissão: ${currentPromise.confessionOfFaith}`;
      soundService.speakText(textToSpeak, () => setIsSpeaking(false));
    }
  };

  // Copy to clipboard
  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(
        `"${currentPromise.text}" (${currentPromise.reference}) — ${currentPromise.confessionOfFaith}`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Save promise as "Versículo do Dia" in Prayer Journal
  const handleSaveToJournal = () => {
    if (isAlreadySaved) return;

    soundService.playPrayerChime();
    soundService.playCelestialDecreeSound();
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3500);

    const todayDate = new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });

    const newPrayerEntry: PrayerEntry = {
      id: `prayer-promise-${currentPromise.id}-${Date.now()}`,
      type: 'gratidao',
      category: 'espiritual',
      title: `Versículo do Dia: ${currentPromise.reference}`,
      description: `"${currentPromise.text}"\n\nConfissão de Fé: ${currentPromise.confessionOfFaith}\n\nReflexão Teológica: ${currentPromise.contextCommentary}`,
      scriptureRef: currentPromise.reference,
      date: todayDate,
      isAnswered: true,
      answeredDate: todayDate,
      testimonyNote: 'Promessa bíblica de proteção e autoridade em Cristo gravada no coração com ações de graças!',
    };

    const updatedEntries = [newPrayerEntry, ...currentEntries];

    // Increment today's oracoes in daily timeline if present
    const currentTimeline: MinistryDayActivity[] =
      stats.dailyProgress && stats.dailyProgress.length > 0
        ? stats.dailyProgress
        : [
            { day: 'Seg', oracoes: 4, decretos: 5, jugosQuebrados: 2 },
            { day: 'Ter', oracoes: 6, decretos: 7, jugosQuebrados: 4 },
            { day: 'Qua', oracoes: 5, decretos: 6, jugosQuebrados: 3 },
            { day: 'Qui', oracoes: 8, decretos: 9, jugosQuebrados: 6 },
            { day: 'Sex', oracoes: 7, decretos: 8, jugosQuebrados: 5 },
            { day: 'Sáb', oracoes: 9, decretos: 11, jugosQuebrados: 7 },
            { day: 'Hoje', oracoes: 6, decretos: 8, jugosQuebrados: 5 },
          ];

    const updatedDaily = currentTimeline.map((item, idx) => {
      if (idx === currentTimeline.length - 1) {
        return {
          ...item,
          oracoes: item.oracoes + 1,
        };
      }
      return item;
    });

    onUpdateStats({
      ...stats,
      prayerEntries: updatedEntries,
      dailyProgress: updatedDaily,
      fruits: {
        ...stats.fruits,
        paz: stats.fruits.paz + 5,
        fidelidade: stats.fruits.fidelidade + 5,
      },
    });
  };

  const getThemeBadgeColor = (theme: BiblicalProtectionPromise['theme']) => {
    switch (theme) {
      case 'protecao_divina':
        return 'bg-amber-950/70 border-amber-500/40 text-amber-300';
      case 'autoridade_espiritual':
        return 'bg-sky-950/70 border-sky-500/40 text-sky-300';
      case 'guarda_angelical':
        return 'bg-purple-950/70 border-purple-500/40 text-purple-300';
      case 'triunfo_cruz':
        return 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300';
      case 'refugio_inabalavel':
      default:
        return 'bg-indigo-950/70 border-indigo-500/40 text-indigo-300';
    }
  };

  return (
    <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/50 p-6 md:p-7 shadow-2xl space-y-5 relative overflow-hidden transition-all">
      {/* Ambient background decoration */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-60 h-60 bg-sky-500/5 rounded-full blur-2xl pointer-events-none -ml-10 -mb-10" />

      {/* Header bar: Title, Theme badge, and Shuffle action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/90 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-400">
                Promessa de Proteção & Autoridade
              </span>
              <span className="text-[11px] text-slate-500 hidden sm:inline">· Versículo do Dia</span>
            </div>
            <h3 className="font-cinzel text-base md:text-lg font-bold text-white tracking-wide">
              {currentPromise.reference}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <span
            className={`px-2.5 py-1 rounded-lg text-[10px] md:text-xs font-semibold uppercase tracking-wider border ${getThemeBadgeColor(
              currentPromise.theme
            )}`}
          >
            {currentPromise.themeLabel}
          </span>

          <button
            onClick={handleShufflePromise}
            disabled={isFlipping}
            title="Sortear outra promessa bíblica"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-xs text-slate-300 hover:text-white transition-all shadow-sm active:scale-95"
          >
            <Shuffle className={`w-3.5 h-3.5 text-amber-400 ${isFlipping ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Nova Promessa</span>
          </button>
        </div>
      </div>

      {/* Scripture Text Body */}
      <div className={`space-y-4 relative z-10 transition-opacity duration-200 ${isFlipping ? 'opacity-40' : 'opacity-100'}`}>
        <div className="p-4 md:p-5 rounded-xl bg-slate-950/70 border border-slate-800/90 shadow-inner">
          <p className="font-cinzel text-sm md:text-base text-slate-100 leading-relaxed font-semibold italic">
            "{currentPromise.text}"
          </p>
        </div>

        {/* Confession of Faith Quote Strip */}
        <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/20 flex items-start gap-2.5 text-xs">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold text-amber-300 uppercase tracking-wider text-[10px]">
              Confissão de Fé em Nome de Jesus:
            </span>
            <p className="text-slate-200 leading-relaxed font-medium">
              "{currentPromise.confessionOfFaith}"
            </p>
          </div>
        </div>

        {/* Theological Reflection */}
        <p className="text-xs text-slate-400 leading-relaxed px-1">
          <span className="text-slate-300 font-semibold">Fundamento Teológico: </span>
          {currentPromise.contextCommentary}
        </p>
      </div>

      {/* Notification Toast if Saved */}
      {savedToast && (
        <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-xs text-emerald-200 flex items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>{currentPromise.reference}</strong> foi salvo como <strong>Versículo do Dia</strong> no seu Diário de Oração!
            </span>
          </div>

          {onNavigateToJournal && (
            <button
              onClick={onNavigateToJournal}
              className="flex items-center gap-1 text-[11px] font-bold text-emerald-300 hover:text-emerald-100 underline shrink-0"
            >
              <span>Abrir Diário</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      )}

      {/* Action Footer Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 relative z-10">
        <div className="flex items-center gap-2">
          {/* Save to Prayer Journal Button */}
          <button
            onClick={handleSaveToJournal}
            disabled={isAlreadySaved}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 ${
              isAlreadySaved
                ? 'bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 cursor-default'
                : 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950'
            }`}
          >
            {isAlreadySaved ? (
              <>
                <BookmarkCheck className="w-4 h-4 text-emerald-400" />
                <span>Salvo no Diário de Oração</span>
              </>
            ) : (
              <>
                <BookmarkPlus className="w-4 h-4" />
                <span>Salvar como Versículo do Dia no Diário</span>
              </>
            )}
          </button>

          {/* Quick link to journal if already saved */}
          {isAlreadySaved && onNavigateToJournal && (
            <button
              onClick={onNavigateToJournal}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-500 text-xs text-slate-300 hover:text-white transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5 text-slate-400" />
              <span>Ver no Diário</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* TTS Audio Button */}
          <button
            onClick={handleToggleSpeak}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
              isSpeaking
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300 hover:text-white'
            }`}
            title="Ouvir promessa em voz alta"
          >
            {isSpeaking ? (
              <>
                <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                <span>Silenciar</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Ouvir</span>
              </>
            )}
          </button>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 hover:text-white transition-colors"
            title="Copiar texto para compartilhar"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copiado</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Copiar</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
