/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  TRAINING_SCENARIOS,
  BIBLICAL_WEAPONS,
  SPIRITUAL_COMMANDS,
} from '../data/biblicalContent';
import {
  TrainingScenario,
  BiblicalWeapon,
  SpiritualCommand,
  PlayerStats,
  MinistryDayActivity,
} from '../types/game';
import { soundService } from '../services/soundEffects';
import {
  Shield,
  Flame,
  Volume2,
  VolumeX,
  Sparkles,
  Zap,
  Lock,
  Scissors,
  Gavel,
  BookOpen,
  CheckCircle2,
  Award,
  Crown,
  Cross,
  RefreshCw,
  Play,
  ArrowRight,
  Info,
  Check,
} from 'lucide-react';

interface TrainingGroundViewProps {
  stats: PlayerStats;
  onUpdateStats: (newStats: PlayerStats) => void;
  onNavigateToCommands?: () => void;
}

interface CompletedSimulation {
  id: string;
  scenarioId: string;
  scenarioTitle: string;
  weaponName: string;
  commandTitle: string;
  synergyLevel: 'perfeita' | 'forte' | 'biblica';
  timestamp: string;
}

export const TrainingGroundView: React.FC<TrainingGroundViewProps> = ({
  stats,
  onUpdateStats,
  onNavigateToCommands,
}) => {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(
    TRAINING_SCENARIOS[0].id
  );
  const [selectedWeaponId, setSelectedWeaponId] = useState<string>(
    BIBLICAL_WEAPONS[0].id
  );
  const [selectedCommandId, setSelectedCommandId] = useState<string>(
    SPIRITUAL_COMMANDS[0].id
  );

  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [victoryResult, setVictoryResult] = useState<{
    scenario: TrainingScenario;
    weapon: BiblicalWeapon;
    command: SpiritualCommand;
    synergyScore: number;
    synergyRating: 'perfeita' | 'forte' | 'biblica';
    synergyDescription: string;
  } | null>(null);

  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [history, setHistory] = useState<CompletedSimulation[]>([]);
  const [copiedDeclaration, setCopiedDeclaration] = useState<boolean>(false);

  const currentScenario =
    TRAINING_SCENARIOS.find((s) => s.id === selectedScenarioId) ||
    TRAINING_SCENARIOS[0];
  const currentWeapon =
    BIBLICAL_WEAPONS.find((w) => w.id === selectedWeaponId) ||
    BIBLICAL_WEAPONS[0];
  const currentCommand =
    SPIRITUAL_COMMANDS.find((c) => c.id === selectedCommandId) ||
    SPIRITUAL_COMMANDS[0];

  // Calculate synergy between Scenario, Weapon, and Command
  const calculateSynergy = (
    scenario: TrainingScenario,
    weapon: BiblicalWeapon,
    command: SpiritualCommand
  ) => {
    let score = 75; // baseline biblical authority
    const isRecommendedWeapon = scenario.recommendedWeaponId === weapon.id;
    const isRecommendedCommand = scenario.recommendedCommandId === command.id;

    if (isRecommendedWeapon) score += 15;
    if (isRecommendedCommand) score += 10;

    let rating: 'perfeita' | 'forte' | 'biblica' = 'biblica';
    let description = '';

    if (score >= 95) {
      rating = 'perfeita';
      description = `Combinação de máxima autoridade revelada! O poder de "${weapon.name}" com o decreto "${command.title}" atinge exatamente o ponto vulnerável de ${scenario.principalityName}.`;
    } else if (score >= 85) {
      rating = 'forte';
      description = `Alinhamento bíblico vigoroso! "${weapon.name}" neutraliza o ataque, enquanto o decreto em Nome de Jesus estabelece a paz e a ordem celestial.`;
    } else {
      rating = 'biblica';
      description = `Todo decreto fundado na Palavra de Deus em Nome de Jesus é eficaz contra as trevas, pois Cristo já triunfou sobre todo principado na Cruz!`;
    }

    return { score, rating, description };
  };

  const currentSynergy = calculateSynergy(
    currentScenario,
    currentWeapon,
    currentCommand
  );

  const handleExecuteTraining = () => {
    setIsSimulating(true);
    soundService.playCelestialDecreeSound();
    soundService.playYokeBrokenSound();

    setTimeout(() => {
      soundService.playAngelicHarpChime();
      setIsSimulating(false);
      setVictoryResult({
        scenario: currentScenario,
        weapon: currentWeapon,
        command: currentCommand,
        synergyScore: currentSynergy.score,
        synergyRating: currentSynergy.rating,
        synergyDescription: currentSynergy.description,
      });

      // Update simulation history
      const newEntry: CompletedSimulation = {
        id: `sim-${Date.now()}`,
        scenarioId: currentScenario.id,
        scenarioTitle: currentScenario.schemeTitle,
        weaponName: currentWeapon.name,
        commandTitle: currentCommand.title,
        synergyLevel: currentSynergy.rating,
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
      };
      setHistory((prev) => [newEntry, ...prev.slice(0, 5)]);

      // Speak victory declaration
      setIsSpeaking(true);
      soundService.speakText(currentScenario.victoryDeclaration, () =>
        setIsSpeaking(false)
      );

      // Update global ministry stats
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
            decretos: item.decretos + 1,
            jugosQuebrados: item.jugosQuebrados + 1,
          };
        }
        return item;
      });

      onUpdateStats({
        ...stats,
        strongmanBoundCount: (stats.strongmanBoundCount || 0) + 1,
        proclaimedDecreesCount: stats.proclaimedDecreesCount + 1,
        angelicAidInvokedCount: (stats.angelicAidInvokedCount || 0) + 1,
        dailyProgress: updatedDaily,
        fruits: {
          ...stats.fruits,
          fidelidade: stats.fruits.fidelidade + 10,
          paz: stats.fruits.paz + 8,
          dominioProprio: stats.fruits.dominioProprio + 8,
        },
      });
    }, 1200);
  };

  const handleCopyDeclaration = (text: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedDeclaration(true);
      setTimeout(() => setCopiedDeclaration(false), 2000);
    }
  };

  const getWeaponIcon = (iconName: BiblicalWeapon['iconName']) => {
    switch (iconName) {
      case 'cross':
        return <Cross className="w-5 h-5 text-rose-400" />;
      case 'sword':
        return <Flame className="w-5 h-5 text-amber-400" />;
      case 'shield':
        return <Shield className="w-5 h-5 text-sky-400" />;
      case 'crown':
        return <Crown className="w-5 h-5 text-amber-300" />;
      case 'armor':
        return <Shield className="w-5 h-5 text-indigo-400" />;
      case 'flame':
        return <Zap className="w-5 h-5 text-emerald-400" />;
      default:
        return <Shield className="w-5 h-5 text-amber-400" />;
    }
  };

  const getCommandVerbIcon = (verb: SpiritualCommand['actionVerb']) => {
    switch (verb) {
      case 'amarrar':
        return <Lock className="w-4 h-4 text-amber-400" />;
      case 'desarmar':
        return <Scissors className="w-4 h-4 text-sky-400" />;
      case 'amordaçar':
        return <VolumeX className="w-4 h-4 text-rose-400" />;
      case 'uncao_quebra_jugo':
        return <Zap className="w-4 h-4 text-amber-300" />;
      case 'executar_juizo':
        return <Gavel className="w-4 h-4 text-purple-400" />;
      default:
        return <Shield className="w-4 h-4 text-amber-400" />;
    }
  };

  const getCategoryBadge = (cat: TrainingScenario['category']) => {
    switch (cat) {
      case 'principados':
        return { label: 'Principado', color: 'bg-purple-950/70 border-purple-500/30 text-purple-300' };
      case 'potestades':
        return { label: 'Potestade', color: 'bg-rose-950/70 border-rose-500/30 text-rose-300' };
      case 'príncipes_das_trevas':
        return { label: 'Príncipe das Trevas', color: 'bg-slate-900 border-slate-700 text-slate-300' };
      case 'hostes_da_maldade':
        return { label: 'Hostes da Maldade', color: 'bg-amber-950/70 border-amber-500/30 text-amber-300' };
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Intro Banner */}
      <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-br from-slate-950 via-indigo-950/50 to-slate-900 border border-amber-500/30 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wider uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Simulador de Combate da Fé · Efésios 6:10-18
              </span>
              <span className="text-xs text-slate-400">· 2 Coríntios 10:4-5</span>
            </div>
            <h2 className="font-cinzel text-2xl md:text-3xl font-bold text-white tracking-wide">
              Campo de Treinamento contra Principados
            </h2>
            <p className="text-slate-300 text-xs md:text-sm max-w-3xl leading-relaxed">
              "Pois não temos de lutar contra a carne e o sangue, mas contra os principados, potestades e príncipes deste mundo tenebroso."
              Equipe-se com a <strong>Arma Bíblica</strong> forjada na verdade e empunhe a <strong>Voz de Comando</strong> em Nome de Jesus para experimentar a derrota do opressor!
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
            <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-slate-400">Vitórias Praticadas:</p>
              <p className="font-cinzel text-xl font-bold text-amber-300 tabular-nums">
                {stats.strongmanBoundCount || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Scenario Selector Ribbon */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span className="font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            1. Selecione o Cenário de Opressão Espiritual
          </span>
          <span>{TRAINING_SCENARIOS.length} Cenários Bíblicos Disponíveis</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {TRAINING_SCENARIOS.map((scen) => {
            const isSelected = scen.id === selectedScenarioId;
            const badge = getCategoryBadge(scen.category);

            return (
              <button
                key={scen.id}
                onClick={() => {
                  setSelectedScenarioId(scen.id);
                  setVictoryResult(null);
                  soundService.playScriptureTone();
                }}
                className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between space-y-2.5 group ${
                  isSelected
                    ? 'bg-slate-900 border-amber-400/80 ring-2 ring-amber-400/30 shadow-lg shadow-amber-500/5'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border ${badge.color}`}
                    >
                      {badge.label}
                    </span>
                    {isSelected && (
                      <span className="flex items-center gap-1 text-[11px] text-amber-400 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Alvo Ativo
                      </span>
                    )}
                  </div>

                  <h3 className="font-cinzel text-sm font-bold text-slate-100 group-hover:text-amber-200 transition-colors">
                    {scen.schemeTitle}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {scen.principalityName}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="truncate">{scen.oppressionSign}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Interactive Battle Arena Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: The Threat Profile (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-semibold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                <Shield className="w-4 h-4" />
                Diagnóstico Espiritual do Inimigo
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-rose-950/60 border border-rose-500/30 text-rose-300">
                Alvo em Foco
              </span>
            </div>

            <div className="space-y-2">
              <span className="text-xs text-slate-400 font-medium">Entidade Opressora:</span>
              <h3 className="font-cinzel text-lg md:text-xl font-bold text-slate-100">
                {currentScenario.principalityName}
              </h3>
              <p className="text-xs text-amber-400 font-medium">
                {currentScenario.schemeTitle}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/90 space-y-2 text-xs">
              <p className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-rose-400" />
                Estratégia e Cilada das Trevas:
              </p>
              <p className="text-slate-400 leading-relaxed">
                {currentScenario.schemeDescription}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/90 space-y-2 text-xs">
              <p className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Sintoma de Opressão na Vítima:
              </p>
              <p className="text-slate-400 leading-relaxed">
                {currentScenario.oppressionSign}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/90 space-y-1.5 text-xs">
              <p className="font-semibold text-sky-300 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-sky-400" />
                Promessa Bíblica de Vitória:
              </p>
              <p className="text-slate-300 italic leading-relaxed">
                {currentScenario.scriptureTarget}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/20 space-y-1.5 text-xs">
              <p className="font-semibold text-indigo-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                Visão Teológica do Confronto:
              </p>
              <p className="text-slate-300 leading-relaxed">
                {currentScenario.theologicalInsight}
              </p>
            </div>
          </div>

          {/* Quick tips box */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-400 space-y-2">
            <p className="font-semibold text-amber-300 flex items-center gap-1.5">
              <Check className="w-4 h-4 text-amber-400" />
              Regra de Ouro do Combate (Tiago 4:7):
            </p>
            <p className="leading-relaxed">
              "Sujeitai-vos, pois, a Deus, resisti ao diabo, e ele fugirá de vós." Toda autoridade legítima
              flui da dependência do Espírito Santo e do Nome precioso de Jesus Cristo.
            </p>
          </div>
        </div>

        {/* Right Column: Weapon & Command Selection + Battle Proclamation (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Step 2: Choose Biblical Weapon */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Shield className="w-4 h-4" />
                2. Escolha a Arma Bíblica da Armadura
              </span>
              <span className="text-[11px] text-slate-400">Armadura de Deus (Efésios 6)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {BIBLICAL_WEAPONS.map((wpn) => {
                const isSelected = wpn.id === selectedWeaponId;
                const isRecommended = currentScenario.recommendedWeaponId === wpn.id;

                return (
                  <button
                    key={wpn.id}
                    onClick={() => {
                      setSelectedWeaponId(wpn.id);
                      setVictoryResult(null);
                      soundService.playScriptureTone();
                    }}
                    className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between space-y-2 ${
                      isSelected
                        ? 'bg-slate-950 border-amber-400 ring-2 ring-amber-400/30 shadow-md'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 shrink-0">
                          {getWeaponIcon(wpn.iconName)}
                        </div>
                        <div>
                          <h4 className="font-cinzel text-xs font-bold text-slate-100">
                            {wpn.name}
                          </h4>
                          <span className="text-[10px] text-amber-400 font-medium">
                            {wpn.scriptureRef}
                          </span>
                        </div>
                      </div>

                      {isRecommended && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] uppercase font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 whitespace-nowrap">
                          Ideal
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {wpn.spiritualPower}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 3: Choose Spiritual Command */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-semibold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                <Zap className="w-4 h-4" />
                3. Escolha a Voz de Comando em Nome de Jesus
              </span>
              <span className="text-[11px] text-slate-400">Decreto de Fé (Mt 12:29 & Cl 2:15)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SPIRITUAL_COMMANDS.map((cmd) => {
                const isSelected = cmd.id === selectedCommandId;
                const isRecommended = currentScenario.recommendedCommandId === cmd.id;

                return (
                  <button
                    key={cmd.id}
                    onClick={() => {
                      setSelectedCommandId(cmd.id);
                      setVictoryResult(null);
                      soundService.playScriptureTone();
                    }}
                    className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between space-y-2 ${
                      isSelected
                        ? 'bg-slate-950 border-sky-400 ring-2 ring-sky-400/30 shadow-md'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 shrink-0">
                          {getCommandVerbIcon(cmd.actionVerb)}
                        </div>
                        <div>
                          <h4 className="font-cinzel text-xs font-bold text-slate-100">
                            {cmd.title}
                          </h4>
                          <span className="text-[10px] text-sky-400 font-medium">
                            {cmd.scriptureRef}
                          </span>
                        </div>
                      </div>

                      {isRecommended && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] uppercase font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30 whitespace-nowrap">
                          Ideal
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      "{cmd.commandText.slice(0, 110)}..."
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Synergy Analysis & Action Bar */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/60 border border-amber-500/30 shadow-2xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                  Análise da Eficácia Espiritual
                </span>
                <h4 className="font-cinzel text-base font-bold text-white">
                  Sinergia da Proclamação da Fé
                </h4>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Grau de Alinhamento:</span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                    currentSynergy.rating === 'perfeita'
                      ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
                      : currentSynergy.rating === 'forte'
                      ? 'bg-amber-950/80 border-amber-500/40 text-amber-300'
                      : 'bg-sky-950/80 border-sky-500/40 text-sky-300'
                  }`}
                >
                  {currentSynergy.score}% · {currentSynergy.rating.toUpperCase()}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
              {currentSynergy.description}
            </p>

            {/* Proclamation Button */}
            <button
              onClick={handleExecuteTraining}
              disabled={isSimulating}
              className={`w-full py-4 px-6 rounded-xl font-bold font-cinzel text-sm md:text-base tracking-wide flex items-center justify-center gap-3 transition-all shadow-xl active:scale-95 ${
                isSimulating
                  ? 'bg-amber-600/50 text-amber-200 cursor-wait'
                  : 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 hover:from-amber-400 hover:to-amber-300 hover:shadow-amber-500/20'
              }`}
            >
              {isSimulating ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Executando Juízo e Quebrando Grilhões...</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-slate-950" />
                  <span>Proclamar Vitória em Nome de Jesus Cristo</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* VICTORY REVELATION CHAMBER (When simulation is executed) */}
      {victoryResult && (
        <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-r from-slate-950 via-emerald-950/40 to-slate-950 border-2 border-emerald-500/50 shadow-2xl space-y-6 animate-scaleUp">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-emerald-500/20">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                  Vitória Consumada na Cruz do Calvário
                </span>
                <h3 className="font-cinzel text-xl md:text-2xl font-bold text-white">
                  {victoryResult.scenario.principalityName} Manietado!
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopyDeclaration(victoryResult.scenario.victoryDeclaration)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-700 hover:border-emerald-400 text-xs text-slate-200 transition-colors"
              >
                {copiedDeclaration ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copiado!</span>
                  </>
                ) : (
                  <>
                    <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                    <span>Copiar Declaração</span>
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  if (isSpeaking) {
                    soundService.stopSpeaking();
                    setIsSpeaking(false);
                  } else {
                    setIsSpeaking(true);
                    soundService.speakText(victoryResult.scenario.victoryDeclaration, () =>
                      setIsSpeaking(false)
                    );
                  }
                }}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg border text-xs font-semibold transition-all ${
                  isSpeaking
                    ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                    : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30'
                }`}
              >
                {isSpeaking ? (
                  <>
                    <VolumeX className="w-3.5 h-3.5" />
                    <span>Parar Voz</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Ouvir em Voz Alta</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Proclamation Quote */}
          <div className="p-5 rounded-xl bg-slate-950/90 border border-emerald-500/30 space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Declaração de Triunfo Proclamada no Tribunal Celeste:
            </span>
            <p className="font-cinzel text-sm md:text-base text-slate-100 leading-relaxed font-semibold">
              "{victoryResult.scenario.victoryDeclaration}"
            </p>
          </div>

          {/* Reward & Stat Impact Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-1">
              <span className="text-slate-400 font-medium">Arma Utilizada:</span>
              <p className="font-bold text-amber-300">{victoryResult.weapon.name}</p>
              <p className="text-[11px] text-slate-500">{victoryResult.weapon.scriptureRef}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-1">
              <span className="text-slate-400 font-medium">Comando Decretado:</span>
              <p className="font-bold text-sky-300">{victoryResult.command.title}</p>
              <p className="text-[11px] text-slate-500">{victoryResult.command.scriptureRef}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-1">
              <span className="text-slate-400 font-medium">Recompensa Espiritual:</span>
              <p className="font-bold text-emerald-300">+10 Fidelidade · +8 Paz · +8 Domínio</p>
              <p className="text-[11px] text-slate-500">1 Jugo Quebrado adicionado ao Ministério</p>
            </div>
          </div>
        </div>
      )}

      {/* History of Completed Simulations */}
      {history.length > 0 && (
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
            <span className="font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-400" />
              Histórico Recente de Treinamentos Espirituais
            </span>
            <span className="text-slate-500">{history.length} Simulações Registradas</span>
          </div>

          <div className="space-y-2">
            {history.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className="p-1 rounded bg-emerald-950/60 border border-emerald-500/30 text-emerald-400">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                  <div>
                    <span className="font-semibold text-slate-200">{item.scenarioTitle}</span>
                    <span className="text-slate-500 ml-2">
                      ({item.weaponName} + {item.commandTitle})
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-slate-400 shrink-0">
                  <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                    {item.synergyLevel}
                  </span>
                  <span className="text-[11px] text-slate-500">{item.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Navigation Footer */}
      {onNavigateToCommands && (
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <span className="text-slate-400">
            Deseja proclamar as 5 Vozes de Comando diretamente no altar ministerial ou analisar os gráficos diários?
          </span>
          <button
            onClick={onNavigateToCommands}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold transition-all shrink-0 self-start sm:self-auto"
          >
            <span>Ir para Vozes de Comando & Gráfico</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
