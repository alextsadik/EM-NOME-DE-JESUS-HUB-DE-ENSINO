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
import { WorshipStationFooter } from './components/WorshipStationFooter';
import { MediaChamberModal } from './components/MediaChamberModal';
import { PraiseChallengeModal } from './components/PraiseChallengeModal';
import { AdminMediaStationModal } from './components/AdminMediaStationModal';
import { PrayerReminderNotificationModal } from './components/PrayerReminderNotificationModal';
import { RankDeAdoradores } from './components/RankDeAdoradores';
import { AvatarFrameSelectorModal } from './components/AvatarFrameSelectorModal';
import { VerseOfTheDayBanner } from './components/VerseOfTheDayBanner';
import { db, ensureAuthUser } from './services/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { prayerReminderService } from './services/prayerReminderService';
import {
  getMedalsProgress,
  INITIAL_PRAYER_ENTRIES,
  INITIAL_24H_PLAYLIST,
  DEFAULT_MAINTENANCE_CONFIG,
  INITIAL_STREAMS_CATALOG,
  DEFAULT_DAILY_GOALS_CONFIG
} from './data/biblicalContent';
import { soundService } from './services/soundEffects';
import {
  ActivePraiseMultiplier,
  PraiseChallenge,
  PraiseTrack24h,
  RadioMaintenanceConfig,
  CatalogStreamItem,
  PrayerReminder,
  DailySpiritualGoalsConfig,
} from './types/game';

const STORAGE_KEY = 'em_nome_de_jesus_game_state_v2';
const MULTIPLIER_STORAGE_KEY = 'em_nome_de_jesus_praise_multiplier';
const PLAYLIST_STORAGE_KEY = 'em_nome_de_jesus_radio_playlist_24h';
const MAINTENANCE_STORAGE_KEY = 'em_nome_de_jesus_radio_maintenance';
const CATALOG_STORAGE_KEY = 'em_nome_de_jesus_stream_catalog';
const DAILY_GOALS_STORAGE_KEY = 'em_nome_de_jesus_daily_spiritual_goals';

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
  radioListeningMinutes: 65,
  completedPraiseChallengesCount: 6,
  meditationMinutes: 40,
  worshipScore: 2350,
  worshipStreakDays: 8,
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
  unlockedHiddenBadges: [],
  claimedHiddenBadges: [],
};

export default function App() {
  const [activeTab, setActiveTab] = useState<
    'missoes' | 'decretos' | 'batalha' | 'vigilia' | 'diario' | 'pregacao' | 'pratica' | 'biblia' | 'rank'
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
  const [isMediaChamberOpen, setIsMediaChamberOpen] = useState<boolean>(false);
  const [isPraiseChallengeOpen, setIsPraiseChallengeOpen] = useState<boolean>(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);
  const [isAvatarFrameModalOpen, setIsAvatarFrameModalOpen] = useState<boolean>(false);
  const [activePrayerReminderAlert, setActivePrayerReminderAlert] = useState<PrayerReminder | null>(null);
  const [forcedTrack, setForcedTrack] = useState<PraiseTrack24h | null>(null);

  // 24H Praise Playlist State
  const [playlist24h, setPlaylist24h] = useState<PraiseTrack24h[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(PLAYLIST_STORAGE_KEY);
        if (saved) return JSON.parse(saved);
      } catch {
        // use default
      }
    }
    return INITIAL_24H_PLAYLIST;
  });

  // Radio Maintenance Configuration State
  const [maintenanceConfig, setMaintenanceConfig] = useState<RadioMaintenanceConfig>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(MAINTENANCE_STORAGE_KEY);
        if (saved) return JSON.parse(saved);
      } catch {
        // use default
      }
    }
    return DEFAULT_MAINTENANCE_CONFIG;
  });

  // Unified Streams Catalog State
  const [streamCatalog, setStreamCatalog] = useState<CatalogStreamItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(CATALOG_STORAGE_KEY);
        if (saved) return JSON.parse(saved);
      } catch {
        // use default
      }
    }
    return INITIAL_STREAMS_CATALOG;
  });

  // Daily Spiritual Goals Config State (Prayer, Decrees, Meditation)
  const [dailyGoalsConfig, setDailyGoalsConfig] = useState<DailySpiritualGoalsConfig>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(DAILY_GOALS_STORAGE_KEY);
        if (saved) return JSON.parse(saved);
      } catch {
        // use default
      }
    }
    return DEFAULT_DAILY_GOALS_CONFIG;
  });

  const [activeMultiplier, setActiveMultiplier] = useState<ActivePraiseMultiplier | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(MULTIPLIER_STORAGE_KEY);
        if (saved) {
          const parsed: ActivePraiseMultiplier = JSON.parse(saved);
          if (parsed.expiresAt > Date.now()) return parsed;
        }
      } catch {
        // ignore
      }
    }
    return null;
  });

  const medals = getMedalsProgress(stats);
  const unlockedMedalsCount = medals.filter((m) => m.isUnlocked).length;

  // Persist radio playlist, maintenance, catalog, and daily goals
  const handleSavePlaylist = (tracks: PraiseTrack24h[]) => {
    setPlaylist24h(tracks);
    try {
      localStorage.setItem(PLAYLIST_STORAGE_KEY, JSON.stringify(tracks));
    } catch {
      // storage unavailable
    }
  };

  const handleSaveMaintenance = (config: RadioMaintenanceConfig) => {
    setMaintenanceConfig(config);
    try {
      localStorage.setItem(MAINTENANCE_STORAGE_KEY, JSON.stringify(config));
    } catch {
      // storage unavailable
    }
  };

  const handleSaveCatalog = (cat: CatalogStreamItem[]) => {
    setStreamCatalog(cat);
    try {
      localStorage.setItem(CATALOG_STORAGE_KEY, JSON.stringify(cat));
    } catch {
      // storage unavailable
    }
  };

  const handleSaveDailyGoals = (config: DailySpiritualGoalsConfig) => {
    setDailyGoalsConfig(config);
    try {
      localStorage.setItem(DAILY_GOALS_STORAGE_KEY, JSON.stringify(config));
    } catch {
      // storage unavailable
    }
  };

  const handlePlayTrackNow = (track: PraiseTrack24h) => {
    setForcedTrack(track);
  };

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
    } catch {
      // storage unavailable
    }
  }, [stats]);

  // Scheduled prayer reminders background checker
  useEffect(() => {
    const checkScheduledReminders = () => {
      const dueReminder = prayerReminderService.checkDueReminder();
      if (dueReminder) {
        setActivePrayerReminderAlert(dueReminder);
      }
    };

    checkScheduledReminders();
    const interval = setInterval(checkScheduledReminders, 12000);
    return () => clearInterval(interval);
  }, []);

  // Persist and tick down active multiplier
  useEffect(() => {
    if (!activeMultiplier) {
      localStorage.removeItem(MULTIPLIER_STORAGE_KEY);
      return;
    }

    try {
      localStorage.setItem(MULTIPLIER_STORAGE_KEY, JSON.stringify(activeMultiplier));
    } catch {
      // ignore
    }

    const interval = setInterval(() => {
      if (Date.now() >= activeMultiplier.expiresAt) {
        setActiveMultiplier(null);
        localStorage.removeItem(MULTIPLIER_STORAGE_KEY);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeMultiplier]);

  // Sync user profile state with Firestore database
  useEffect(() => {
    let isMounted = true;
    async function syncProfile() {
      try {
        const user = await ensureAuthUser();
        const score = stats.worshipScore ?? 0;
        if (user && isMounted) {
          const userDocRef = doc(db, 'users', user.uid);
          await setDoc(
            userDocRef,
            {
              userId: user.uid,
              worshipScore: score,
              level: Math.floor(score / 500) + 1,
              selectedFrameId: stats.equippedAvatarFrameId || 'frame-gold-glory',
              unlockedFrames: ['frame-bronze-initiate'],
              updatedAt: new Date().toISOString(),
            },
            { merge: true }
          );
        }
      } catch (err) {
        console.warn('[Firebase] Profile sync in offline fallback mode:', err);
      }
    }
    syncProfile();
    return () => {
      isMounted = false;
    };
  }, [stats.worshipScore, stats.equippedAvatarFrameId]);

  const handleUpdateStats = (updater: React.SetStateAction<PlayerStats>) => {
    setStats((prevStats) => {
      let nextStats = typeof updater === 'function' ? updater(prevStats) : updater;

      // Apply active praise multiplier on fruits if any were gained
      if (activeMultiplier && activeMultiplier.multiplier > 1) {
        let hasFruitGain = false;
        const updatedFruits = { ...nextStats.fruits };
        (Object.keys(nextStats.fruits) as Array<keyof PlayerStats['fruits']>).forEach((key) => {
          const diff = nextStats.fruits[key] - prevStats.fruits[key];
          if (diff > 0) {
            const bonus = Math.round(diff * (activeMultiplier.multiplier - 1));
            if (bonus > 0) {
              updatedFruits[key] += bonus;
              hasFruitGain = true;
            }
          }
        });
        if (hasFruitGain) {
          nextStats = { ...nextStats, fruits: updatedFruits };
        }
      }

      // Check for mission completion interval trigger
      if (nextStats.completedMissions.length > prevStats.completedMissions.length) {
        setTimeout(() => {
          setIsPraiseChallengeOpen(true);
        }, 700);
      }

      return nextStats;
    });
  };

  const handleCompletePraiseChallenge = (challenge: PraiseChallenge) => {
    const expiresAt = Date.now() + challenge.durationMinutes * 60 * 1000;
    setActiveMultiplier({
      multiplier: challenge.multiplierBoost,
      expiresAt,
      challengeTitle: challenge.title,
      psalmRef: challenge.psalmRef,
      fruitRewardType: challenge.fruitRewardType,
    });

    const scoreBoost = Math.round(150 * challenge.multiplierBoost);

    // Reward fruits and adoration rank points immediately
    setStats((prev) => ({
      ...prev,
      completedPraiseChallengesCount: (prev.completedPraiseChallengesCount || 0) + 1,
      worshipScore: (prev.worshipScore || 0) + scoreBoost,
      fruits: {
        ...prev.fruits,
        [challenge.fruitRewardType]: (prev.fruits[challenge.fruitRewardType] || 0) + challenge.fruitAmount,
      },
    }));
  };

  const handleListeningMinuteTick = () => {
    setStats((prev) => {
      const bonus = activeMultiplier ? Math.round(10 * activeMultiplier.multiplier) : 10;
      return {
        ...prev,
        radioListeningMinutes: (prev.radioListeningMinutes || 0) + 1,
        worshipScore: (prev.worshipScore || 0) + bonus,
      };
    });
  };

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
      {/* 24h Rotating Scripture Banner on Grace & The Name of Jesus */}
      <VerseOfTheDayBanner
        onAddScore={(points) => {
          handleUpdateStats((prev) => ({
            ...prev,
            worshipScore: (prev.worshipScore || 0) + points,
          }));
        }}
      />

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
        onOpenAdmin={() => setIsAdminModalOpen(true)}
        maintenanceConfig={maintenanceConfig}
        stats={stats}
        onOpenAvatarFrames={() => setIsAvatarFrameModalOpen(true)}
      />

      {/* Scriptural Guiding Bar & Ministry Stats */}
      <FruitOfSpiritBar
        stats={stats}
        onOpenMedals={() => setIsMedalsModalOpen(true)}
        unlockedMedalsCount={unlockedMedalsCount}
      />

      {/* Main Dynamic View Area */}
      <main className="flex-1 pb-28 sm:pb-24">
        {activeTab === 'missoes' && (
          <MissionsView
            stats={stats}
            onUpdateStats={handleUpdateStats}
            onNavigateToDecree={handleNavigateToDecree}
            onNavigateToJournal={() => setActiveTab('diario')}
            maintenanceConfig={maintenanceConfig}
            dailyGoalsConfig={dailyGoalsConfig}
            onOpenAdmin={() => setIsAdminModalOpen(true)}
            onNavigateToRadio={() => {
              const footer = document.querySelector('footer');
              footer?.scrollIntoView({ behavior: 'smooth' });
            }}
          />
        )}

        {activeTab === 'decretos' && (
          <DecreesView
            stats={stats}
            onUpdateStats={handleUpdateStats}
            initialSelectedDecreeId={targetedDecreeId}
          />
        )}

        {activeTab === 'batalha' && (
          <SpiritualBattleView stats={stats} onUpdateStats={handleUpdateStats} />
        )}

        {activeTab === 'vigilia' && (
          <VigilanceMaranataView stats={stats} onUpdateStats={handleUpdateStats} />
        )}

        {activeTab === 'diario' && (
          <PrayerJournalView
            stats={stats}
            onUpdateStats={handleUpdateStats}
            onTriggerVisualReminder={(rem) => setActivePrayerReminderAlert(rem)}
          />
        )}

        {activeTab === 'pregacao' && (
          <PreachingWorkshopView stats={stats} onUpdateStats={handleUpdateStats} />
        )}

        {activeTab === 'pratica' && (
          <ColossiansPracticeView stats={stats} onUpdateStats={handleUpdateStats} />
        )}

        {activeTab === 'biblia' && <ScriptureLibraryView />}

        {activeTab === 'rank' && (
          <RankDeAdoradores
            stats={stats}
            onUpdateStats={handleUpdateStats}
            activeMultiplier={activeMultiplier}
            onOpenPraiseChallenge={() => setIsPraiseChallengeOpen(true)}
            onOpenMediaChamber={() => setIsMediaChamberOpen(true)}
            onTuneRadio={() => {
              const footer = document.querySelector('footer');
              footer?.scrollIntoView({ behavior: 'smooth' });
            }}
            onOpenAvatarFrames={() => setIsAvatarFrameModalOpen(true)}
          />
        )}
      </main>

      {/* Reconciliation Medals Modal */}
      <MedalsModal
        isOpen={isMedalsModalOpen}
        onClose={() => setIsMedalsModalOpen(false)}
        stats={stats}
        onUpdateStats={handleUpdateStats}
        onNavigateToTab={(tab) => {
          setActiveTab(tab);
          soundService.playScriptureTone();
        }}
      />

      {/* Media Chamber Modal (Videos, Podcasts & Worship Theology) */}
      <MediaChamberModal
        isOpen={isMediaChamberOpen}
        onClose={() => setIsMediaChamberOpen(false)}
      />

      {/* Praise Challenge Modal (Interval Psalms Gamification) */}
      <PraiseChallengeModal
        isOpen={isPraiseChallengeOpen}
        onClose={() => setIsPraiseChallengeOpen(false)}
        onCompleteChallenge={handleCompletePraiseChallenge}
        activeMultiplier={activeMultiplier}
      />

      {/* Admin Panel Modal (24h Praise Playlist, Maintenance Day/Hour & Streams Catalog) */}
      <AdminMediaStationModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        playlist24h={playlist24h}
        maintenanceConfig={maintenanceConfig}
        streamCatalog={streamCatalog}
        dailyGoalsConfig={dailyGoalsConfig}
        onSavePlaylist={handleSavePlaylist}
        onSaveMaintenance={handleSaveMaintenance}
        onSaveCatalog={handleSaveCatalog}
        onSaveDailyGoals={handleSaveDailyGoals}
        onPlayTrackNow={handlePlayTrackNow}
        playerStats={stats}
      />

      {/* Global Scheduled Prayer Reminder Modal (Colossians 3:17) */}
      <PrayerReminderNotificationModal
        isOpen={!!activePrayerReminderAlert}
        reminder={activePrayerReminderAlert}
        onClose={() => setActivePrayerReminderAlert(null)}
        onNavigateToJournal={() => {
          setActivePrayerReminderAlert(null);
          setActiveTab('diario');
          soundService.playScriptureTone();
        }}
        onUpdateStats={handleUpdateStats}
      />

      {/* Avatar Frames Customization Modal (500, 1000, 2000, 5000 pts) */}
      <AvatarFrameSelectorModal
        isOpen={isAvatarFrameModalOpen}
        onClose={() => setIsAvatarFrameModalOpen(false)}
        stats={stats}
        onUpdateStats={handleUpdateStats}
      />

      {/* Clean Reverent Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 px-4 md:px-8 pt-8 pb-24 text-xs text-slate-500">
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
              onClick={() => setIsAvatarFrameModalOpen(true)}
              className="text-amber-400 hover:text-amber-300 font-semibold transition-colors"
            >
              Molduras de Avatar
            </button>
            <button
              onClick={() => setIsAdminModalOpen(true)}
              className="text-amber-400 hover:text-amber-300 font-semibold transition-colors"
            >
              Admin Rádio 24h
            </button>
            <button
              onClick={() => setIsMedalsModalOpen(true)}
              className="text-amber-400 hover:text-amber-300 font-semibold transition-colors"
            >
              Medalhas ({unlockedMedalsCount}/8)
            </button>
            <button
              onClick={() => setIsPraiseChallengeOpen(true)}
              className="text-amber-400 hover:text-amber-300 font-semibold transition-colors"
            >
              Desafio dos Salmos
            </button>
            <button
              onClick={() => setIsMediaChamberOpen(true)}
              className="hover:text-amber-400 transition-colors"
            >
              Vídeos & Podcasts
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
              onClick={() => {
                setActiveTab('diario');
                soundService.playPrayerChime();
              }}
              className="text-amber-400/95 hover:text-amber-300 font-medium transition-colors"
            >
              Lembretes Cl 3:17
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
            <button
              onClick={() => {
                setActiveTab('rank');
                soundService.playVictoryChime();
              }}
              className="text-yellow-400 hover:text-yellow-300 font-bold transition-colors"
            >
              Rank de Adoradores
            </button>
          </div>
        </div>
      </footer>

      {/* Continuous Worship & Media Station Dock */}
      <WorshipStationFooter
        activeMultiplier={activeMultiplier}
        onOpenMediaChamber={() => setIsMediaChamberOpen(true)}
        onOpenPraiseChallenge={() => setIsPraiseChallengeOpen(true)}
        onOpenRank={() => {
          setActiveTab('rank');
          soundService.playVictoryChime();
        }}
        onListeningMinuteTick={handleListeningMinuteTick}
        playlist24h={playlist24h}
        maintenanceConfig={maintenanceConfig}
        onOpenAdmin={() => setIsAdminModalOpen(true)}
        forcedTrack={forcedTrack}
      />
    </div>
  );
}

