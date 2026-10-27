/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { PlayerStats } from './types/game';
import { TopBar } from './components/TopBar';
import { FruitOfSpiritBar } from './components/FruitOfSpiritBar';
import { MissionsView } from './components/MissionsView';
import { DecreesView } from './components/DecreesView';
import { SpiritualBattleView } from './components/SpiritualBattleView';
import { VigilanceMaranataView } from './components/VigilanceMaranataView';
import { PreachingWorkshopView } from './components/PreachingWorkshopView';
import { ColossiansPracticeView } from './components/ColossiansPracticeView';
import { ScriptureLibraryView } from './components/ScriptureLibraryView';
import { PrayerJournalView } from './components/PrayerJournalView';
import { MedalsModal } from './components/MedalsModal';
import { getMedalsProgress, INITIAL_PRAYER_ENTRIES } from './data/biblicalContent';
import { soundService } from './services/soundEffects';

const STORAGE_KEY = 'em_nome_de_jesus_game_state_v2';

const defaultStats: PlayerStats = {
  reconciledCount: 0,
  proclaimedDecreesCount: 0,
  sermonsDeliveredCount: 0,
  completedMissions: [],
  unlockedDecrees: ['dec-1', 'dec-2', 'dec-7', 'dec-8'],
  angelicAidInvokedCount: 0,
  spiritualVisionUsedCount: 0,
  strongmanBoundCount: 0,
  maranataProclaimedCount: 0,
  dailyProgress: [
    { day: 'Seg', oracoes: 4, decretos: 5, jugosQuebrados: 2 },
    { day: 'Ter', oracoes: 6, decretos: 7, jugosQuebrados: 4 },
    { day: 'Qua', oracoes: 5, decretos: 6, jugosQuebrados: 3 },
    { day: 'Qui', oracoes: 8, decretos: 9, jugosQuebrados: 6 },
    { day: 'Sex', oracoes: 7, decretos: 8, jugosQuebrados: 5 },
    { day: 'Sáb', oracoes: 9, decretos: 11, jugosQuebrados: 7 },
    { day: 'Hoje', oracoes: 6, decretos: 8, jugosQuebrados: 5 },
  ],
  prayerEntries: INITIAL_PRAYER_ENTRIES,
  fruits: {
    amor: 20,
    alegria: 20,
    paz: 20,
    longanimidade: 10,
    benignidade: 10,
    bondade: 10,
    fidelidade: 15,
    mansidao: 10,
    dominioProprio: 10,
  },
};

export default function App() {
  const [activeTab, setActiveTab] = useState<
    'missoes' | 'decretos' | 'batalha' | 'vigilia' | 'diario' | 'pregacao' | 'pratica' | 'biblia'
  >('missoes');
  const [soundMuted, setSoundMuted] = useState<boolean>(false);
  const [stats, setStats] = useState<PlayerStats>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) return JSON.parse(saved);
      } catch {
        // use default
      }
    }
    return defaultStats;
  });

  const [targetedDecreeId, setTargetedDecreeId] = useState<string | undefined>(undefined);
  const [isMedalsModalOpen, setIsMedalsModalOpen] = useState<boolean>(false);

  const medals = getMedalsProgress(stats);
  const unlockedMedalsCount = medals.filter((m) => m.isUnlocked).length;

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
    } catch {
      // storage unavailable
    }
  }, [stats]);

  const handleToggleSound = () => {
    const nextMuted = !soundMuted;
    setSoundMuted(nextMuted);
    soundService.setMuted(nextMuted);
  };

  const handleNavigateToDecree = (decreeId: string) => {
    setTargetedDecreeId(decreeId);
    setActiveTab('decretos');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* 3-Zone Top Navigation Contract */}
      <TopBar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          soundService.playScriptureTone();
        }}
        soundMuted={soundMuted}
        onToggleSound={handleToggleSound}
        reconciledCount={stats.reconciledCount}
        onOpenMedals={() => setIsMedalsModalOpen(true)}
        unlockedMedalsCount={unlockedMedalsCount}
      />

      {/* Scriptural Guiding Bar & Ministry Stats */}
      <FruitOfSpiritBar
        stats={stats}
        onOpenMedals={() => setIsMedalsModalOpen(true)}
        unlockedMedalsCount={unlockedMedalsCount}
      />

      {/* Main Dynamic View Area */}
      <main className="flex-1 pb-16">
        {activeTab === 'missoes' && (
          <MissionsView
            stats={stats}
            onUpdateStats={setStats}
            onNavigateToDecree={handleNavigateToDecree}
            onNavigateToJournal={() => setActiveTab('diario')}
          />
        )}

        {activeTab === 'decretos' && (
          <DecreesView
            stats={stats}
            onUpdateStats={setStats}
            initialSelectedDecreeId={targetedDecreeId}
          />
        )}

        {activeTab === 'batalha' && (
          <SpiritualBattleView stats={stats} onUpdateStats={setStats} />
        )}

        {activeTab === 'vigilia' && (
          <VigilanceMaranataView stats={stats} onUpdateStats={setStats} />
        )}

        {activeTab === 'diario' && (
          <PrayerJournalView stats={stats} onUpdateStats={setStats} />
        )}

        {activeTab === 'pregacao' && (
          <PreachingWorkshopView stats={stats} onUpdateStats={setStats} />
        )}

        {activeTab === 'pratica' && (
          <ColossiansPracticeView stats={stats} onUpdateStats={setStats} />
        )}

        {activeTab === 'biblia' && <ScriptureLibraryView />}
      </main>

      {/* Reconciliation Medals Modal */}
      <MedalsModal
        isOpen={isMedalsModalOpen}
        onClose={() => setIsMedalsModalOpen(false)}
        stats={stats}
        onUpdateStats={setStats}
        onNavigateToTab={(tab) => {
          setActiveTab(tab);
          soundService.playScriptureTone();
        }}
      />

      {/* Clean Reverent Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 px-4 md:px-8 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="space-y-1">
            <p className="font-cinzel text-slate-400 font-semibold tracking-wide">
              Em Nome de Jesus Cristo · Nossa Fonte de Vida e Eterna Esperança · Maranata!
            </p>
            <p className="text-slate-500">
              "E tudo quanto fizerdes por palavras ou por obras, fazei-o em nome do Senhor Jesus, dando por ele graças a Deus Pai." — Colossenses 3:17
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center md:justify-end gap-5 text-slate-400">
            <button
              onClick={() => setIsMedalsModalOpen(true)}
              className="text-amber-400 hover:text-amber-300 font-semibold transition-colors"
            >
              Medalhas ({unlockedMedalsCount}/8)
            </button>
            <button
              onClick={() => setActiveTab('missoes')}
              className="hover:text-amber-400 transition-colors"
            >
              Missões
            </button>
            <button
              onClick={() => setActiveTab('decretos')}
              className="hover:text-amber-400 transition-colors"
            >
              Decretos
            </button>
            <button
              onClick={() => setActiveTab('batalha')}
              className="hover:text-amber-400 transition-colors"
            >
              Batalha da Fé
            </button>
            <button
              onClick={() => setActiveTab('vigilia')}
              className="hover:text-amber-400 transition-colors"
            >
              Vigília Maranata
            </button>
            <button
              onClick={() => setActiveTab('diario')}
              className="hover:text-amber-400 transition-colors"
            >
              Diário de Oração
            </button>
            <button
              onClick={() => setActiveTab('pratica')}
              className="hover:text-amber-400 transition-colors"
            >
              Obediência
            </button>
            <button
              onClick={() => setActiveTab('biblia')}
              className="hover:text-amber-400 transition-colors"
            >
              Escrituras
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
