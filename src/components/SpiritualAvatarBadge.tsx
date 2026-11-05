/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Crown,
  Sparkles,
  ChevronRight,
  Award,
  BookOpen,
  Shield,
  X,
  Volume2,
  CheckCircle2,
  Lock,
  Flame
} from 'lucide-react';
import { PlayerStats, MaturityTierId, SpiritualMaturityTier } from '../types/game';
import {
  SPIRITUAL_MATURITY_TIERS,
  getSpiritualMaturity,
  getNextMaturityTier,
  getMaturityProgress,
} from '../data/spiritualMaturity';
import { calculateWorshipScore } from '../data/biblicalContent';
import { soundService } from '../services/soundEffects';
import { AvatarFrame } from './AvatarFrame';

interface SpiritualAvatarBadgeProps {
  stats: PlayerStats;
  onOpenMedals?: () => void;
  onOpenFrameSelector?: () => void;
  size?: 'sm' | 'md' | 'lg';
  showTitle?: boolean;
}

export const SpiritualAvatarBadge: React.FC<SpiritualAvatarBadgeProps> = ({
  stats,
  onOpenMedals,
  onOpenFrameSelector,
  size = 'md',
  showTitle = true,
}) => {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const worshipScore = calculateWorshipScore(stats);
  const { currentTier, nextTier, progressPercent, pointsToNext } = getMaturityProgress(worshipScore);

  const handleOpenDetails = () => {
    soundService.playScriptureTone();
    setIsDetailsOpen(true);
  };

  const avatarSizeClass =
    size === 'sm'
      ? 'w-7 h-7 text-xs'
      : size === 'lg'
      ? 'w-14 h-14 text-xl'
      : 'w-9 h-9 text-sm';

  return (
    <>
      {/* Trigger Button with Ornamental Frame and Animated Gradient */}
      <button
        onClick={handleOpenDetails}
        className="group relative flex items-center gap-2 p-1 rounded-xl hover:bg-slate-900/80 transition-all text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
        title={`Nível de Maturidade: ${currentTier.title} (${worshipScore.toLocaleString()} pts) · Clique para ver privilégios`}
      >
        <AvatarFrame
          stats={stats}
          size={size === 'lg' ? 'lg' : size === 'sm' ? 'sm' : 'md'}
          showAura={true}
          showBadgeChip={true}
        />

        {/* Title & Score (Optional based on prop) */}
        {showTitle && (
          <div className="hidden sm:flex flex-col min-w-0 pr-1">
            <div className="flex items-center gap-1.5 leading-none">
              <span className="font-cinzel text-xs font-bold text-amber-300 truncate group-hover:text-amber-200 transition-colors">
                {currentTier.title}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono tabular-nums leading-tight mt-0.5">
              {worshipScore.toLocaleString()} pts de Adoração
            </span>
          </div>
        )}
      </button>

      {/* Modal / Dialog: Patamar de Maturidade Espiritual */}
      {isDetailsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            {/* Header */}
            <div className="px-5 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Crown className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold font-cinzel text-amber-300">
                    Níveis de Maturidade Espiritual
                  </h2>
                  <p className="text-xs text-slate-400">
                    Crescimento bíblico no altar pela prática de Colossenses 3:17 e adoração contínua.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsDetailsOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                aria-label="Fechar detalhes de maturidade"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {/* CURRENT TIER HIGHLIGHT CARD */}
              <div
                className={`p-5 rounded-2xl border bg-gradient-to-br ${currentTier.frameStyle.bannerGradient} ${currentTier.frameStyle.borderClass} relative overflow-hidden`}
              >
                {/* Background Aura */}
                <div
                  className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full pointer-events-none opacity-40 blur-2xl"
                  style={{ background: currentTier.frameStyle.auraStyle }}
                />

                <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {/* Golden Seal Avatar with Radiant Aura */}
                    <div
                      className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl font-bold bg-slate-950 ${currentTier.frameStyle.borderClass} ${currentTier.frameStyle.glowClass}`}
                      style={{ background: currentTier.frameStyle.auraStyle }}
                    >
                      <span>{currentTier.badgeSymbol}</span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${currentTier.frameStyle.ribbonColor}`}>
                          Nível {currentTier.levelNumber} · {currentTier.title}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold font-cinzel text-amber-200 mt-1">
                        {currentTier.spiritualEpithet}
                      </h3>
                      <p className="text-xs text-slate-300 mt-0.5">
                        {currentTier.theologicalPrivilege}
                      </p>
                    </div>
                  </div>

                  <div className="text-right sm:self-center shrink-0">
                    <span className="text-xs text-slate-400 block">Pontuação Atual</span>
                    <span className="text-xl font-bold font-mono text-amber-300 tabular-nums">
                      {worshipScore.toLocaleString()}
                    </span>
                    <span className="text-[11px] text-slate-500 block">WorshipScore</span>
                  </div>
                </div>

                {/* Scripture Anchor Quote */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-start gap-2 text-xs text-amber-300/90 italic">
                  <BookOpen className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span>"{currentTier.scriptureText}"</span>
                    <span className="font-semibold text-amber-400 ml-1.5 font-cinzel">({currentTier.scriptureRef})</span>
                  </div>
                </div>

                {/* Progress to Next Tier Bar */}
                {nextTier ? (
                  <div className="mt-4 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        Próximo Patamar: <strong className="text-amber-300 font-cinzel">{nextTier.title}</strong>
                      </span>
                      <span className="text-slate-400 font-mono">
                        Faltam {pointsToNext.toLocaleString()} pts ({progressPercent}%)
                      </span>
                    </div>

                    <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 rounded-full transition-all duration-700"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 p-2.5 rounded-xl bg-amber-500/10 border border-amber-400/30 text-xs text-amber-300 flex items-center gap-2">
                    <Crown className="w-4 h-4 text-yellow-300" />
                    <span>Você alcançou o patamar mais alto da Adoração em Espírito e em Verdade!</span>
                  </div>
                )}
              </div>

              {/* UNLOCKED PRIVILEGES OF CURRENT TIER */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  Privilégios e Selos Ativos deste Patamar
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {currentTier.unlockedPrivileges.map((priv, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-2.5 text-xs text-slate-200"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{priv}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ALL 6 TIERS HIERARCHY */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-amber-400" />
                  A Escada da Maturidade no Altar
                </h4>

                <div className="space-y-2">
                  {SPIRITUAL_MATURITY_TIERS.map((tier) => {
                    const isPassed = worshipScore >= tier.minScore;
                    const isCurrent = tier.id === currentTier.id;

                    return (
                      <div
                        key={tier.id}
                        className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
                          isCurrent
                            ? 'bg-amber-950/30 border-amber-400/70 shadow-md ring-1 ring-amber-400/30'
                            : isPassed
                            ? 'bg-slate-950/60 border-slate-800 text-slate-300'
                            : 'bg-slate-950/30 border-slate-900 text-slate-600 opacity-60'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                              isCurrent
                                ? `${tier.frameStyle.borderClass} bg-slate-900 text-amber-200 shadow-md`
                                : isPassed
                                ? 'bg-slate-800 text-slate-300'
                                : 'bg-slate-900 text-slate-600 border border-slate-800'
                            }`}
                          >
                            <span>{tier.badgeSymbol}</span>
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={`text-xs font-bold font-cinzel ${isCurrent ? 'text-amber-300' : isPassed ? 'text-slate-200' : 'text-slate-500'}`}>
                                {tier.title}
                              </span>
                              {isCurrent && (
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                                  ATUAL
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400 truncate">
                              {tier.spiritualEpithet}
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-xs font-mono font-semibold text-slate-300">
                            {tier.minScore.toLocaleString()} pts
                          </span>
                          <span className="text-[10px] text-slate-500 block">
                            {isPassed ? 'Alcançado' : 'Bloqueado'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-3.5 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1.5 text-amber-400 font-medium">
                <Sparkles className="w-3.5 h-3.5" />
                Pontue ouvindo a Rádio 24h, completando Salmos e em meditação!
              </span>

              <div className="flex items-center gap-2">
                {onOpenFrameSelector && (
                  <button
                    onClick={() => {
                      setIsDetailsOpen(false);
                      onOpenFrameSelector();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/40 text-xs font-semibold transition-colors flex items-center gap-1.5"
                    title="Ver Molduras de Avatar Desbloqueadas (500, 1000, 2000, 5000 pts)"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Molduras de Avatar</span>
                  </button>
                )}
                {onOpenMedals && (
                  <button
                    onClick={() => {
                      setIsDetailsOpen(false);
                      onOpenMedals();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold transition-colors flex items-center gap-1"
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>Ver Medalhas & Conquistas</span>
                  </button>
                )}
                <button
                  onClick={() => setIsDetailsOpen(false)}
                  className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
