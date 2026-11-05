/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Target,
  Sparkles,
  CheckCircle2,
  BookOpen,
  Clock,
  Heart,
  Award,
  ChevronRight,
  Flame,
  ShieldCheck,
  Zap,
  Radio,
  ExternalLink,
  Volume2
} from 'lucide-react';
import { DailySpiritualGoalsConfig, PlayerStats } from '../types/game';
import { DEFAULT_DAILY_GOALS_CONFIG } from '../data/biblicalContent';
import { soundService } from '../services/soundEffects';

interface DailyGoalsFeedbackCardProps {
  stats: PlayerStats;
  onUpdateStats: (newStats: PlayerStats) => void;
  goalsConfig?: DailySpiritualGoalsConfig;
  onNavigateToDecree?: (decreeId: string) => void;
  onNavigateToJournal?: () => void;
  onOpenAdmin?: () => void;
  onNavigateToRadio?: () => void;
}

export const DailyGoalsFeedbackCard: React.FC<DailyGoalsFeedbackCardProps> = ({
  stats,
  onUpdateStats,
  goalsConfig = DEFAULT_DAILY_GOALS_CONFIG,
  onNavigateToDecree,
  onNavigateToJournal,
  onOpenAdmin,
  onNavigateToRadio,
}) => {
  const todayDateStr = new Date().toISOString().slice(0, 10);

  // Compute or read today's spiritual activity
  // If stats.todaySpiritualStats is from today, use it, otherwise fall back to computed or todayProgress
  const todayEntry = stats.todaySpiritualStats && stats.todaySpiritualStats.date === todayDateStr
    ? stats.todaySpiritualStats
    : {
        date: todayDateStr,
        prayers: stats.prayerEntries?.filter((p) => p.date === todayDateStr).length || 
                 (stats.dailyProgress?.find((d) => d.day === 'Hoje')?.oracoes) || 
                 3, // Default baseline for engaged player
        decrees: (stats.dailyProgress?.find((d) => d.day === 'Hoje')?.decretos) || 
                 Math.min(stats.proclaimedDecreesCount || 5, 5),
        meditationMinutes: (stats.radioListeningMinutes ? Math.floor(stats.radioListeningMinutes / 3) : 0) || 
                           (stats.meditationMinutes ? Math.min(stats.meditationMinutes, 15) : 15),
      };

  const prayersCount = todayEntry.prayers;
  const decreesCount = todayEntry.decrees;
  const meditationMinutes = todayEntry.meditationMinutes;

  // Goals targets
  const targetPrayers = goalsConfig.prayerTargetCount || 3;
  const targetDecrees = goalsConfig.decreesTargetCount || 5;
  const targetMeditation = goalsConfig.meditationMinutesTarget || 15;

  const isPrayerMet = prayersCount >= targetPrayers;
  const isDecreesMet = decreesCount >= targetDecrees;
  const isMeditationMet = meditationMinutes >= targetMeditation;

  const allGoalsMet = isPrayerMet && isDecreesMet && isMeditationMet;
  const isClaimedToday = stats.dailySpiritualGoalsClaimedDate === todayDateStr;

  const [hasCelebrated, setHasCelebrated] = useState<boolean>(false);
  const [showCelebrationModal, setShowCelebrationModal] = useState<boolean>(false);

  // Trigger celebration chime once when all goals are met
  useEffect(() => {
    if (allGoalsMet && !hasCelebrated && !isClaimedToday) {
      setHasCelebrated(true);
      soundService.playDailyGoalsCompletedChime();
    }
  }, [allGoalsMet, hasCelebrated, isClaimedToday]);

  const handleIncrementPrayer = () => {
    const updatedPrayers = prayersCount + 1;
    const updatedStats: PlayerStats = {
      ...stats,
      todaySpiritualStats: {
        ...todayEntry,
        prayers: updatedPrayers,
      },
      fruits: {
        ...stats.fruits,
        paz: stats.fruits.paz + 2,
      },
    };
    onUpdateStats(updatedStats);
    soundService.playScriptureTone();
  };

  const handleIncrementDecree = () => {
    const updatedDecrees = decreesCount + 1;
    const updatedStats: PlayerStats = {
      ...stats,
      proclaimedDecreesCount: (stats.proclaimedDecreesCount || 0) + 1,
      todaySpiritualStats: {
        ...todayEntry,
        decrees: updatedDecrees,
      },
      fruits: {
        ...stats.fruits,
        alegria: stats.fruits.alegria + 2,
      },
    };
    onUpdateStats(updatedStats);
    soundService.playCelestialDecreeSound();
  };

  const handleIncrementMeditation = () => {
    const updatedMeditation = meditationMinutes + 5;
    const updatedStats: PlayerStats = {
      ...stats,
      meditationMinutes: (stats.meditationMinutes || 0) + 5,
      todaySpiritualStats: {
        ...todayEntry,
        meditationMinutes: updatedMeditation,
      },
      fruits: {
        ...stats.fruits,
        fidelidade: stats.fruits.fidelidade + 2,
      },
    };
    onUpdateStats(updatedStats);
    soundService.playAngelicHarpChime();
  };

  const handleClaimReward = () => {
    if (!allGoalsMet || isClaimedToday) return;

    const fruit = goalsConfig.rewardFruit || 'alegria';
    const amount = goalsConfig.rewardFruitAmount || 25;
    const graceBonus = goalsConfig.rewardGraceBonus || 120;

    const updatedFruits = { ...stats.fruits };
    updatedFruits[fruit] = (updatedFruits[fruit] || 0) + amount;

    const updatedStats: PlayerStats = {
      ...stats,
      dailySpiritualGoalsClaimedDate: todayDateStr,
      worshipScore: (stats.worshipScore || 0) + graceBonus,
      fruits: updatedFruits,
    };

    onUpdateStats(updatedStats);
    soundService.playDailyGoalsCompletedChime();
    setShowCelebrationModal(true);
  };

  // Percentage calculations
  const prayerPct = Math.min(100, Math.round((prayersCount / targetPrayers) * 100));
  const decreesPct = Math.min(100, Math.round((decreesCount / targetDecrees) * 100));
  const meditationPct = Math.min(100, Math.round((meditationMinutes / targetMeditation) * 100));
  const overallPct = Math.round((prayerPct + decreesPct + meditationPct) / 3);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900/95 via-slate-900/90 to-slate-950 border border-amber-500/30 shadow-xl p-5 md:p-6 space-y-5">
      {/* Radiant Glow Behind Header if all goals met */}
      {allGoalsMet && (
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none animate-pulse" />
      )}

      {/* Header with Title and Overall Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
              <Target className="w-5 h-5" />
            </span>
            <h3 className="text-base md:text-lg font-bold font-cinzel text-amber-300">
              Metas Diárias do Jogador · Altar Devocional
            </h3>
            {allGoalsMet ? (
              <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1 animate-pulse">
                <CheckCircle2 className="w-3.5 h-3.5" />
                METAS BATIDAS!
              </span>
            ) : (
              <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                {overallPct}% Concluído Hoje
              </span>
            )}
          </div>
          <p className="text-xs text-slate-300">
            {goalsConfig.bannerNote || 'Consagrem suas horas diárias ao Senhor através da oração, proclamação e meditação contínua.'}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {onOpenAdmin && (
            <button
              onClick={onOpenAdmin}
              className="text-[11px] text-slate-400 hover:text-amber-300 flex items-center gap-1 transition-colors px-2 py-1 rounded bg-slate-800/60 border border-slate-700/60"
              title="Ajustar metas no Painel Administrativo"
            >
              <span>Ajustar Metas (Admin)</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* ALL GOALS COMPLETED CELEBRATION BANNER */}
      {allGoalsMet && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/70 via-slate-900 to-emerald-950/70 border-2 border-amber-400/80 shadow-lg shadow-amber-500/10 flex flex-col md:flex-row items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-center gap-3.5 text-center md:text-left">
            <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-400/50 flex items-center justify-center text-amber-300 shrink-0 shadow-inner">
              <Sparkles className="w-6 h-6 animate-spin text-amber-300" style={{ animationDuration: '6s' }} />
            </div>
            <div>
              <div className="flex items-center justify-center md:justify-start gap-2">
                <h4 className="text-sm md:text-base font-bold text-amber-200">
                  Glorificado Seja Deus! Todas as Metas do Dia Atingidas!
                </h4>
                <span className="text-xs">🎉</span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Você orou, proclamou a Palavra e meditou na presença de Jesus. "Tudo quanto fizerdes, fazei-o em Nome do Senhor Jesus." (Colossenses 3:17)
              </p>
            </div>
          </div>

          <div className="shrink-0 w-full md:w-auto">
            {isClaimedToday ? (
              <div className="px-4 py-2 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Recompensa Consagrada Hoje!</span>
              </div>
            ) : (
              <button
                onClick={handleClaimReward}
                className="w-full md:w-auto px-5 py-2.5 rounded-xl text-xs md:text-sm font-bold bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 shadow-xl shadow-amber-400/30 transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2 font-cinzel ring-2 ring-amber-300/60"
              >
                <Award className="w-4 h-4 text-slate-950" />
                <span>Resgatar Recompensa (+{goalsConfig.rewardFruitAmount} {goalsConfig.rewardFruit.toUpperCase()} & +{goalsConfig.rewardGraceBonus} Graça)</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Grid of 3 Core Goals Progress Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1. Prayer Progress Card */}
        <div className={`p-4 rounded-xl border transition-all relative ${
          isPrayerMet
            ? 'bg-sky-950/30 border-sky-400/60 shadow-md ring-1 ring-sky-400/30'
            : 'bg-slate-950/60 border-slate-800'
        }`}>
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                isPrayerMet ? 'bg-sky-400/20 text-sky-300' : 'bg-slate-800 text-slate-400'
              }`}>
                <Heart className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200">1. Oração Diária</h4>
                <span className="text-[10px] text-slate-400">Colossenses 4:2</span>
              </div>
            </div>

            {isPrayerMet ? (
              <span className="flex items-center gap-1 text-[11px] font-bold text-sky-400 bg-sky-950/80 px-2 py-0.5 rounded-full border border-sky-400/40">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Batida!
              </span>
            ) : (
              <span className="text-xs font-bold text-slate-400 font-mono">
                {prayersCount} / {targetPrayers}
              </span>
            )}
          </div>

          {/* Progress Bar */}
          <div className="space-y-1 mb-3">
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isPrayerMet ? 'bg-gradient-to-r from-sky-400 to-blue-400' : 'bg-sky-500'
                }`}
                style={{ width: `${prayerPct}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>{prayersCount} orações registradas</span>
              <span>{prayerPct}%</span>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex items-center gap-2 pt-1 border-t border-slate-800/80">
            <button
              onClick={handleIncrementPrayer}
              className="flex-1 py-1.5 px-2 rounded-lg text-[11px] font-medium bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 flex items-center justify-center gap-1 transition-colors"
            >
              <span>+1 Oração Rápida</span>
            </button>
            {onNavigateToJournal && (
              <button
                onClick={onNavigateToJournal}
                className="py-1.5 px-2 rounded-lg text-[11px] font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                title="Abrir Diário de Oração"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* 2. Decrees Progress Card */}
        <div className={`p-4 rounded-xl border transition-all relative ${
          isDecreesMet
            ? 'bg-amber-950/30 border-amber-400/60 shadow-md ring-1 ring-amber-400/30'
            : 'bg-slate-950/60 border-slate-800'
        }`}>
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                isDecreesMet ? 'bg-amber-400/20 text-amber-300' : 'bg-slate-800 text-slate-400'
              }`}>
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200">2. Decretos de Fé</h4>
                <span className="text-[10px] text-slate-400">Jó 22:28</span>
              </div>
            </div>

            {isDecreesMet ? (
              <span className="flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-400/40">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Batida!
              </span>
            ) : (
              <span className="text-xs font-bold text-slate-400 font-mono">
                {decreesCount} / {targetDecrees}
              </span>
            )}
          </div>

          {/* Progress Bar */}
          <div className="space-y-1 mb-3">
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isDecreesMet ? 'bg-gradient-to-r from-amber-400 to-yellow-400' : 'bg-amber-500'
                }`}
                style={{ width: `${decreesPct}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>{decreesCount} decretos proclamados</span>
              <span>{decreesPct}%</span>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex items-center gap-2 pt-1 border-t border-slate-800/80">
            <button
              onClick={handleIncrementDecree}
              className="flex-1 py-1.5 px-2 rounded-lg text-[11px] font-medium bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 flex items-center justify-center gap-1 transition-colors"
            >
              <span>+1 Proclamar</span>
            </button>
            {onNavigateToDecree && (
              <button
                onClick={() => onNavigateToDecree('dec-1')}
                className="py-1.5 px-2 rounded-lg text-[11px] font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                title="Ver Lista de Decretos"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* 3. Meditation Progress Card */}
        <div className={`p-4 rounded-xl border transition-all relative ${
          isMeditationMet
            ? 'bg-emerald-950/30 border-emerald-400/60 shadow-md ring-1 ring-emerald-400/30'
            : 'bg-slate-950/60 border-slate-800'
        }`}>
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                isMeditationMet ? 'bg-emerald-400/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
              }`}>
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200">3. Meditação Bíblica</h4>
                <span className="text-[10px] text-slate-400">Salmos 1:2</span>
              </div>
            </div>

            {isMeditationMet ? (
              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-400/40">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Batida!
              </span>
            ) : (
              <span className="text-xs font-bold text-slate-400 font-mono">
                {meditationMinutes}m / {targetMeditation}m
              </span>
            )}
          </div>

          {/* Progress Bar */}
          <div className="space-y-1 mb-3">
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isMeditationMet ? 'bg-gradient-to-r from-emerald-400 to-teal-400' : 'bg-emerald-500'
                }`}
                style={{ width: `${meditationPct}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>{meditationMinutes} minutos no Altar</span>
              <span>{meditationPct}%</span>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex items-center gap-2 pt-1 border-t border-slate-800/80">
            <button
              onClick={handleIncrementMeditation}
              className="flex-1 py-1.5 px-2 rounded-lg text-[11px] font-medium bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 flex items-center justify-center gap-1 transition-colors"
            >
              <span>+5 Minutos</span>
            </button>
            {onNavigateToRadio && (
              <button
                onClick={onNavigateToRadio}
                className="py-1.5 px-2 rounded-lg text-[11px] font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                title="Ligar Rádio 24h & Meditação"
              >
                <Radio className="w-3.5 h-3.5 text-amber-400" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Celebration Popup Modal */}
      {showCelebrationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-slate-900 border-2 border-amber-400 rounded-2xl p-6 text-center space-y-4 shadow-2xl shadow-amber-500/20">
            <div className="w-16 h-16 mx-auto rounded-full bg-amber-400/20 border-2 border-amber-400 flex items-center justify-center text-amber-300 animate-bounce">
              <Award className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <span className="text-xs uppercase tracking-wider text-amber-400 font-bold">
                Vitória Celestial · Altar Consagrado
              </span>
              <h3 className="text-xl font-bold font-cinzel text-white">
                Metas Diárias Batidas com Louvor!
              </h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              "E a paz de Deus, que excede todo o entendimento, guardará os vossos corações e os vossos sentimentos em Cristo Jesus." (Filipenses 4:7)
            </p>

            <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-200 text-xs font-semibold flex items-center justify-center gap-3">
              <span>✨ +{goalsConfig.rewardFruitAmount} Fruto de {goalsConfig.rewardFruit.toUpperCase()}</span>
              <span>⭐ +{goalsConfig.rewardGraceBonus} Pontos de Graça</span>
            </div>

            <button
              onClick={() => setShowCelebrationModal(false)}
              className="w-full py-2.5 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 transition-colors font-cinzel"
            >
              Amém e Glória a Deus!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
