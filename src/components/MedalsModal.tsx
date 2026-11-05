/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Award,
  Shield,
  Flame,
  Heart,
  Sparkles,
  Book,
  Compass,
  Crown,
  CheckCircle2,
  Lock,
  X,
  Volume2,
  ChevronRight,
  TrendingUp,
  Moon,
  Music,
  Eye,
  HelpCircle,
  BookOpen,
  Scroll,
} from 'lucide-react';
import { PlayerStats, ReconciliationMedal, HiddenBadge } from '../types/game';
import { getMedalsProgress } from '../data/biblicalContent';
import { getHiddenBadgesProgress } from '../data/hiddenBadges';
import { soundService } from '../services/soundEffects';

interface MedalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: PlayerStats;
  onUpdateStats?: (updater: (prev: PlayerStats) => PlayerStats) => void;
  onNavigateToTab?: (
    tab: 'missoes' | 'decretos' | 'batalha' | 'vigilia' | 'diario' | 'pregacao' | 'pratica' | 'biblia'
  ) => void;
}

export const MedalsModal: React.FC<MedalsModalProps> = ({
  isOpen,
  onClose,
  stats,
  onUpdateStats,
  onNavigateToTab,
}) => {
  const [activeModalTab, setActiveModalTab] = useState<'ministeriais' | 'ocultas'>('ministeriais');
  const [selectedCategory, setSelectedCategory] = useState<string>('todas');
  const [justCelebratedId, setJustCelebratedId] = useState<string | null>(null);
  const [selectedPropheticBadge, setSelectedPropheticBadge] = useState<HiddenBadge | null>(null);

  if (!isOpen) return null;

  const medals = getMedalsProgress(stats);
  const unlockedCount = medals.filter((m) => m.isUnlocked).length;
  const totalCount = medals.length;
  const completionPercentage = Math.round((unlockedCount / totalCount) * 100);

  const hiddenBadges = getHiddenBadgesProgress(stats);
  const unlockedHiddenCount = hiddenBadges.filter((b) => b.isUnlocked).length;
  const totalHiddenCount = hiddenBadges.length;
  const hiddenCompletionPercentage = Math.round((unlockedHiddenCount / totalHiddenCount) * 100);

  const filteredMedals = medals.filter((m) => {
    if (selectedCategory === 'todas') return true;
    return m.category === selectedCategory;
  });

  const getIcon = (iconName: ReconciliationMedal['iconName'], isUnlocked: boolean) => {
    const className = isUnlocked ? 'w-5 h-5 text-amber-300' : 'w-5 h-5 text-slate-500';
    switch (iconName) {
      case 'shield':
        return <Shield className={className} />;
      case 'flame':
        return <Flame className={className} />;
      case 'heart':
        return <Heart className={className} />;
      case 'sparkles':
        return <Sparkles className={className} />;
      case 'book':
        return <Book className={className} />;
      case 'compass':
        return <Compass className={className} />;
      case 'crown':
        return <Crown className={className} />;
      case 'award':
      default:
        return <Award className={className} />;
    }
  };

  const handleCelebrateMedal = (medal: ReconciliationMedal) => {
    soundService.playMedalUnlockedChime();
    setJustCelebratedId(medal.id);
    setTimeout(() => setJustCelebratedId(null), 3000);

    if (onUpdateStats) {
      onUpdateStats((prev) => {
        const alreadyClaimed = prev.claimedMedals?.includes(medal.id);
        if (alreadyClaimed) return prev;
        return {
          ...prev,
          claimedMedals: [...(prev.claimedMedals || []), medal.id],
        };
      });
    }
  };

  const handleProclaimMedalScripture = (medal: ReconciliationMedal) => {
    soundService.playScriptureTone();
    soundService.speakText(`${medal.title}. ${medal.scriptureRef}: ${medal.scriptureText}`);
  };

  const getHiddenBadgeIcon = (iconName: HiddenBadge['iconName'], isUnlocked: boolean) => {
    const className = isUnlocked ? 'w-6 h-6 text-amber-300' : 'w-6 h-6 text-slate-600';
    switch (iconName) {
      case 'moon':
        return <Moon className={className} />;
      case 'music':
        return <Music className={className} />;
      case 'flame':
        return <Flame className={className} />;
      case 'sparkles':
        return <Sparkles className={className} />;
      case 'crown':
        return <Crown className={className} />;
      case 'compass':
        return <Compass className={className} />;
      case 'heart':
        return <Heart className={className} />;
      case 'book':
        return <Book className={className} />;
      case 'shield':
      default:
        return <Shield className={className} />;
    }
  };

  const handleCelebrateHiddenBadge = (badge: HiddenBadge) => {
    soundService.playDailyGoalsCompletedChime();
    setJustCelebratedId(badge.id);
    setTimeout(() => setJustCelebratedId(null), 3000);

    if (onUpdateStats) {
      onUpdateStats((prev) => {
        const alreadyClaimed = prev.claimedHiddenBadges?.includes(badge.id);
        if (alreadyClaimed) return prev;
        const updatedFruits = { ...prev.fruits };
        updatedFruits[badge.rewardFruit] = (updatedFruits[badge.rewardFruit] || 0) + badge.rewardFruitAmount;
        return {
          ...prev,
          claimedHiddenBadges: [...(prev.claimedHiddenBadges || []), badge.id],
          unlockedHiddenBadges: [...(prev.unlockedHiddenBadges || []), badge.id],
          worshipScore: (prev.worshipScore || 0) + badge.rewardGraceBonus,
          fruits: updatedFruits,
        };
      });
    }
  };

  const handleProclaimHiddenScripture = (badge: HiddenBadge) => {
    soundService.playScriptureTone();
    soundService.speakText(`${badge.title}. ${badge.scriptureRef}: ${badge.scriptureText}`);
  };

  const handleOpenPropheticClue = (badge: HiddenBadge) => {
    soundService.playScriptureTone();
    setSelectedPropheticBadge(badge);
  };

  const handleProclaimPropheticRiddle = (badge: HiddenBadge) => {
    soundService.playScriptureTone();
    const riddleText = badge.propheticRiddle || badge.secretHint;
    soundService.speakText(`Dica de Profeta. ${badge.scriptureRef}: ${badge.scriptureText}. ${riddleText}`);
  };

  const getTargetViewByMedal = (
    medalId: string
  ): 'missoes' | 'decretos' | 'batalha' | 'vigilia' | 'diario' | 'pregacao' | 'pratica' | null => {
    switch (medalId) {
      case 'guerreiro_da_fe':
        return 'batalha';
      case 'arauto_da_graca':
        return 'decretos';
      case 'embaixador_reconciliacao':
        return 'missoes';
      case 'sentinela_maranata':
        return 'vigilia';
      case 'mestre_cristocentrico':
        return 'pregacao';
      case 'praticante_colossenses':
        return 'pratica';
      case 'amigo_das_hostes':
        return 'batalha';
      case 'fruto_maduro':
        return 'missoes';
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
      <div
        className="relative w-full max-w-4xl bg-slate-900 border border-amber-500/30 rounded-2xl shadow-2xl shadow-black/80 flex flex-col max-h-[92vh] overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="medals-title"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h2
                id="medals-title"
                className="font-cinzel text-xl md:text-2xl font-bold text-amber-300"
              >
                Altar das Medalhas & Conquistas
              </h2>
              <p className="text-xs md:text-sm text-slate-400">
                Galardões da graça, perseverança na fé e mistérios revelados do Reino em Cristo Jesus
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="Fechar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher: Medalhas Ministeriais vs Conquistas Ocultas */}
        <div className="px-6 pt-3 bg-slate-950/80 border-b border-slate-800 flex items-center gap-3 text-xs sm:text-sm font-semibold">
          <button
            onClick={() => {
              setActiveModalTab('ministeriais');
              soundService.playScriptureTone();
            }}
            className={`px-4 py-2.5 rounded-t-lg transition-colors flex items-center gap-2 border-b-2 ${
              activeModalTab === 'ministeriais'
                ? 'border-amber-400 text-amber-300 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Award className="w-4 h-4 text-amber-400" />
            <span>Medalhas Ministeriais ({unlockedCount}/{totalCount})</span>
          </button>

          <button
            onClick={() => {
              setActiveModalTab('ocultas');
              soundService.playScriptureTone();
            }}
            className={`px-4 py-2.5 rounded-t-lg transition-colors flex items-center gap-2 border-b-2 ${
              activeModalTab === 'ocultas'
                ? 'border-amber-400 text-amber-300 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Conquistas Ocultas ({unlockedHiddenCount}/{totalHiddenCount})</span>
            {unlockedHiddenCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            )}
          </button>
        </div>

        {activeModalTab === 'ministeriais' && (
          <>

        {/* Global Progress & Apostolic Reminder */}
        <div className="px-6 py-4 bg-gradient-to-r from-amber-950/20 via-slate-900 to-slate-950 border-b border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="w-full sm:w-auto flex-1">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-300 font-medium flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                Progresso Ministerial da Fé
              </span>
              <span className="font-semibold text-amber-300 tabular-nums">
                {unlockedCount} de {totalCount} Conquistas ({completionPercentage}%)
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700/60">
              <div
                className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300 h-2 rounded-full transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>

          <div className="hidden lg:block text-right shrink-0">
            <p className="text-xs italic text-slate-400">
              "Combati o bom combate, acabei a carreira, guardei a fé."
            </p>
            <p className="text-[11px] font-cinzel text-amber-400/90 font-medium">
              2 Timóteo 4:7
            </p>
          </div>
        </div>

        {/* Filter categories */}
        <div className="px-6 py-2.5 bg-slate-950/40 border-b border-slate-800/60 flex items-center gap-2 overflow-x-auto text-xs">
          {[
            { id: 'todas', label: 'Todas as Medalhas' },
            { id: 'autoridade', label: 'Autoridade & Batalha' },
            { id: 'graça', label: 'Graça & Justificação' },
            { id: 'reconciliação', label: 'Reconciliação' },
            { id: 'vigília', label: 'Vigília Maranata' },
            { id: 'obediência', label: 'Obediência Cl 3:17' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Medals List Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMedals.map((medal) => {
              const progressPct = Math.min(
                100,
                Math.round((medal.currentValue / medal.targetCount) * 100)
              );
              const isCelebrated = justCelebratedId === medal.id;
              const targetTab = getTargetViewByMedal(medal.id);

              return (
                <div
                  key={medal.id}
                  className={`p-4 rounded-xl border transition-all relative flex flex-col justify-between ${
                    medal.isUnlocked
                      ? 'bg-gradient-to-br from-slate-900 via-amber-950/15 to-slate-900 border-amber-500/40 shadow-sm shadow-amber-950/20'
                      : 'bg-slate-950/50 border-slate-800/80 text-slate-400'
                  }`}
                >
                  {/* Top card info */}
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2.5">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-xl border ${
                            medal.isUnlocked
                              ? 'bg-amber-500/20 border-amber-500/40 shadow-sm'
                              : 'bg-slate-800/40 border-slate-700/40'
                          }`}
                        >
                          {getIcon(medal.iconName, medal.isUnlocked)}
                        </div>

                        <div>
                          <h3
                            className={`font-cinzel font-bold text-base ${
                              medal.isUnlocked ? 'text-amber-200' : 'text-slate-300'
                            }`}
                          >
                            {medal.title}
                          </h3>
                          <span className="text-[11px] uppercase tracking-wider text-slate-500">
                            {medal.category}
                          </span>
                        </div>
                      </div>

                      {/* Status indicator */}
                      <div>
                        {medal.isUnlocked ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-950/60 text-emerald-300 border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            Alcançada
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-800 text-slate-400 border border-slate-700">
                            <Lock className="w-3 h-3 text-slate-500" />
                            Em Progresso
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 mb-3 leading-relaxed">
                      {medal.subtitle}
                    </p>

                    {/* Biblical quote & context */}
                    <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/70 text-xs text-slate-400 mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-cinzel text-amber-400 font-semibold text-[11px]">
                          {medal.scriptureRef}
                        </span>
                        <button
                          onClick={() => handleProclaimMedalScripture(medal)}
                          className="text-slate-400 hover:text-amber-300 transition-colors p-1"
                          title="Ouvir versículo sagrado"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="italic text-slate-300 text-[11px] line-clamp-2">
                        "{medal.scriptureText}"
                      </p>
                    </div>

                    {/* Theological reward / Fruit */}
                    <div className="text-[11px] text-slate-400 mb-3 flex items-start gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-slate-300 font-medium">Recompensa Teológica:</strong>{' '}
                        {medal.theologicalReward}
                      </span>
                    </div>
                  </div>

                  {/* Card bottom progress & actions */}
                  <div className="pt-2 border-t border-slate-800/60">
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                      <span>Metas do Ministério:</span>
                      <span className="tabular-nums font-medium text-slate-200">
                        {medal.currentValue} / {medal.targetCount} {medal.unitLabel}
                      </span>
                    </div>

                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden mb-3">
                      <div
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          medal.isUnlocked
                            ? 'bg-gradient-to-r from-amber-400 to-amber-300'
                            : 'bg-amber-500/60'
                        }`}
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      {medal.isUnlocked ? (
                        <button
                          onClick={() => handleCelebrateMedal(medal)}
                          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                            isCelebrated
                              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                              : 'bg-amber-400/90 hover:bg-amber-300 text-slate-950'
                          }`}
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>{isCelebrated ? 'Glória a Deus!' : 'Celebrar Conquista'}</span>
                        </button>
                      ) : (
                        targetTab &&
                        onNavigateToTab && (
                          <button
                            onClick={() => {
                              onNavigateToTab(targetTab);
                              onClose();
                            }}
                            className="flex-1 py-1.5 px-3 rounded-lg text-xs font-medium text-amber-300 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 flex items-center justify-center gap-1 transition-colors"
                          >
                            <span>Avançar nesta Meta</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        )
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </>
    )}

    {/* ======================================================== */}
    {/* TAB 2: CONQUISTAS OCULTAS DO REINO (SECRET BADGES)       */}
    {/* ======================================================== */}
    {activeModalTab === 'ocultas' && (
      <>
        {/* Global Progress & Mystery Callout */}
        <div className="px-6 py-4 bg-gradient-to-r from-purple-950/30 via-slate-900 to-amber-950/20 border-b border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="w-full sm:w-auto flex-1">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-purple-300 font-medium flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Mistérios do Reino Revelados
              </span>
              <span className="font-semibold text-amber-300 tabular-nums">
                {unlockedHiddenCount} de {totalHiddenCount} Conquistas ({hiddenCompletionPercentage}%)
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700/60">
              <div
                className="bg-gradient-to-r from-purple-500 via-amber-400 to-yellow-300 h-2 rounded-full transition-all duration-500"
                style={{ width: `${hiddenCompletionPercentage}%` }}
              />
            </div>
          </div>

          <div className="hidden lg:block text-right shrink-0">
            <p className="text-xs italic text-slate-400">
              "A vós outros é dado conhecer os mistérios do reino de Deus."
            </p>
            <p className="text-[11px] font-cinzel text-purple-300 font-medium">
              Lucas 8:10
            </p>
          </div>
        </div>

        {/* Sub-header instruction */}
        <div className="px-6 py-2.5 bg-slate-950/60 border-b border-slate-800/60 text-xs text-slate-400 flex items-center justify-between">
          <span>
            As insígnias secretas permanecem como silhuetas místicas até que o discípulo atinja o marco bíblico pela fé.
          </span>
          <span className="text-amber-400/90 font-semibold hidden md:inline">
            Siga as pistas nas escrituras sagradas!
          </span>
        </div>

        {/* Hidden Badges Grid Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {hiddenBadges.map((badge) => {
              const progressPct = Math.min(
                100,
                Math.round((badge.currentValue / badge.targetValue) * 100)
              );
              const isCelebrated = justCelebratedId === badge.id;
              const isClaimed = stats.claimedHiddenBadges?.includes(badge.id);

              return (
                <div
                  key={badge.id}
                  className={`relative rounded-xl border p-5 transition-all flex flex-col justify-between ${
                    badge.isUnlocked
                      ? 'bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-950 border-amber-400/60 shadow-xl shadow-amber-500/10 ring-1 ring-amber-400/30'
                      : 'bg-slate-950/70 border-slate-800/80 opacity-75 hover:opacity-90'
                  }`}
                >
                  <div>
                    {/* Header of Badge Card */}
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-3">
                        {/* Icon with Silhouette effect if locked (clickable to reveal prophetic riddle) */}
                        {badge.isUnlocked ? (
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border transition-all bg-gradient-to-br from-amber-500/20 to-yellow-500/10 border-amber-400/50 text-amber-300 shadow-lg shadow-amber-500/20">
                            {getHiddenBadgeIcon(badge.iconName, true)}
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleOpenPropheticClue(badge)}
                            className="group/sil relative focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 rounded-xl transition-transform hover:scale-105 active:scale-95"
                            title="Clique sobre a silhueta para consultar a Dica de Profeta e o enigma bíblico"
                          >
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border transition-all bg-slate-950 border-purple-500/40 group-hover/sil:border-purple-400 text-purple-400/60 group-hover/sil:text-purple-300 shadow-md group-hover/sil:shadow-purple-500/30">
                              {getHiddenBadgeIcon(badge.iconName, false)}
                              <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-purple-950 border border-purple-400/80 flex items-center justify-center text-[9px] text-purple-200 shadow-sm">
                                <Eye className="w-2.5 h-2.5" />
                              </div>
                            </div>
                          </button>
                        )}

                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className={`font-cinzel font-bold text-sm md:text-base ${badge.isUnlocked ? 'text-amber-200' : 'text-slate-300'}`}>
                              {badge.isUnlocked ? badge.title : '??? · Conquista Oculta'}
                            </h3>
                          </div>
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            {badge.isUnlocked ? (
                              badge.scriptureRef
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleOpenPropheticClue(badge)}
                                className="text-purple-400 hover:text-purple-300 flex items-center gap-1 font-medium transition-colors"
                              >
                                <Eye className="w-3 h-3" />
                                <span>Ver Dica de Profeta</span>
                              </button>
                            )}
                          </span>
                        </div>
                      </div>

                      {badge.isUnlocked ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 border border-amber-400/40 text-amber-300 shrink-0 animate-pulse">
                          <Sparkles className="w-3.5 h-3.5" />
                          Revelada!
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleOpenPropheticClue(badge)}
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-purple-950/60 hover:bg-purple-900/80 text-purple-300 hover:text-purple-200 shrink-0 border border-purple-500/40 transition-colors"
                          title="Clique para abrir enigma"
                        >
                          <Lock className="w-3 h-3 text-purple-400" />
                          <span>Dica Bíblica</span>
                        </button>
                      )}
                    </div>

                    {/* Revealed Description or Mysterious Subtle Hint with Prophet's Clue trigger */}
                    {badge.isUnlocked ? (
                      <div className="mt-3 p-3 rounded-lg bg-slate-950/70 border border-amber-500/20 mb-3 space-y-2">
                        <p className="text-xs text-slate-200 leading-relaxed font-medium">
                          {badge.revealedDescription}
                        </p>
                        <div className="pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-amber-300 font-cinzel">
                          <span>"{badge.scriptureText}"</span>
                          <button
                            onClick={() => handleProclaimHiddenScripture(badge)}
                            className="text-slate-400 hover:text-amber-300 flex items-center gap-1 transition-colors shrink-0 ml-2"
                            title="Ouvir proclamação bíblica"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                            <span className="text-[10px]">Ouvir</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => handleOpenPropheticClue(badge)}
                        className="mt-3 p-3 rounded-lg bg-gradient-to-r from-purple-950/40 via-slate-900/90 to-slate-950 border border-purple-500/30 hover:border-purple-400/70 cursor-pointer transition-all group/hint space-y-1.5 shadow-sm mb-3"
                        title="Clique para ver o Enigma Completo e o Versículo do Profeta"
                      >
                        <div className="flex items-center justify-between text-[11px]">
                          <div className="flex items-center gap-1.5 text-purple-300 font-semibold">
                            <Eye className="w-3.5 h-3.5 text-purple-400 shrink-0 group-hover/hint:animate-pulse" />
                            <span>Dica de Profeta · Clique para Revelar</span>
                          </div>
                          <span className="text-[10px] text-purple-400/90 font-mono font-bold group-hover/hint:text-purple-200">
                            {badge.scriptureRef} →
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 italic leading-relaxed line-clamp-2 group-hover/hint:text-amber-200/90 transition-colors">
                          "{badge.secretHint}"
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Progress Bar & Reward Action */}
                  <div className="pt-2 border-t border-slate-800/60">
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                      <span>Progresso da Revelação:</span>
                      <span className="tabular-nums font-mono font-medium text-slate-300">
                        {badge.currentValue.toLocaleString()} / {badge.targetValue.toLocaleString()} {badge.metricLabel}
                      </span>
                    </div>

                    <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden mb-3 border border-slate-800">
                      <div
                        className={`h-1.5 rounded-full transition-all duration-500 ${
                          badge.isUnlocked
                            ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-300'
                            : 'bg-slate-700'
                        }`}
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>

                    {/* Reward Button / Status */}
                    {badge.isUnlocked ? (
                      isClaimed ? (
                        <div className="py-1.5 px-3 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Recompensa Celestial já Consagrada!</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleCelebrateHiddenBadge(badge)}
                          className={`w-full py-2 px-3 rounded-lg text-xs font-bold font-cinzel flex items-center justify-center gap-2 shadow-lg transition-all ${
                            isCelebrated
                              ? 'bg-emerald-500 text-slate-950'
                              : 'bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 shadow-amber-500/20'
                          }`}
                        >
                          <Sparkles className="w-4 h-4 text-slate-950" />
                          <span>
                            {isCelebrated
                              ? 'Bênção Resgatada com Louvor!'
                              : `Reclamar Bênção (+${badge.rewardFruitAmount} ${badge.rewardFruit.toUpperCase()} & +${badge.rewardGraceBonus} Graça)`}
                          </span>
                        </button>
                      )
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleOpenPropheticClue(badge)}
                        className="w-full py-2 px-3 rounded-lg bg-purple-950/60 hover:bg-purple-900/80 border border-purple-500/40 hover:border-purple-400/70 text-purple-200 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-sm"
                      >
                        <Eye className="w-3.5 h-3.5 text-purple-400" />
                        <span>Consultar Dica de Profeta (Enigma Bíblico)</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </>
    )}

    {/* Modal Footer */}
    <div className="px-6 py-4 bg-slate-950/80 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
      <p>
        {activeModalTab === 'ocultas'
          ? 'As conquistas secretas incentivam a busca sincera por intimidade, vigília e louvor contínuo.'
          : 'As medalhas são fruto da fidelidade ministerial e da graça derramada por Cristo Jesus.'}
      </p>

      <button
        onClick={onClose}
        className="w-full sm:w-auto px-5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors"
      >
        Fechar
      </button>
    </div>
      </div>

      {/* ======================================================== */}
      {/* DICA DE PROFETA · ENIGMA BÍBLICO MODAL OVERLAY            */}
      {/* ======================================================== */}
      {selectedPropheticBadge && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          aria-labelledby="prophetic-clue-title"
        >
          <div className="relative w-full max-w-lg bg-gradient-to-br from-purple-950/90 via-slate-900 to-slate-950 border-2 border-purple-500/50 rounded-2xl p-6 shadow-2xl text-slate-100 space-y-5 animate-in zoom-in-95 duration-200">
            {/* Top Close Button */}
            <button
              type="button"
              onClick={() => setSelectedPropheticBadge(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Fechar dica do profeta"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3.5 border-b border-purple-500/30 pb-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-400/50 flex items-center justify-center text-purple-300 shrink-0 shadow-lg shadow-purple-500/20">
                <Eye className="w-6 h-6 text-purple-300 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-purple-300 font-bold block">
                  Revelação Oculta · Oráculo Bíblico
                </span>
                <h3 id="prophetic-clue-title" className="font-cinzel text-lg md:text-xl font-bold text-amber-200">
                  Dica de Profeta
                </h3>
                <p className="text-xs text-slate-400">
                  {selectedPropheticBadge.isUnlocked
                    ? `Insígnia: ${selectedPropheticBadge.title}`
                    : 'Enigma sagrado para romper a silhueta desta conquista'}
                </p>
              </div>
            </div>

            {/* Scriptural Enigma Anchor Box */}
            <div className="p-4 rounded-xl bg-slate-950/90 border border-purple-500/40 space-y-2 shadow-inner">
              <div className="flex items-center justify-between">
                <span className="font-cinzel font-bold text-amber-300 text-xs md:text-sm flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-amber-400" />
                  {selectedPropheticBadge.scriptureRef}
                </span>
                <button
                  type="button"
                  onClick={() => handleProclaimPropheticRiddle(selectedPropheticBadge)}
                  className="text-xs text-purple-300 hover:text-purple-200 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-500/20 border border-purple-400/30 transition-colors"
                  title="Ouvir o versículo e a profecia"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Ouvir</span>
                </button>
              </div>

              <blockquote className="italic text-xs md:text-sm text-slate-200 leading-relaxed border-l-2 border-amber-400/60 pl-3 py-1">
                "{selectedPropheticBadge.scriptureText}"
              </blockquote>
            </div>

            {/* Prophetic Riddle Interpretation */}
            <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-500/30 space-y-2">
              <span className="text-xs font-bold font-cinzel text-purple-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                O Enigma do Profeta:
              </span>
              <p className="text-xs md:text-sm text-amber-100/95 leading-relaxed font-serif">
                {selectedPropheticBadge.propheticRiddle || selectedPropheticBadge.secretHint}
              </p>
            </div>

            {/* Current Revelation Progress */}
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
              <span>Progresso Atual:</span>
              <span className="font-mono font-bold text-amber-300">
                {selectedPropheticBadge.currentValue.toLocaleString()} / {selectedPropheticBadge.targetValue.toLocaleString()} {selectedPropheticBadge.metricLabel}
              </span>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end gap-3 border-t border-purple-500/30">
              <button
                type="button"
                onClick={() => handleProclaimPropheticRiddle(selectedPropheticBadge)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <Volume2 className="w-4 h-4 text-purple-300" />
                <span>Proclamar Enigma</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedPropheticBadge(null)}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-slate-950 font-bold text-xs md:text-sm shadow-md transition-all active:scale-95"
              >
                Compreendi o Enigma
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
