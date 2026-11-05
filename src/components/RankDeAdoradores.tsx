/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Trophy, 
  Crown, 
  Sparkles, 
  Radio, 
  Heart, 
  Flame, 
  Clock, 
  Compass, 
  Award, 
  Play, 
  Pause, 
  CheckCircle2, 
  Volume2, 
  VolumeX, 
  Filter, 
  TrendingUp, 
  Shield, 
  Music, 
  BookOpen, 
  HelpCircle,
  ChevronRight,
  ArrowUpRight,
  Zap,
  RotateCcw
} from 'lucide-react';
import { 
  PlayerStats, 
  ActivePraiseMultiplier, 
  WorshipRankEntry, 
  WorshipTimeframeFilter, 
  WorshiperTier 
} from '../types/game';
import { 
  DEFAULT_FELLOWSHIP_WORSHIPERS, 
  WORSHIP_TIERS_CONFIG, 
  MEDITATION_SESSIONS, 
  MeditationPrompt,
  getWorshiperTier, 
  calculateWorshipScore 
} from '../data/biblicalContent';
import { soundService } from '../services/soundEffects';
import { AvatarFrame } from './AvatarFrame';

interface RankDeAdoradoresProps {
  stats: PlayerStats;
  onUpdateStats: (updater: React.SetStateAction<PlayerStats>) => void;
  activeMultiplier: ActivePraiseMultiplier | null;
  onOpenPraiseChallenge: () => void;
  onOpenMediaChamber?: () => void;
  onTuneRadio?: () => void;
  onOpenAvatarFrames?: () => void;
}

export const RankDeAdoradores: React.FC<RankDeAdoradoresProps> = ({
  stats,
  onUpdateStats,
  activeMultiplier,
  onOpenPraiseChallenge,
  onOpenMediaChamber,
  onTuneRadio,
  onOpenAvatarFrames,
}) => {
  const [timeframe, setTimeframe] = useState<WorshipTimeframeFilter>('semanal');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedMeditation, setSelectedMeditation] = useState<MeditationPrompt | null>(null);
  const [meditationTimerActive, setMeditationTimerActive] = useState<boolean>(false);
  const [meditationSecondsLeft, setMeditationSecondsLeft] = useState<number>(0);
  const [isTierInfoOpen, setIsTierInfoOpen] = useState<boolean>(false);
  const [celebrationMessage, setCelebrationMessage] = useState<string | null>(null);

  const synthIntervalRef = useRef<number | null>(null);

  // Compute current user score and tier
  const userRadioMinutes = stats.radioListeningMinutes || 45;
  const userChallenges = stats.completedPraiseChallengesCount || 5;
  const userMeditationMinutes = stats.meditationMinutes || 30;
  const userScore = calculateWorshipScore(stats);
  const userStreak = stats.worshipStreakDays || 7;
  const currentTier = getWorshiperTier(userScore);

  // Calculate points to next tier
  const tiersList = Object.values(WORSHIP_TIERS_CONFIG);
  const currentTierIndex = tiersList.findIndex((t) => t.tier === currentTier.tier);
  const nextTier = currentTierIndex < tiersList.length - 1 ? tiersList[currentTierIndex + 1] : null;
  const pointsToNext = nextTier ? Math.max(0, nextTier.minPoints - userScore) : 0;
  const tierProgressPercent = nextTier 
    ? Math.min(100, Math.round(((userScore - currentTier.minPoints) / (nextTier.minPoints - currentTier.minPoints)) * 100))
    : 100;

  // Build combined leaderboard with user inserted
  const currentUserEntry: WorshipRankEntry = {
    id: 'user-current',
    name: 'Você (Ministro da Graça)',
    title: currentTier.label,
    avatarInitial: 'V',
    radioMinutes: userRadioMinutes,
    challengesCompleted: userChallenges,
    meditationMinutes: userMeditationMinutes,
    totalPoints: userScore,
    streakDays: userStreak,
    isCurrentUser: true,
    recentActivity: activeMultiplier ? 'Multiplicador de Louvor Ativo!' : 'Adoração Contínua em Cristo',
    favoritePsalm: 'Salmos 150:6',
    badge: currentTier.badge,
    tier: currentTier.tier,
  };

  // Adjust scores depending on timeframe for natural game feel
  const multiplierFactor = timeframe === 'semanal' ? 0.45 : timeframe === 'mensal' ? 0.75 : 1.0;
  
  const allEntries: WorshipRankEntry[] = [
    {
      ...currentUserEntry,
      totalPoints: Math.round(currentUserEntry.totalPoints * (timeframe === 'geral' ? 1 : multiplierFactor)),
      radioMinutes: Math.round(currentUserEntry.radioMinutes * (timeframe === 'geral' ? 1 : multiplierFactor)),
      challengesCompleted: Math.max(1, Math.round(currentUserEntry.challengesCompleted * (timeframe === 'geral' ? 1 : multiplierFactor))),
      meditationMinutes: Math.round(currentUserEntry.meditationMinutes * (timeframe === 'geral' ? 1 : multiplierFactor)),
    },
    ...DEFAULT_FELLOWSHIP_WORSHIPERS.map((fellow) => ({
      ...fellow,
      totalPoints: Math.round(fellow.totalPoints * multiplierFactor),
      radioMinutes: Math.round(fellow.radioMinutes * multiplierFactor),
      challengesCompleted: Math.max(1, Math.round(fellow.challengesCompleted * multiplierFactor)),
      meditationMinutes: Math.round(fellow.meditationMinutes * multiplierFactor),
    })),
  ].sort((a, b) => b.totalPoints - a.totalPoints);

  const filteredEntries = allEntries.filter((entry) =>
    entry.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.favoritePsalm.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const userRankPosition = allEntries.findIndex((e) => e.isCurrentUser) + 1;
  const topThree = allEntries.slice(0, 3);

  // Quick Psalm 150 Proclamation
  const handleQuickProclamation = () => {
    soundService.playVictoryChime();
    const bonus = activeMultiplier ? 100 * activeMultiplier.multiplier : 100;
    
    onUpdateStats((prev) => ({
      ...prev,
      worshipScore: (prev.worshipScore || 0) + bonus,
      completedPraiseChallengesCount: (prev.completedPraiseChallengesCount || 0) + 1,
      fruits: {
        ...prev.fruits,
        alegria: (prev.fruits.alegria || 0) + 5,
        paz: (prev.fruits.paz || 0) + 3,
      },
    }));

    setCelebrationMessage(`+${bonus} Pontos! "Tudo o que tem fôlego louve ao Senhor!" (Sl 150:6)`);
    setTimeout(() => setCelebrationMessage(null), 4000);
  };

  // Start Meditation Session
  const handleStartMeditation = (prompt: MeditationPrompt) => {
    setSelectedMeditation(prompt);
    setMeditationSecondsLeft(prompt.durationMinutes * 60);
    setMeditationTimerActive(true);
    soundService.playAngelicHarpChime();
  };

  // Meditation timer countdown
  useEffect(() => {
    if (!meditationTimerActive || !selectedMeditation) return;

    if (meditationSecondsLeft <= 0) {
      setMeditationTimerActive(false);
      soundService.playVictoryChime();
      const points = activeMultiplier 
        ? Math.round(selectedMeditation.pointsReward * activeMultiplier.multiplier)
        : selectedMeditation.pointsReward;

      onUpdateStats((prev) => ({
        ...prev,
        meditationMinutes: (prev.meditationMinutes || 0) + selectedMeditation.durationMinutes,
        worshipScore: (prev.worshipScore || 0) + points,
        fruits: {
          ...prev.fruits,
          paz: (prev.fruits.paz || 0) + 8,
          longanimidade: (prev.fruits.longanimidade || 0) + 5,
        },
      }));

      setCelebrationMessage(`Meditação Concluída! +${points} Pontos de Adoração & +13 Frutos do Espírito.`);
      setTimeout(() => {
        setSelectedMeditation(null);
        setCelebrationMessage(null);
      }, 5000);
      return;
    }

    const interval = setInterval(() => {
      setMeditationSecondsLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [meditationTimerActive, meditationSecondsLeft, selectedMeditation, activeMultiplier, onUpdateStats]);

  const formatMeditationTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 space-y-8 animate-fade-in text-slate-100">
      
      {/* Celebration Notification Toast */}
      {celebrationMessage && (
        <div className="fixed top-20 right-4 z-50 max-w-md bg-gradient-to-r from-amber-900 to-amber-950 border border-yellow-400/60 text-yellow-200 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce">
          <Sparkles className="w-5 h-5 text-yellow-400 shrink-0" />
          <span className="text-sm font-semibold">{celebrationMessage}</span>
        </div>
      )}

      {/* Hero Header & Biblical Anchor */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/95 to-amber-950/30 border border-amber-500/30 p-6 md:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/4 -mb-12 w-64 h-64 bg-yellow-500/5 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold uppercase tracking-wider">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Gamificação da Adoração Contínua · João 4:23-24</span>
            </div>

            <h1 className="font-cinzel text-2xl md:text-4xl font-bold text-amber-200 tracking-tight flex items-center gap-3">
              Rank de Adoradores
              <span className="text-xl md:text-2xl font-normal text-amber-400/80">
                {currentTier.badge}
              </span>
            </h1>

            <p className="text-slate-300 text-sm md:text-base leading-relaxed">
              "Mas a hora vem, e agora é, em que os verdadeiros adoradores adorarão o Pai em espírito e em verdade; 
              porque o Pai procura a tais que assim o adorem." — <span className="text-amber-300 font-medium">João 4:23</span>
            </p>

            <p className="text-xs text-slate-400 italic">
              "Bendirei o Senhor em todo o tempo; o seu louvor estará continuamente na minha boca." — Salmos 34:1
            </p>
          </div>

          {/* Quick Action Badges */}
          <div className="flex flex-wrap lg:flex-col items-stretch gap-2.5 shrink-0">
            <button
              onClick={onOpenPraiseChallenge}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-xs md:text-sm shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
            >
              <Zap className="w-4 h-4" />
              <span>Desafio dos Salmos</span>
            </button>

            <button
              onClick={handleQuickProclamation}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 border border-amber-500/30 text-amber-300 font-semibold text-xs md:text-sm active:scale-95 transition-all"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Proclamar Sl 150:6 (+100 pts)</span>
            </button>

            {onTuneRadio && (
              <button
                onClick={onTuneRadio}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-amber-300 text-xs transition-all"
              >
                <Radio className="w-3.5 h-3.5 text-amber-400" />
                <span>Sintonizar Rádio 24h</span>
              </button>
            )}
          </div>
        </div>

        {/* Active Multiplier Alert Banner */}
        {activeMultiplier && (
          <div className="mt-6 pt-4 border-t border-amber-500/20 flex flex-wrap items-center justify-between gap-3 bg-amber-500/10 -mx-6 md:-mx-8 -mb-6 md:-mb-8 px-6 md:px-8 py-3 text-xs md:text-sm text-amber-200">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
              <span className="font-bold">Multiplicador Celestial Ativo: {activeMultiplier.multiplier}x</span>
              <span className="hidden sm:inline text-amber-300/80">({activeMultiplier.challengeTitle} · {activeMultiplier.psalmRef})</span>
            </div>
            <span className="text-amber-300 font-semibold bg-amber-950/60 border border-amber-500/30 px-2.5 py-1 rounded-full">
              Pontos de Adoração Turbinados em Tempo Real!
            </span>
          </div>
        )}
      </div>

      {/* User Spotlight Card: Seu Altar de Adoração */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main User Position & Tier Card */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-amber-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-600 to-yellow-400 flex items-center justify-center text-slate-950 text-2xl font-black shadow-lg shadow-amber-500/20 ring-4 ring-amber-500/20 shrink-0">
                #{userRankPosition}
              </div>

              {/* Animated Avatar Frame */}
              <div className="shrink-0">
                <AvatarFrame
                  stats={stats}
                  size="lg"
                  showAura={true}
                  showBadgeChip={true}
                  interactive={!!onOpenAvatarFrames}
                  onClick={onOpenAvatarFrames}
                />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase font-bold text-amber-400 tracking-wider">
                    Sua Posição no Reino
                  </span>
                  {onOpenAvatarFrames && (
                    <button
                      onClick={onOpenAvatarFrames}
                      className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1 transition-colors"
                      title="Personalizar Moldura de Avatar"
                    >
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>Trocar Moldura</span>
                    </button>
                  )}
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    {timeframe === 'geral' ? 'Classificação Geral' : timeframe === 'semanal' ? 'Semana da Gratidão' : 'Mês do Louvor'}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                  Você (Ministro da Graça)
                  <span className="text-base">{currentTier.badge}</span>
                </h3>
                <p className="text-sm text-amber-300 font-medium">
                  {currentTier.label} · <span className="text-slate-400">{currentTier.scriptureAnchor}</span>
                </p>
              </div>
            </div>

            <div className="text-right sm:text-right">
              <div className="text-xs text-slate-400">Pontuação Total</div>
              <div className="text-3xl font-black text-amber-300 tracking-tight font-cinzel">
                {userScore.toLocaleString()} <span className="text-sm font-sans font-normal text-amber-400/80">pts</span>
              </div>
              <div className="text-xs text-emerald-400 flex items-center justify-end gap-1 font-semibold">
                <Flame className="w-3.5 h-3.5" />
                <span>{userStreak} dias de adoração ininterrupta</span>
              </div>
            </div>
          </div>

          {/* Breakdown Stats 3-Pillars */}
          <div className="grid grid-cols-3 gap-3 py-4 border-b border-slate-800 text-center">
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
              <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 mb-1">
                <Radio className="w-3.5 h-3.5 text-sky-400" />
                <span>Rádio Louvor</span>
              </div>
              <div className="text-lg font-bold text-sky-300">{userRadioMinutes} min</div>
              <div className="text-[11px] text-slate-500">+{userRadioMinutes * 10} pts</div>
            </div>

            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
              <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 mb-1">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Desafios Salmos</span>
              </div>
              <div className="text-lg font-bold text-amber-300">{userChallenges} concluídos</div>
              <div className="text-[11px] text-slate-500">+{userChallenges * 150} pts</div>
            </div>

            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
              <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 mb-1">
                <BookOpen className="w-3.5 h-3.5 text-purple-400" />
                <span>Meditação Palavra</span>
              </div>
              <div className="text-lg font-bold text-purple-300">{userMeditationMinutes} min</div>
              <div className="text-[11px] text-slate-500">+{userMeditationMinutes * 20} pts</div>
            </div>
          </div>

          {/* Tier Progress Bar */}
          <div className="pt-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">
                Progresso para o próximo grau:{' '}
                <strong className="text-amber-300">{nextTier ? nextTier.label : 'Grau Máximo Alcançado!'}</strong>
              </span>
              <span className="text-slate-400 font-semibold">
                {nextTier ? `Faltam ${pointsToNext.toLocaleString()} pts` : 'Santo dos Santos'}
              </span>
            </div>

            <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden p-0.5 border border-slate-800">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300 rounded-full transition-all duration-500"
                style={{ width: `${tierProgressPercent}%` }}
              ></div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>{currentTier.label} ({currentTier.minPoints} pts)</span>
              <span>{nextTier ? `${nextTier.label} (${nextTier.minPoints} pts)` : 'Infinito'}</span>
            </div>
          </div>
        </div>

        {/* Biblical Fellowship & Tier Details Explainer */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                <span>Graus de Consagração</span>
              </h4>
              <button
                onClick={() => setIsTierInfoOpen(!isTierInfoOpen)}
                className="text-xs text-slate-400 hover:text-amber-300 underline"
              >
                {isTierInfoOpen ? 'Recolher' : 'Ver Todos'}
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              O Rank de Adoradores não é disputa humana, mas <strong>estímulo mútuo à santidade e à gratidão</strong> (Hebreus 10:24). 
              A cada minuto de rádio louvor, salmo proclamado ou meditação silenciosa, sua vida se alinha à vontade do Pai.
            </p>

            {/* Quick Tier Mini List */}
            <div className="mt-4 space-y-2">
              {tiersList.map((tier) => {
                const isCurrent = tier.tier === currentTier.tier;
                return (
                  <div
                    key={tier.tier}
                    className={`flex items-center justify-between p-2 rounded-xl text-xs border transition-colors ${
                      isCurrent 
                        ? 'bg-amber-500/15 border-amber-500/40 text-amber-200' 
                        : 'bg-slate-950/40 border-slate-800/80 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{tier.badge}</span>
                      <span className={`font-semibold ${isCurrent ? 'text-amber-300' : 'text-slate-300'}`}>
                        {tier.label}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">
                      {tier.minPoints.toLocaleString()}+ pts
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 text-center">
            <span className="text-xs text-amber-300/90 italic">
              "A alegria do SENHOR é a vossa força." — Neemias 8:10
            </span>
          </div>
        </div>

      </div>

      {/* Guided Biblical Meditation Interactive Hub */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-semibold uppercase">
              <BookOpen className="w-3.5 h-3.5 text-purple-400" />
              <span>Pausa da Alma & Contemplação</span>
            </div>
            <h3 className="text-lg md:text-xl font-bold text-slate-100 mt-1">
              Meditação Guiada na Palavra de Deus
            </h3>
            <p className="text-xs md:text-sm text-slate-400">
              Aquiete o coração diante de Deus e ganhe pontos de adoração e frutos do Espírito (Salmos 46:10).
            </p>
          </div>

          {selectedMeditation && meditationTimerActive && (
            <div className="flex items-center gap-3 bg-purple-950/80 border border-purple-500/40 px-4 py-2.5 rounded-2xl animate-pulse">
              <Clock className="w-5 h-5 text-purple-300" />
              <div>
                <div className="text-[10px] uppercase font-bold text-purple-300">Em Meditação Contínua</div>
                <div className="text-lg font-mono font-bold text-purple-200">
                  {formatMeditationTime(meditationSecondsLeft)}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Active Meditation In-Progress Modal / Banner */}
        {selectedMeditation && (
          <div className="bg-gradient-to-br from-purple-950/50 to-slate-950 border border-purple-500/30 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">
                {selectedMeditation.scriptureRef} · {selectedMeditation.durationMinutes} Minuto(s)
              </span>
              <button
                onClick={() => {
                  setMeditationTimerActive(false);
                  setSelectedMeditation(null);
                }}
                className="text-xs text-slate-400 hover:text-slate-200"
              >
                Cancelar Meditação
              </button>
            </div>

            <h4 className="text-lg font-bold text-purple-200">{selectedMeditation.title}</h4>
            <p className="text-sm italic text-purple-100/90 bg-purple-900/30 p-3 rounded-xl border border-purple-500/20">
              "{selectedMeditation.verseText}"
            </p>

            <div className="space-y-2">
              <span className="text-xs font-semibold text-purple-300">Passos de Contemplação:</span>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {selectedMeditation.contemplationGuide.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-purple-400 font-bold">•</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-200 font-semibold text-center">
              Declaração de Fé: "{selectedMeditation.prayerDeclaration}"
            </div>
          </div>
        )}

        {/* Meditation Selection Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {MEDITATION_SESSIONS.map((session) => (
            <div 
              key={session.id}
              className="bg-slate-950/70 border border-slate-800 hover:border-purple-500/50 rounded-2xl p-4 transition-all hover:shadow-lg hover:shadow-purple-500/10 flex flex-col justify-between group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30 font-semibold">
                    {session.durationMinutes} min
                  </span>
                  <span className="text-amber-400 font-semibold">+{session.pointsReward} pts</span>
                </div>

                <h4 className="font-bold text-slate-200 group-hover:text-purple-300 transition-colors text-sm">
                  {session.title}
                </h4>

                <p className="text-[11px] text-slate-400 font-mono">
                  {session.scriptureRef}
                </p>

                <p className="text-xs text-slate-400 line-clamp-2">
                  {session.verseText}
                </p>
              </div>

              <button
                onClick={() => handleStartMeditation(session)}
                className="mt-4 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600 text-purple-200 hover:text-white text-xs font-semibold border border-purple-500/30 transition-all active:scale-95"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Iniciar ({session.durationMinutes}m)</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Leaderboard Table Controls & Filtering */}
      <div className="space-y-4">
        
        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-2">
          
          {/* Timeframe Tabs */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 gap-1">
            <button
              onClick={() => {
                setTimeframe('semanal');
                soundService.playDecreeClick();
              }}
              className={`px-4 py-2 rounded-lg text-xs md:text-sm font-semibold transition-all ${
                timeframe === 'semanal'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Semanal (Atual)
            </button>
            <button
              onClick={() => {
                setTimeframe('mensal');
                soundService.playDecreeClick();
              }}
              className={`px-4 py-2 rounded-lg text-xs md:text-sm font-semibold transition-all ${
                timeframe === 'mensal'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Mensal
            </button>
            <button
              onClick={() => {
                setTimeframe('geral');
                soundService.playDecreeClick();
              }}
              className={`px-4 py-2 rounded-lg text-xs md:text-sm font-semibold transition-all ${
                timeframe === 'geral'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Histórico Geral
            </button>
          </div>

          {/* Search Saints Filter */}
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar por nome ou título..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 bg-slate-900/90 border border-slate-800 focus:border-amber-500/50 rounded-xl px-4 py-2 text-xs text-slate-200 placeholder-slate-500 outline-none transition-all"
            />
          </div>

        </div>

        {/* Podium Top 3 Cards for Visual Delight */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {topThree.map((entry, index) => {
            const isFirst = index === 0;
            const isSecond = index === 1;
            const isThird = index === 2;

            const podiumColors = isFirst
              ? 'border-yellow-400/50 bg-gradient-to-b from-yellow-500/15 to-slate-900 shadow-yellow-500/10'
              : isSecond
              ? 'border-slate-300/40 bg-gradient-to-b from-slate-400/10 to-slate-900 shadow-slate-400/10'
              : 'border-amber-700/50 bg-gradient-to-b from-amber-700/10 to-slate-900 shadow-amber-700/10';

            const crownIcon = isFirst ? '👑' : isSecond ? '🥈' : '🥉';

            return (
              <div 
                key={entry.id}
                className={`relative rounded-2xl p-5 border shadow-xl flex flex-col justify-between space-y-3 ${podiumColors} ${
                  entry.isCurrentUser ? 'ring-2 ring-amber-400' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-lg font-bold text-amber-300">
                      {crownIcon}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-100">
                          {entry.name}
                        </span>
                        {entry.isCurrentUser && (
                          <span className="text-[10px] px-1.5 py-0.2 bg-amber-500 text-slate-950 font-black rounded-full">
                            VOCÊ
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 block">{entry.title}</span>
                    </div>
                  </div>

                  <span className="text-sm">{entry.badge}</span>
                </div>

                <div className="bg-slate-950/60 rounded-xl p-2.5 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Pontos de Adoração:</span>
                    <strong className="text-amber-300 font-cinzel font-bold">{entry.totalPoints.toLocaleString()}</strong>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>{entry.radioMinutes}m rádio · {entry.challengesCompleted} salmos</span>
                    <span className="text-emerald-400">{entry.streakDays}d streak</span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 italic">
                  "{entry.recentActivity}"
                </div>
              </div>
            );
          })}
        </div>

        {/* Detailed Leaderboard Table */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs md:text-sm">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase text-[11px]">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">Rank</th>
                  <th className="py-3 px-4">Adorador / Ministro</th>
                  <th className="py-3 px-4 hidden sm:table-cell">Grau Espiritual</th>
                  <th className="py-3 px-4 text-center hidden md:table-cell">Rádio 24h</th>
                  <th className="py-3 px-4 text-center hidden md:table-cell">Desafios</th>
                  <th className="py-3 px-4 text-center hidden lg:table-cell">Meditação</th>
                  <th className="py-3 px-4 text-right">Total Pontos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredEntries.map((entry, index) => {
                  const rank = index + 1;
                  const isCurrent = !!entry.isCurrentUser;

                  return (
                    <tr
                      key={entry.id}
                      className={`transition-colors ${
                        isCurrent
                          ? 'bg-amber-500/15 hover:bg-amber-500/20 font-semibold text-slate-100 ring-1 ring-amber-500/30'
                          : 'hover:bg-slate-850/40 text-slate-300'
                      }`}
                    >
                      {/* Rank Position */}
                      <td className="py-3.5 px-4 text-center font-bold">
                        {rank === 1 ? (
                          <span className="text-yellow-400 font-black">#1</span>
                        ) : rank === 2 ? (
                          <span className="text-slate-300 font-black">#2</span>
                        ) : rank === 3 ? (
                          <span className="text-amber-600 font-black">#3</span>
                        ) : (
                          <span className="text-slate-500 font-mono">#{rank}</span>
                        )}
                      </td>

                      {/* Name & Title */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {isCurrent ? (
                            <div className="shrink-0">
                              <AvatarFrame
                                stats={stats}
                                size="xs"
                                showAura={false}
                                showBadgeChip={false}
                              />
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs bg-slate-800 text-slate-300 shrink-0">
                              {entry.avatarInitial}
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`font-semibold ${isCurrent ? 'text-amber-300 font-bold' : 'text-slate-100'}`}>
                                {entry.name}
                              </span>
                              {isCurrent && (
                                <span className="text-[10px] px-1.5 py-0.2 bg-amber-500 text-slate-950 font-black rounded-full">
                                  VOCÊ
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-slate-400 block">{entry.recentActivity}</span>
                          </div>
                        </div>
                      </td>

                      {/* Tier Badge */}
                      <td className="py-3.5 px-4 hidden sm:table-cell">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950/80 border border-slate-800 text-xs text-amber-300">
                          <span>{entry.badge}</span>
                          <span>{entry.title}</span>
                        </span>
                      </td>

                      {/* Radio Listening */}
                      <td className="py-3.5 px-4 text-center hidden md:table-cell font-mono text-slate-400">
                        {entry.radioMinutes} min
                      </td>

                      {/* Challenges Completed */}
                      <td className="py-3.5 px-4 text-center hidden md:table-cell font-mono text-slate-400">
                        {entry.challengesCompleted} salmos
                      </td>

                      {/* Meditation Time */}
                      <td className="py-3.5 px-4 text-center hidden lg:table-cell font-mono text-slate-400">
                        {entry.meditationMinutes} min
                      </td>

                      {/* Total Points */}
                      <td className="py-3.5 px-4 text-right font-cinzel font-bold text-amber-300 text-sm md:text-base">
                        {entry.totalPoints.toLocaleString()} <span className="text-xs font-sans text-amber-400/80">pts</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredEntries.length === 0 && (
            <div className="p-8 text-center text-slate-500 space-y-2">
              <HelpCircle className="w-8 h-8 mx-auto text-slate-600" />
              <p>Nenhum adorador encontrado para "{searchQuery}".</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
