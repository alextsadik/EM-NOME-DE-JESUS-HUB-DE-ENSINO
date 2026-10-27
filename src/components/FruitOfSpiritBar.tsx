/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { PlayerStats } from '../types/game';
import { Heart, ShieldCheck, Flame, Sparkles, Award } from 'lucide-react';

interface FruitOfSpiritBarProps {
  stats: PlayerStats;
  currentVerseText?: string;
  currentVerseRef?: string;
  onOpenMedals?: () => void;
  unlockedMedalsCount?: number;
}

export const FruitOfSpiritBar: React.FC<FruitOfSpiritBarProps> = ({
  stats,
  currentVerseText = 'Porque não temos que lutar contra a carne e o sangue, mas contra principados e potestades... E tudo fazei em nome do Senhor Jesus.',
  currentVerseRef = 'Efésios 6:12 & Cl 3:17',
  onOpenMedals,
  unlockedMedalsCount = 0,
}) => {
  return (
    <div className="w-full bg-slate-900/60 border-b border-slate-800 px-4 md:px-8 py-3">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Guiding Scripture Banner (clean typography, no pill box) */}
        <div className="flex items-center gap-3 text-xs md:text-sm text-slate-300 max-w-3xl">
          <span className="font-cinzel text-amber-400 font-semibold shrink-0">
            {currentVerseRef}
          </span>
          <span className="text-slate-600 select-none">/</span>
          <span className="italic text-slate-300 line-clamp-1">
            "{currentVerseText}"
          </span>
        </div>

        {/* Biblical ministry stats (clean unboxed text with typographic separators) */}
        <div className="flex items-center gap-4 text-xs text-slate-400 tabular-nums overflow-x-auto">
          {onOpenMedals && (
            <>
              <button
                onClick={onOpenMedals}
                className="flex items-center gap-1.5 whitespace-nowrap hover:text-amber-300 transition-colors group cursor-pointer"
                title="Ver Medalhas de Reconciliação"
              >
                <Award className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
                <span className="text-amber-300 font-semibold">{unlockedMedalsCount}/8</span>
                <span className="text-slate-300 group-hover:text-amber-200">Medalhas</span>
              </button>
              <span className="text-slate-700 select-none">·</span>
            </>
          )}

          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <Heart className="w-3.5 h-3.5 text-rose-400/90" />
            <span className="text-slate-200 font-semibold">{stats.reconciledCount}</span>
            <span>Vidas Reconciliadas</span>
          </div>
          <span className="text-slate-700 select-none">·</span>

          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <Sparkles className="w-3.5 h-3.5 text-sky-400/90" />
            <span className="text-slate-200 font-semibold">{stats.angelicAidInvokedCount || 0}</span>
            <span>Ajudas Celestiais (Sl 103)</span>
          </div>
          <span className="text-slate-700 select-none">·</span>

          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <Flame className="w-3.5 h-3.5 text-amber-400/90" />
            <span className="text-slate-200 font-semibold">{stats.proclaimedDecreesCount}</span>
            <span>Decretos</span>
          </div>
          <span className="text-slate-700 select-none">·</span>

          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400/90" />
            <span className="text-slate-200 font-semibold">{stats.completedMissions.length}/5</span>
            <span>Capítulos</span>
          </div>
        </div>
      </div>
    </div>
  );
};
