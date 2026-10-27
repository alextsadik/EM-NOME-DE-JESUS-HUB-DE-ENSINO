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
} from 'lucide-react';
import { PlayerStats, ReconciliationMedal } from '../types/game';
import { getMedalsProgress } from '../data/biblicalContent';
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
  const [selectedCategory, setSelectedCategory] = useState<string>('todas');
  const [justCelebratedId, setJustCelebratedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const medals = getMedalsProgress(stats);
  const unlockedCount = medals.filter((m) => m.isUnlocked).length;
  const totalCount = medals.length;
  const completionPercentage = Math.round((unlockedCount / totalCount) * 100);

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
                Medalhas de Reconciliação
              </h2>
              <p className="text-xs md:text-sm text-slate-400">
                Conquistas espirituais do Ministério da Graça e da Fé em Cristo Jesus
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

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-950/80 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <p>
            As medalhas são fruto da fidelidade ministerial e da graça derramada por Cristo Jesus.
          </p>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
