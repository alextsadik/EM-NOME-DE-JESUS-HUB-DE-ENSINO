/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Volume2, VolumeX, Sparkles, Award } from 'lucide-react';
import { soundService } from '../services/soundEffects';

interface TopBarProps {
  activeTab: 'missoes' | 'decretos' | 'batalha' | 'vigilia' | 'diario' | 'pregacao' | 'pratica' | 'biblia';
  onSelectTab: (
    tab: 'missoes' | 'decretos' | 'batalha' | 'vigilia' | 'diario' | 'pregacao' | 'pratica' | 'biblia'
  ) => void;
  soundMuted: boolean;
  onToggleSound: () => void;
  reconciledCount: number;
  onOpenMedals?: () => void;
  unlockedMedalsCount?: number;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  onSelectTab,
  soundMuted,
  onToggleSound,
  onOpenMedals,
  unlockedMedalsCount = 0,
}) => {
  return (
    <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-amber-500/20 px-4 md:px-8 py-3.5 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
        {/* Zone 1: Brand title wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onSelectTab('missoes')}
            className="flex items-center gap-2 text-left group"
          >
            <span className="font-cinzel text-lg md:text-xl font-bold tracking-tight text-amber-300 group-hover:text-amber-200 transition-colors whitespace-nowrap">
              Em Nome de Jesus
            </span>
          </button>
        </div>

        {/* Zone 2: Navigation links (single line, clean typography) */}
        <nav className="hidden xl:flex items-center gap-5 text-sm font-medium text-slate-300">
          <button
            onClick={() => onSelectTab('missoes')}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-amber-300 pb-1 ${
              activeTab === 'missoes'
                ? 'text-amber-300 border-b-2 border-amber-400 font-semibold'
                : 'text-slate-300'
            }`}
          >
            Missões
          </button>
          <button
            onClick={() => onSelectTab('decretos')}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-amber-300 pb-1 ${
              activeTab === 'decretos'
                ? 'text-amber-300 border-b-2 border-amber-400 font-semibold'
                : 'text-slate-300'
            }`}
          >
            Altar dos Decretos
          </button>
          <button
            onClick={() => onSelectTab('batalha')}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-amber-300 pb-1 ${
              activeTab === 'batalha'
                ? 'text-amber-300 border-b-2 border-amber-400 font-semibold'
                : 'text-slate-300'
            }`}
          >
            Batalha da Fé
          </button>
          <button
            onClick={() => onSelectTab('vigilia')}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-amber-300 pb-1 ${
              activeTab === 'vigilia'
                ? 'text-amber-300 border-b-2 border-amber-400 font-semibold'
                : 'text-slate-300'
            }`}
          >
            Vigília Maranata
          </button>
          <button
            onClick={() => onSelectTab('diario')}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-amber-300 pb-1 ${
              activeTab === 'diario'
                ? 'text-amber-300 border-b-2 border-amber-400 font-semibold'
                : 'text-slate-300'
            }`}
          >
            Diário de Oração
          </button>
          <button
            onClick={() => onSelectTab('pregacao')}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-amber-300 pb-1 ${
              activeTab === 'pregacao'
                ? 'text-amber-300 border-b-2 border-amber-400 font-semibold'
                : 'text-slate-300'
            }`}
          >
            Oficina da Pregação
          </button>
          <button
            onClick={() => onSelectTab('pratica')}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-amber-300 pb-1 ${
              activeTab === 'pratica'
                ? 'text-amber-300 border-b-2 border-amber-400 font-semibold'
                : 'text-slate-300'
            }`}
          >
            Prática Cl 3:17
          </button>
          <button
            onClick={() => onSelectTab('biblia')}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-amber-300 pb-1 ${
              activeTab === 'biblia'
                ? 'text-amber-300 border-b-2 border-amber-400 font-semibold'
                : 'text-slate-300'
            }`}
          >
            Bíblia da Graça
          </button>
        </nav>

        {/* Zone 3: Single primary action & accessibility sound control */}
        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          <button
            onClick={onToggleSound}
            aria-label={soundMuted ? 'Ativar som celestial' : 'Silenciar sons'}
            className="p-2 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-slate-900 border border-slate-800 transition-colors"
            title={soundMuted ? 'Ativar Som' : 'Silenciar'}
          >
            {soundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
          </button>

          {onOpenMedals && (
            <button
              onClick={onOpenMedals}
              className="flex items-center gap-1.5 px-3 py-2 text-xs md:text-sm font-semibold text-amber-300 hover:text-amber-200 bg-slate-900/90 hover:bg-slate-800 border border-amber-500/30 rounded-lg transition-all active:scale-95 shadow-sm"
              title="Ver Medalhas de Reconciliação"
            >
              <Award className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Medalhas</span>
              <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                {unlockedMedalsCount}
              </span>
            </button>
          )}

          <button
            onClick={() => {
              onSelectTab('batalha');
              soundService.playYokeBrokenSound();
            }}
            className="flex items-center gap-2 px-3.5 md:px-4 py-2 text-xs md:text-sm font-semibold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 rounded-lg shadow-sm transition-all whitespace-nowrap active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            <span>Voz de Comando</span>
          </button>
        </div>
      </div>

      {/* Nav strip for smaller screens */}
      <div className="flex xl:hidden items-center gap-2 pt-2.5 mt-2 border-t border-slate-800/80 text-xs text-slate-300 overflow-x-auto pb-1">
        {onOpenMedals && (
          <button
            onClick={onOpenMedals}
            className="px-2.5 py-1 rounded whitespace-nowrap text-amber-300 font-semibold bg-amber-500/10 border border-amber-500/20 flex items-center gap-1"
          >
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>Medalhas ({unlockedMedalsCount})</span>
          </button>
        )}
        <button
          onClick={() => onSelectTab('missoes')}
          className={`px-3 py-1 rounded whitespace-nowrap ${activeTab === 'missoes' ? 'text-amber-300 font-semibold bg-slate-900' : ''}`}
        >
          Missões
        </button>
        <button
          onClick={() => onSelectTab('decretos')}
          className={`px-3 py-1 rounded whitespace-nowrap ${activeTab === 'decretos' ? 'text-amber-300 font-semibold bg-slate-900' : ''}`}
        >
          Decretos
        </button>
        <button
          onClick={() => onSelectTab('batalha')}
          className={`px-3 py-1 rounded whitespace-nowrap ${activeTab === 'batalha' ? 'text-amber-300 font-semibold bg-slate-900' : ''}`}
        >
          Batalha da Fé
        </button>
        <button
          onClick={() => onSelectTab('vigilia')}
          className={`px-3 py-1 rounded whitespace-nowrap ${activeTab === 'vigilia' ? 'text-amber-300 font-semibold bg-slate-900' : ''}`}
        >
          Vigília Maranata
        </button>
        <button
          onClick={() => onSelectTab('diario')}
          className={`px-3 py-1 rounded whitespace-nowrap ${activeTab === 'diario' ? 'text-amber-300 font-semibold bg-slate-900' : ''}`}
        >
          Diário
        </button>
        <button
          onClick={() => onSelectTab('pregacao')}
          className={`px-3 py-1 rounded whitespace-nowrap ${activeTab === 'pregacao' ? 'text-amber-300 font-semibold bg-slate-900' : ''}`}
        >
          Pregação
        </button>
        <button
          onClick={() => onSelectTab('pratica')}
          className={`px-3 py-1 rounded whitespace-nowrap ${activeTab === 'pratica' ? 'text-amber-300 font-semibold bg-slate-900' : ''}`}
        >
          Cl 3:17
        </button>
        <button
          onClick={() => onSelectTab('biblia')}
          className={`px-3 py-1 rounded whitespace-nowrap ${activeTab === 'biblia' ? 'text-amber-300 font-semibold bg-slate-900' : ''}`}
        >
          Bíblia
        </button>
      </div>
    </header>
  );
};
